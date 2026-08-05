"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import type { Invoice, Client, CompanySettings, DashboardStats, UserRole, UserProfile } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { checkInvoiceQuota, checkClientQuota } from "@/lib/quotas";
import { getTenantQuota, type TenantQuota } from "@/lib/tenantQuotas";

interface AppContextType {
  invoices: Invoice[];
  clients: Client[];
  companySettings: CompanySettings;
  stats: DashboardStats;
  loading: boolean;
  userRole: UserRole;
  userProfile: UserProfile | null;
  tenantQuota: TenantQuota | null;
  quotaLoading: boolean;
  refreshTenantQuota: () => Promise<void>;
  addInvoice: (invoice: Omit<Invoice, "id" | "created_at" | "updated_at">) => Promise<Invoice>;
  updateInvoice: (id: string, updates: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  addClient: (client: Omit<Client, "id" | "created_at" | "updated_at">) => Promise<Client>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<CompanySettings>) => Promise<void>;
  refreshData: () => Promise<void>;
}

const defaultCompanySettings: CompanySettings = {
  id: "setting-001",
  user_id: "user-001",
  company_name: "Mon Entreprise",
  company_address: "",
  company_phone: "",
  company_email: "",
  company_logo_url: null,
  tax_id: "",
  default_tax_rate: 18.0,
  currency: "FCFA",
  invoice_prefix: "FAC",
  next_invoice_number: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [companySettings, setCompanySettings] = useState<CompanySettings>(defaultCompanySettings);
  const [userRole, setUserRole] = useState<UserRole>('owner');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [tenantQuota, setTenantQuota] = useState<TenantQuota | null>(null);
  const [quotaLoading, setQuotaLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const refreshTenantQuota = useCallback(async () => {
    if (!userId) return;
    setQuotaLoading(true);
    const q = await getTenantQuota(userId);
    setTenantQuota(q);
    setQuotaLoading(false);
  }, [userId]);

  // Fetch all real data from Supabase DB
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.id);

      // 0. Fetch User Profile and Role
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, role')
        .eq('id', user.id)
        .maybeSingle();

      if (profileData) {
        setUserRole((profileData.role as UserRole) || 'owner');
        setUserProfile(profileData as UserProfile);
      } else {
        setUserRole('owner');
      }

      // 1. Fetch Real Clients from Supabase
      const { data: clientsData } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (clientsData) {
        setClients(clientsData);
      }

      // 2. Fetch Real Company Settings from Supabase
      const { data: settingsData } = await supabase
        .from('company_settings')
        .select('*')
        .maybeSingle();

      if (settingsData) {
        setCompanySettings(settingsData);
      } else {
        // Auto-create settings record if not found
        const { data: newSettings } = await supabase
          .from('company_settings')
          .insert({
            user_id: user.id,
            company_name: user.user_metadata?.company_name || 'Mon Entreprise',
            company_email: user.email,
          })
          .select()
          .single();
        if (newSettings) {
          setCompanySettings(newSettings);
        }
      }

      // 3. Fetch Real Invoices with Items & Clients from Supabase
      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('*, items:invoice_items(*), client:clients(*)')
        .order('created_at', { ascending: false });

      if (invoicesData) {
        setInvoices(invoicesData);
      }

      // 4. Fetch Tenant Quotas
      setQuotaLoading(true);
      const q = await getTenantQuota(user.id);
      setTenantQuota(q);
      setQuotaLoading(false);
    } catch (err) {
      console.warn("Supabase data fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();

    // Listen for Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchData();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchData, supabase]);

  // Compute stats dynamically from real invoices
  const stats: DashboardStats = {
    totalInvoices: invoices.length,
    totalAmount: invoices.reduce((acc, inv) => acc + (inv.total || 0), 0),
    paidAmount: invoices
      .filter((inv) => inv.status === "payee")
      .reduce((acc, inv) => acc + (inv.total || 0), 0),
    pendingAmount: invoices
      .filter((inv) => inv.status === "envoyee")
      .reduce((acc, inv) => acc + (inv.total || 0), 0),
    overdueAmount: invoices
      .filter((inv) => inv.status === "en_retard")
      .reduce((acc, inv) => acc + (inv.total || 0), 0),
    draftCount: invoices.filter((inv) => inv.status === "brouillon").length,
    sentCount: invoices.filter((inv) => inv.status === "envoyee").length,
    paidCount: invoices.filter((inv) => inv.status === "payee").length,
    overdueCount: invoices.filter((inv) => inv.status === "en_retard").length,
  };

  async function addInvoice(newInvData: Omit<Invoice, "id" | "created_at" | "updated_at">): Promise<Invoice> {
    if (userId) {
      const quotaCheck = await checkInvoiceQuota(userId);
      if (!quotaCheck.allowed) {
        throw new Error(quotaCheck.error || "Limite de factures atteinte.");
      }
    }

    const tempId = `inv-${Date.now()}`;
    const now = new Date().toISOString();
    const newInvoice: Invoice = {
      ...newInvData,
      id: tempId,
      created_at: now,
      updated_at: now,
    };

    // Immediate UI update
    setInvoices((prev) => [newInvoice, ...prev]);

    if (userId) {
      try {
        const { data: dbInvoice, error: invErr } = await supabase
          .from('invoices')
          .insert({
            user_id: userId,
            tenant_id: userId,
            client_id: newInvData.client_id || null,
            invoice_number: newInvData.invoice_number,
            status: newInvData.status,
            issue_date: newInvData.issue_date,
            due_date: newInvData.due_date,
            subtotal: newInvData.subtotal,
            tax_rate: newInvData.tax_rate,
            tax_amount: newInvData.tax_amount,
            total: newInvData.total,
            notes: newInvData.notes || null,
          })
          .select()
          .single();

        if (invErr) {
          setInvoices((prev) => prev.filter((i) => i.id !== tempId));
          console.error("Error inserting invoice into Supabase:", invErr);
          const errStr = (invErr.message || '') + (invErr.details || '') + (invErr.hint || '');
          if (errStr.includes('QUOTA_DEPASSE') || invErr.code === 'P0001') {
            throw new Error('QUOTA_DEPASSE');
          }
          if (invErr.code === '42501' || errStr.toLowerCase().includes('row-level security') || errStr.toLowerCase().includes('rls')) {
            throw new Error('RLS_VIOLATION: Refus de sécurité (RLS) - Tenant introuvable ou non autorisé.');
          }
          throw new Error(invErr.message || 'Erreur lors de la création de la facture');
        }

        if (dbInvoice) {
          if (newInvData.items && newInvData.items.length > 0) {
            const itemsToInsert = newInvData.items.map((item, idx) => ({
              invoice_id: dbInvoice.id,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total: item.total,
              sort_order: idx,
            }));
            await supabase.from('invoice_items').insert(itemsToInsert);
          }
          await fetchData();
          return dbInvoice;
        }
      } catch (err: any) {
        setInvoices((prev) => prev.filter((i) => i.id !== tempId));
        console.error("Error inserting invoice into Supabase:", err);
        throw err;
      }
    }

    return newInvoice;
  }

  async function updateInvoice(id: string, updates: Partial<Invoice>) {
    // Immediate local state update
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? { ...inv, ...updates, updated_at: new Date().toISOString() }
          : inv
      )
    );

    if (userId && !id.startsWith('inv-')) {
      try {
        const { items, client, ...dbUpdates } = updates as any;
        await supabase
          .from('invoices')
          .update(dbUpdates)
          .eq('id', id);

        if (items && Array.isArray(items)) {
          await supabase.from('invoice_items').delete().eq('invoice_id', id);
          const itemsToInsert = items.map((item, idx) => ({
            invoice_id: id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total: item.total,
            sort_order: idx,
          }));
          await supabase.from('invoice_items').insert(itemsToInsert);
        }
        await fetchData();
      } catch (err) {
        console.error("Error updating invoice in Supabase:", err);
      }
    }
  }

  async function deleteInvoice(id: string) {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));

    if (userId && !id.startsWith('inv-')) {
      try {
        await supabase.from('invoices').delete().eq('id', id);
        await fetchData();
      } catch (err) {
        console.error("Error deleting invoice in Supabase:", err);
      }
    }
  }

  async function addClient(newClientData: Omit<Client, "id" | "created_at" | "updated_at">): Promise<Client> {
    if (userId) {
      const quotaCheck = await checkClientQuota(userId);
      if (!quotaCheck.allowed) {
        throw new Error(quotaCheck.error || "Limite de clients atteinte.");
      }
    }

    const tempId = `client-${Date.now()}`;
    const now = new Date().toISOString();
    const newClient: Client = {
      ...newClientData,
      id: tempId,
      created_at: now,
      updated_at: now,
    };

    setClients((prev) => [newClient, ...prev]);

    if (userId) {
      try {
        const { data: dbClient, error } = await supabase
          .from('clients')
          .insert({
            user_id: userId,
            tenant_id: userId,
            name: newClientData.name,
            email: newClientData.email || null,
            phone: newClientData.phone || null,
            address: newClientData.address || null,
            city: newClientData.city || null,
            country: newClientData.country || "Côte d'Ivoire",
            notes: newClientData.notes || null,
          })
          .select()
          .single();

        if (error) {
          setClients((prev) => prev.filter((c) => c.id !== tempId));
          console.error("Error adding client to Supabase:", error);
          const errStr = (error.message || '') + (error.details || '');
          if (error.code === '42501' || errStr.toLowerCase().includes('row-level security') || errStr.toLowerCase().includes('rls')) {
            throw new Error('RLS_VIOLATION: Refus de sécurité (RLS) - Tenant introuvable ou non autorisé.');
          }
          throw new Error(error.message || "Erreur lors de la création du client");
        }

        if (dbClient) {
          await fetchData();
          return dbClient;
        }
      } catch (err: any) {
        setClients((prev) => prev.filter((c) => c.id !== tempId));
        console.error("Error adding client to Supabase:", err);
        throw err;
      }
    }

    return newClient;
  }

  async function updateClient(id: string, updates: Partial<Client>) {
    setClients((prev) =>
      prev.map((cli) =>
        cli.id === id
          ? { ...cli, ...updates, updated_at: new Date().toISOString() }
          : cli
      )
    );

    if (userId && !id.startsWith('client-')) {
      try {
        await supabase.from('clients').update(updates).eq('id', id);
        await fetchData();
      } catch (err) {
        console.error("Error updating client in Supabase:", err);
      }
    }
  }

  async function deleteClient(id: string) {
    setClients((prev) => prev.filter((cli) => cli.id !== id));

    if (userId && !id.startsWith('client-')) {
      try {
        await supabase.from('clients').delete().eq('id', id);
        await fetchData();
      } catch (err) {
        console.error("Error deleting client in Supabase:", err);
      }
    }
  }

  async function updateSettings(updates: Partial<CompanySettings>) {
    setCompanySettings((prev) => ({ ...prev, ...updates }));

    if (userId) {
      try {
        await supabase
          .from('company_settings')
          .update(updates)
          .eq('user_id', userId);
        await fetchData();
      } catch (err) {
        console.error("Error updating settings in Supabase:", err);
      }
    }
  }

  return (
    <AppContext.Provider
      value={{
        invoices,
        clients,
        companySettings,
        stats,
        loading,
        userRole,
        userProfile,
        tenantQuota,
        quotaLoading,
        refreshTenantQuota,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        addClient,
        updateClient,
        deleteClient,
        updateSettings,
        refreshData: fetchData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
