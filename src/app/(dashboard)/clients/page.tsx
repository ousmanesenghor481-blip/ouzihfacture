"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Pencil,
  Trash2,
  Phone,
  Mail,
  MapPin,
  UserPlus,
  X,
  Users,
  Building2,
  Globe,
} from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { useApp } from "@/context/AppContext";
import type { Client } from "@/types";

export default function ClientsPage() {
  const { clients, addClient, updateClient, deleteClient } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formCountry, setFormCountry] = useState("Côte d'Ivoire");

  const filteredClients = useMemo(() => {
    return clients.filter(
      (c) =>
        searchQuery === "" ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone?.includes(searchQuery)
    );
  }, [clients, searchQuery]);

  function resetForm() {
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormAddress("");
    setFormCity("");
    setFormCountry("Côte d'Ivoire");
    setEditingClient(null);
  }

  function openAddForm() {
    resetForm();
    setShowForm(true);
  }

  function openEditForm(client: Client) {
    setFormName(client.name);
    setFormEmail(client.email || "");
    setFormPhone(client.phone || "");
    setFormAddress(client.address || "");
    setFormCity(client.city || "");
    setFormCountry(client.country || "Côte d'Ivoire");
    setEditingClient(client);
    setShowForm(true);
  }

  async function handleSave() {
    if (!formName.trim()) return;

    try {
      if (editingClient) {
        await updateClient(editingClient.id, {
          name: formName,
          email: formEmail || null,
          phone: formPhone || null,
          address: formAddress || null,
          city: formCity || null,
          country: formCountry,
        });
      } else {
        await addClient({
          user_id: "user-001",
          name: formName,
          email: formEmail || null,
          phone: formPhone || null,
          address: formAddress || null,
          city: formCity || null,
          country: formCountry,
          notes: null,
        });
      }

      setShowForm(false);
      resetForm();
    } catch (err: any) {
      console.error("Client save error:", err);
      alert(err?.message || "Erreur lors de l'enregistrement du client");
    }
  }

  function handleDelete(id: string) {
    deleteClient(id);
    setShowDeleteConfirm(null);
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  function getAvatarColor(name: string) {
    const colors = [
      "bg-gradient-to-tr from-blue-600 to-indigo-500 text-white",
      "bg-gradient-to-tr from-emerald-600 to-teal-500 text-white",
      "bg-gradient-to-tr from-purple-600 to-pink-500 text-white",
      "bg-gradient-to-tr from-amber-500 to-orange-600 text-white",
      "bg-gradient-to-tr from-cyan-600 to-blue-500 text-white",
      "bg-gradient-to-tr from-rose-500 to-red-600 text-white",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Répertoire Clients
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Gérez vos clients et leurs coordonnées bancaires & facturation
          </p>
        </div>
        <button
          onClick={openAddForm}
          className="btn-success shadow-lg shadow-green-600/20 hover:scale-105 transition-all duration-200 inline-flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4" />
          Ajouter un client
        </button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="group bg-white rounded-2xl border border-gray-100 shadow-card p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total clients
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors">
            {clients.length}
          </p>
        </div>

        <div className="group bg-white rounded-2xl border border-gray-100 shadow-card p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Côte d&apos;Ivoire
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
            {clients.filter((c) => c.country === "Côte d'Ivoire").length}
          </p>
        </div>

        <div className="group bg-white rounded-2xl border border-gray-100 shadow-card p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              International
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-purple-600">
            {clients.filter((c) => c.country !== "Côte d'Ivoire").length}
          </p>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, email ou téléphone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 text-sm font-medium bg-gray-50/50 border-gray-200 focus:bg-white focus:border-blue-500 transition-all rounded-xl"
          />
        </div>
      </div>

      {/* Client Grid */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-bold text-gray-700 text-base mb-1">
            Aucun client trouvé
          </p>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            {searchQuery
              ? "Aucun enregistrement ne correspond à votre terme de recherche."
              : "Commencez par ajouter votre premier client pour alimenter vos factures."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="group relative bg-white rounded-2xl border border-gray-100 shadow-card p-6 hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between"
            >
              {/* Header inside card */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={cn(
                        "w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-extrabold shadow-md transition-transform duration-300 group-hover:scale-110",
                        getAvatarColor(client.name)
                      )}
                    >
                      {getInitials(client.name)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base group-hover:text-blue-600 transition-colors line-clamp-1">
                        {client.name}
                      </h3>
                      <p className="text-[11px] text-gray-400 font-medium">
                        Ajouté le {formatDate(client.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditForm(client)}
                      className="p-2 rounded-xl text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all transform hover:scale-110"
                      title="Modifier"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(client.id)}
                      className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all transform hover:scale-110"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Contact info list */}
                <div className="space-y-2.5 pt-3 border-t border-gray-100">
                  {client.email && (
                    <div className="flex items-center gap-2.5 text-xs text-gray-600 font-medium">
                      <div className="w-6 h-6 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}

                  {client.phone && (
                    <div className="flex items-center gap-2.5 text-xs text-gray-600 font-medium">
                      <div className="w-6 h-6 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <span>{client.phone}</span>
                    </div>
                  )}

                  {(client.address || client.city) && (
                    <div className="flex items-center gap-2.5 text-xs text-gray-600 font-medium">
                      <div className="w-6 h-6 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center shrink-0 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">
                        {[client.address, client.city, client.country]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Client Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scale-up border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">
                {editingClient ? "Modifier le client" : "Nouveau client"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="p-1.5 rounded-xl hover:bg-gray-200/60 transition-colors text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Nom complet <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Amadou Koné"
                  className="input font-medium text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="client@exemple.com"
                    className="input font-medium text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+225 01 02 03 04 05"
                    className="input font-medium text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Adresse
                </label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Rue et quartier"
                  className="input font-medium text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="Abidjan"
                    className="input font-medium text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Pays
                  </label>
                  <select
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    className="input font-medium text-sm"
                  >
                    <option>Côte d&apos;Ivoire</option>
                    <option>Sénégal</option>
                    <option>Mali</option>
                    <option>Burkina Faso</option>
                    <option>Guinée</option>
                    <option>Togo</option>
                    <option>Bénin</option>
                    <option>Niger</option>
                    <option>Cameroun</option>
                    <option>Gabon</option>
                    <option>Congo</option>
                    <option>Autre</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="btn-secondary text-sm"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={!formName.trim()}
                className="btn-primary text-sm shadow-md shadow-blue-600/20 disabled:opacity-50"
              >
                {editingClient ? "Sauvegarder" : "Ajouter le client"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-scale-up border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Supprimer ce client ?
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              Êtes-vous sûr de vouloir supprimer ce client ? Ses factures existantes ne seront pas supprimées.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="btn-secondary text-sm"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="btn-danger text-sm shadow-md shadow-rose-600/20"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
