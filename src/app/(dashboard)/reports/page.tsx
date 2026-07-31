import { BarChart3, Construction } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Rapports</h1>
        <p className="text-sm text-gray-500 mt-1">
          Analysez vos performances financières
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-card p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Bientôt disponible
        </h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
          Les rapports financiers avancés seront disponibles dans la version Pro.
          Vous pourrez analyser vos revenus, suivre les paiements et exporter
          des rapports détaillés.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-sm font-medium">
          <Construction className="w-4 h-4" />
          En cours de développement
        </div>
      </div>
    </div>
  );
}
