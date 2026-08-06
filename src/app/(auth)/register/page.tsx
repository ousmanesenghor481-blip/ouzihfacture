"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, Building2, ArrowRight, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function displayErrorMessage(err: any) {
    if (!err) {
      setErrorMsg(null);
      return;
    }
    if (typeof err === "string" && err.trim()) {
      setErrorMsg(err);
      return;
    }
    if (typeof err === "object" && err !== null) {
      const msg = err.error || err.message || err.details || err.msg;
      if (typeof msg === "string" && msg.trim()) {
        setErrorMsg(msg);
        return;
      }
      if (typeof msg === "object" && msg !== null && typeof msg.message === "string") {
        setErrorMsg(msg.message);
        return;
      }
    }
    setErrorMsg("Une erreur est survenue lors de l'inscription. Veuillez vérifier vos informations.");
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanFullName = fullName.trim();
    const cleanCompanyName = companyName.trim();

    try {
      // Step 0: Check if account exists by instant login
      const { data: directSignIn } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (directSignIn?.session?.user) {
        const currentUser = directSignIn.session.user;
        await supabase.from('profiles').upsert(
          { id: currentUser.id, full_name: cleanFullName || 'Utilisateur', email: cleanEmail, role: 'owner', tenant_id: currentUser.id },
          { onConflict: 'id' }
        );
        await supabase.from('company_settings').upsert(
          { user_id: currentUser.id, company_name: cleanCompanyName || 'Mon Entreprise', company_email: cleanEmail },
          { onConflict: 'user_id' }
        );
        router.push("/dashboard");
        router.refresh();
        return;
      }

      // Step 1: Call API route /api/auth/register
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: cleanFullName,
          companyName: cleanCompanyName,
          email: cleanEmail,
          password,
        }),
      });

      const resData = await res.json().catch(() => ({}));

      if (!res.ok || resData.error) {
        const extractedText = typeof resData.error === 'string' ? resData.error : resData.error?.message || resData.message || 'Erreur lors de la création du compte.';
        console.error("[Register Page Error Banner]", { status: res.status, errorText: extractedText });

        // If email already exists, attempt automatic sign-in
        if (extractedText.includes("déjà")) {
          const { error: postLoginErr } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
          if (!postLoginErr) {
            router.push("/dashboard");
            router.refresh();
            return;
          }
        }

        displayErrorMessage(extractedText);
        setLoading(false);
        return;
      }

      // Step 2: Login after registration
      const { error: loginErr } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (loginErr) {
        console.warn("[Register Page Notice] Post-registration login warning:", loginErr);
      }

      // Step 3: Frontend fallback upsert for profiles & company_settings
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        await supabase.from('profiles').upsert(
          { id: currentUser.id, full_name: cleanFullName || 'Utilisateur', email: cleanEmail, role: 'owner', tenant_id: currentUser.id },
          { onConflict: 'id' }
        );
        await supabase.from('company_settings').upsert(
          { user_id: currentUser.id, company_name: cleanCompanyName || 'Mon Entreprise', company_email: cleanEmail },
          { onConflict: 'user_id' }
        );
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error("[Register Page Fatal Catch]", err);
      displayErrorMessage(err);
      setLoading(false);
    }
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-md animate-scale-up max-w-md w-full mx-auto">
      {/* Brand */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-500/20">
            O
          </div>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Créer votre compte
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Commencez à gérer vos factures gratuitement
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Nom complet
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ousmane Senghor"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Nom de l&apos;entreprise
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Ouzih Business SARL"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Email professionnel
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ousmanesenghor@entreprise.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Mot de passe (6 caractères min.)
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
        >
          {loading ? (
            "Création du compte..."
          ) : (
            <>
              Créer mon compte
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-xs text-slate-400 border-t border-slate-800/80 pt-6">
        Déjà un compte ?{" "}
        <Link href="/login" className="text-blue-400 font-semibold hover:text-blue-300">
          Se connecter
        </Link>
      </div>
    </div>
  );
}
