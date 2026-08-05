import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  FileText,
  Users,
  ShieldAlert,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  CreditCard,
} from 'lucide-react';
import { formatDate } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';

const ADMIN_EMAIL = 'ousmanesenghor481@gmail.com';

export default async function AdminDashboardPage() {
  // 1. Authenticate user on Server
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Restrict access strictly to ADMIN_EMAIL
  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    redirect('/dashboard?error=unauthorized_admin');
  }

  // 3. Fetch global SaaS statistics using Service Role Key (bypassing RLS safely on Server)
  const adminSupabase = createAdminClient();

  // Total Tenants (Companies)
  const { count: totalTenants } = await adminSupabase
    .from('company_settings')
    .select('*', { count: 'exact', head: true });

  // Total Invoices Platform-wide
  const { count: totalInvoices } = await adminSupabase
    .from('invoices')
    .select('*', { count: 'exact', head: true });

  // Total Clients Platform-wide
  const { count: totalClients } = await adminSupabase
    .from('clients')
    .select('*', { count: 'exact', head: true });

  // Subscriptions List
  const { data: subscriptions } = await adminSupabase
    .from('subscriptions')
    .select('*');

  const activeSubCount = subscriptions?.filter(s => s.status === 'active')?.length || 0;

  // Companies List with User Profiles
  const { data: companyList } = await adminSupabase
    .from('company_settings')
    .select('*, profile:profiles(*)')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      {/* Admin Banner & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-xl">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white">Tableau de bord Admin SaaS</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
                PROPRIÉTAIRE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Supervision globale de la plateforme OuzihFacture &bull; Connecté en tant que <strong className="text-slate-200">{user.email}</strong>
            </p>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au Dashboard Client
        </Link>
      </div>

      {/* Global Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Entreprises (Tenants)</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900">{totalTenants || 0}</p>
          <p className="text-xs text-gray-500 mt-2 font-medium">Comptes d&apos;entreprises enregistrés</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Factures SaaS</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900">{totalInvoices || 0}</p>
          <p className="text-xs text-emerald-600 mt-2 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Générées sur la plateforme
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Clients B2B</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900">{totalClients || 0}</p>
          <p className="text-xs text-gray-500 mt-2 font-medium">Repertoire global des clients</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Abonnements Actifs</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900">{activeSubCount}</p>
          <p className="text-xs text-amber-600 mt-2 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Abonnés PayTech payants
          </p>
        </div>
      </div>

      {/* Tenants & Companies Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Liste des Entreprises Inscrites (Tenants)</h2>
            <p className="text-xs text-gray-500 mt-0.5">Données lues directement sans restriction RLS via Service Role</p>
          </div>
          <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
            {companyList?.length || 0} Entreprises
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="py-3.5 px-6">Entreprise</th>
                <th className="py-3.5 px-6">Email Propriétaire</th>
                <th className="py-3.5 px-6">Devise</th>
                <th className="py-3.5 px-6">NIF / RCCM</th>
                <th className="py-3.5 px-6">Date d&apos;inscription</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {!companyList || companyList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    Aucune entreprise enregistrée pour le moment.
                  </td>
                </tr>
              ) : (
                companyList.map((company: any) => (
                  <tr key={company.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {company.company_name?.slice(0, 2)?.toUpperCase() || 'OU'}
                        </div>
                        <span>{company.company_name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600 font-medium">
                      {company.company_email || company.profile?.email || 'N/A'}
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-700">
                      {company.currency || 'FCFA'}
                    </td>
                    <td className="py-4 px-6 text-gray-500 font-mono">
                      {company.tax_id || 'Non spécifié'}
                    </td>
                    <td className="py-4 px-6 text-gray-500">
                      {formatDate(company.created_at || new Date().toISOString())}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
