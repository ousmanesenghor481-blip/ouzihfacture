import Link from "next/link";

export const dynamic = 'force-dynamic';
import {
  FileText,
  CheckCircle2,
  Zap,
  ShieldCheck,
  TrendingUp,
  Users,
  ArrowRight,
  Sparkles,
  Receipt,
  Globe,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-blue-500 selection:text-white">
      {/* Navigation Header */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
              O
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Ouzih<span className="text-blue-500">Facture</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">
              Fonctionnalités
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              Comment ça marche
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Tarifs
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden sm:block"
            >
              Se connecter
            </Link>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 flex items-center gap-2"
            >
              Accéder à l&apos;application
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4" />
          Conçu spécialement pour les entrepreneurs en Afrique
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight mb-6">
          La plateforme de facturation <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            rapide, conforme et intelligente
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Gérez vos factures en FCFA, calculez la TVA à 18% automatiquement, et
          suivez vos paiements sans prise de tête.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base transition-all shadow-xl shadow-blue-600/30 hover:scale-105 flex items-center justify-center gap-3"
          >
            Créer ma première facture
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-semibold text-base transition-all"
          >
            Découvrir les fonctionnalités
          </a>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="relative rounded-2xl border border-slate-800 bg-slate-900/80 p-2 sm:p-4 shadow-2xl shadow-blue-950/50 max-w-5xl mx-auto">
          <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800 p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="text-xs text-slate-500 font-mono">
                ouzihfacture.app/dashboard
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total Facturé", val: "12 450 000 FCFA", color: "text-blue-400" },
                { label: "Payé", val: "8 900 000 FCFA", color: "text-emerald-400" },
                { label: "En attente", val: "2 550 000 FCFA", color: "text-amber-400" },
                { label: "Clients", val: "28 actifs", color: "text-purple-400" },
              ].map((card, i) => (
                <div
                  key={i}
                  className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-left"
                >
                  <p className="text-xs text-slate-400 mb-1">{card.label}</p>
                  <p className={`text-base sm:text-lg font-bold ${card.color}`}>
                    {card.val}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-950/60 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Tout ce dont vous avez besoin pour vos finances
            </h2>
            <p className="text-slate-400 text-lg">
              Une suite complète d&apos;outils pensés pour simplifier la vie des freelances, PME et entrepreneurs africains.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Receipt,
                title: "Gestion en FCFA & TVA 18%",
                desc: "Calculs instantanés du sous-total, de la TVA locale à 18% et du montant TTC en FCFA.",
              },
              {
                icon: Users,
                title: "Gestion de Répertoire Client",
                desc: "Conservez les coordonnées et l'historique complet de chacun de vos clients.",
              },
              {
                icon: TrendingUp,
                title: "Tableau de Bord Intelligents",
                desc: "Visualisez en un coup d'œil votre chiffre d'affaires, factures payées et créances en retard.",
              },
              {
                icon: Zap,
                title: "Statuts en Temps Réel",
                desc: "Passez vos factures de Brouillon à Envoyée, Payée ou En retard d'un simple clic.",
              },
              {
                icon: ShieldCheck,
                title: "Sécurité & Confidentialité",
                desc: "Vos données financières sont chiffrées et protégées conformément aux meilleures pratiques.",
              },
              {
                icon: Globe,
                title: "Export & Partage Facile",
                desc: "Téléchargez des factures professionnelles prêtes à être envoyées par email ou WhatsApp.",
              },
            ].map((f, idx) => {
              const Icon = f.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-blue-500/50 transition-all hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-slate-400 text-lg">
            Créez et envoyez votre première facture professionnelle en moins de 2 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            {
              step: "01",
              title: "Configurez votre entreprise",
              desc: "Ajoutez votre nom, logo, adresse et numéro NIF/RCCM dans les paramètres.",
            },
            {
              step: "02",
              title: "Ajoutez vos lignes",
              desc: "Sélectionnez un client, saisissez les services avec prix unitaire en FCFA.",
            },
            {
              step: "03",
              title: "Envoyez & Encassez",
              desc: "Exportez la facture en PDF et suivez son règlement depuis votre tableau de bord.",
            },
          ].map((item, index) => (
            <div key={index} className="relative">
              <div className="text-6xl font-extrabold text-slate-800 mb-4 font-mono">
                {item.step}
              </div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 border-t border-slate-800 bg-slate-950 text-center px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Prêt à moderniser votre facturation ?
          </h2>
          <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
            Rejoignez des centaines d&apos;entrepreneurs qui font confiance à OuzihFacture pour gérer leur argent au quotidien.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg shadow-xl shadow-blue-600/30 transition-all hover:scale-105"
          >
            Lancer OuzihFacture
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} OuzihFacture. Tous droits réservés.</div>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:text-slate-300">
              Dashboard
            </Link>
            <Link href="/invoices" className="hover:text-slate-300">
              Factures
            </Link>
            <Link href="/clients" className="hover:text-slate-300">
              Clients
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
