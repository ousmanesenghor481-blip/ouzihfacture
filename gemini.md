# OuzihFacture — Documentation Technique & Guide IA

> **OuzihFacture** est une application SaaS full-stack de facturation de classe mondiale conçue spécifiquement pour les entrepreneurs, freelances et PME en Afrique (montants en FCFA, TVA à 18%, et formatage des dates au format francophone JJ/MM/AAAA).

---

## 📌 Table des Matières
1. [Vue d'Ensemble du Produit](#-1-vue-densemble-du-produit)
2. [Fonctionnalités Implémentées](#-2-fonctionnalités-implémentées)
3. [Stack Technologique](#-3-stack-technologique)
4. [Structure des Fichiers](#-4-structure-des-fichiers)
5. [Décisions de Design & Design System](#-5-décisions-de-design--design-system)
6. [Gestion d'État (React Context API)](#-6-gestion-détat-react-context-api)
7. [Base de Données & Supabase](#-7-base-de-données--supabase)
8. [Instructions pour les Futurs Modèles IA](#-8-instructions-pour-les-futurs-modèles-ia)

---

## 🎯 1. Vue d'Ensemble du Produit

**OuzihFacture** permet aux entrepreneurs africains de :
- Gérer leurs clients et leur carnet de contacts.
- Créer, éditer, envoyer et suivre des factures professionnelles avec calcul automatique de la **TVA à 18%** et totaux en **FCFA**.
- Suivre les statuts des factures (Brouillon, Envoyée, Payée, En retard) en temps réel.
- Visualiser la santé financière globale sur un tableau de bord analytique.
- Configurer les paramètres de leur entreprise (logo, NIF/RCCM, adresse, préfixe de numérotation).
- Consulter un centre d'aide complet avec FAQ interactive et support direct.

---

## 🚀 2. Fonctionnalités Implémentées

### 🏠 Landing Page Publique (`/`)
- Hero section moderne avec dégradés, badges réactifs et bouton CTA d'action directe.
- Aperçu mockup interactif du tableau de bord.
- Grille de 6 fonctionnalités clés avec icônes Lucide.
- Section en 3 étapes *"Comment ça marche"*.
- Pied de page complet avec liens de navigation.

### 🔐 Authentification (`/login` & `/register`)
- **Login** : Formulaire de connexion sécurisé avec mode sombre élégant.
- **Register** : Inscription utilisateur avec saisie du nom, de l'entreprise, de l'email et du mot de passe.

### 📊 Tableau de Bord (`/dashboard`)
- **4 Cartes Statistiques Réactives** avec mini-graphiques en barres (Recharts) :
  1. *Toutes les factures* (Total facturé)
  2. *Factures envoyées* (Montant en attente)
  3. *Brouillons* (Nombre de brouillons)
  4. *Factures payées* (Montant encaissé)
- **Tableau des Factures Récentes** : Affichage des 5 dernières factures créées, avec avatars clients réactifs, badges de statut colorés et actions rapides (Voir 👁️, Modifier ✏️, Supprimer 🗑️).

### 📄 Gestion des Factures (`/invoices`, `/invoices/new`, `/invoices/[id]`, `/invoices/[id]/edit`)
- **Liste des Factures** : Recherche textuelle, filtres par statut (Toutes, Brouillons, Envoyées, Payées, En retard), pagination réactive, et dialogue de confirmation de suppression.
- **Création de Facture** : Sélection du client, dates d'émission et d'échéance, lignes dynamiques (ajout/suppression), calcul automatique en temps réel du sous-total, de la TVA (18%) et du total TTC en FCFA.
- **Détail Facture** : Aperçu au format document d'impression officiel, évolution du statut en un clic (*"Marquer comme envoyée"*, *"Marquer comme payée"*), impression/export PDF.
- **Édition Facture** : Formulaire pré-rempli avec ré-estimation des montants en direct.

### 👥 Répertoire Clients (`/clients`)
- Grille de cartes clients 3D réactives avec avatars en dégradé.
- Statistiques de répartition géographique (Côte d'Ivoire vs International).
- Barre de recherche instantanée (par nom, email ou téléphone).
- Modal d'ajout et de modification avec flou d'arrière-plan (`backdrop-blur-sm`).

### ⚙️ Paramètres Entreprise (`/settings`)
- Modification du nom, adresse, téléphone, email et NIF/RCCM.
- Zone de téléchargement de logo entreprise.
- Configuration du préfixe des factures (ex: `FAC-2026-001`) et du taux de TVA par défaut.

### ❓ Aide & Support (`/help`)
- Bannière Héro avec recherche en temps réel dans la base de connaissances.
- 3 cartes de canaux de support direct (Email, Téléphone/WhatsApp, Documentation) avec animations 3D au survol.
- FAQ sous forme d'accordéon interactif avec ouverture/fermeture animée et badges de catégorie.

### 📈 Rapports & Présentation Pro (`/reports`)
- Présentation des fonctionnalités avancées d'analyse financière de la version Pro.

---

## 🛠️ 3. Stack Technologique

```
Core Framework:      Next.js 14 (App Router) + React 18 + TypeScript
Styles:              Tailwind CSS 3.4 (Custom Palette & Animations)
Icônes:              Lucide React
Graphiques:          Recharts (Mini-graphiques d'analyse)
State Management:    React Context API (AppContext.tsx)
Base de Données:     Supabase PostgreSQL + RLS (Row Level Security)
Auth client:         @supabase/ssr (Préparé)
Runtime Local:       Node.js v20.18.0 (Portable)
```

---

## 📁 4. Structure des Fichiers

```
Ouzihfacture/
├── public/                     # Assets statiques
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root Layout avec AppProvider
│   │   ├── page.tsx            # Landing Page publique
│   │   ├── globals.css         # Utilities & animations Tailwind
│   │   ├── (auth)/
│   │   │   ├── layout.tsx      # Layout centré avec fond sombre
│   │   │   ├── login/page.tsx  # Page de connexion
│   │   │   └── register/page.tsx # Page d'inscription
│   │   └── (dashboard)/
│   │       ├── layout.tsx      # Dashboard layout (Sidebar + Header)
│   │       ├── dashboard/page.tsx # Tableau de bord
│   │       ├── invoices/
│   │       │   ├── page.tsx    # Liste des factures
│   │       │   ├── new/page.tsx # Créer une facture
│   │       │   └── [id]/
│   │       │       ├── page.tsx # Détail facture (Aperçu PDF)
│   │       │       └── edit/page.tsx # Modifier facture
│   │       ├── clients/
│   │       │   └── page.tsx    # Liste & modal clients
│   │       ├── settings/
│   │       │   └── page.tsx    # Paramètres entreprise
│   │       ├── help/
│   │       │   └── page.tsx    # Centre d'aide & FAQ animée
│   │       └── reports/
│   │           └── page.tsx    # Rapports & Offre Pro
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx     # Barre de navigation latérale
│   │   │   ├── Header.tsx      # En-tête du dashboard (recherche & profil)
│   │   │   └── MobileNav.tsx   # Menu tiroir mobile
│   │   ├── dashboard/
│   │   │   ├── StatCard.tsx    # Carte de statistique animée
│   │   │   ├── MiniChart.tsx   # Graphique miniature Recharts
│   │   │   └── RecentInvoicesTable.tsx # Tableau factures récentes
│   │   └── ui/
│   │       ├── Badge.tsx       # Statuts de facture colorés
│   │       ├── Button.tsx      # Composant Bouton
│   │       ├── Card.tsx        # Container carte
│   │       ├── ConfirmDialog.tsx # Dialogue modal de confirmation
│   │       ├── Input.tsx       # Champ de saisie
│   │       ├── Modal.tsx       # Modal réutilisable
│   │       └── Select.tsx      # Liste déroulante
│   ├── context/
│   │   └── AppContext.tsx      # Provider React Context pour le State global
│   ├── data/
│   │   └── mock.ts             # Données fictives initiales en FCFA
│   ├── lib/
│   │   ├── constants.ts        # TVA_RATE (18%), Devises, Statuts
│   │   ├── supabase/
│   │   │   ├── client.ts       # Client Supabase navigateur
│   │   │   └── server.ts       # Client Supabase serveur
│   │   └── utils/
│   │       ├── cn.ts           # Utilitaire de fusion Tailwind classnames
│   │       ├── format.ts       # Formatage FCFA & Dates JJ/MM/AAAA
│   │       └── invoice.ts      # Fonctions de calcul (TVA 18%, TTC, numérotation)
│   └── types/
│       ├── index.ts            # Interfaces TypeScript
│       └── declarations.d.ts   # Déclarations de types pour Lucide & Recharts
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql # Schéma PostgreSQL & politiques RLS
├── tailwind.config.ts          # Configuration Tailwind & thèmes
├── tsconfig.json               # Path aliases (@/*) et règles TypeScript
├── package.json                # Dépendances du projet
└── gemini.md                   # Ce fichier de documentation
```

---

## 🎨 5. Décisions de Design & Design System

### Palette de Couleurs
- **Fond principal** : Blanc (`#FFFFFF`) et Slate clair (`#F8FAFC`).
- **Primaire (Blue)** : `#2563EB` (blue-600) — Boutons principaux, liens actifs.
- **Succès (Green)** : `#16A34A` (green-600) / `#059669` — Statut *Payée*, création de facture.
- **Avertissement (Orange)** : `#EA580C` (orange-600) / `#F59E0B` — Statut *Envoyée*, attente.
- **Danger (Red)** : `#DC2626` (red-600) / `#EF4444` — Statut *En retard*, actions de suppression.
- **Neutre (Gray)** : `#6B7280` (gray-500) — Statut *Brouillon*, textes secondaires.
- **Public & Auth** : Mode sombre Slate (`bg-slate-900`) avec dégradés bleus et effets d'éclat (*glow*).

### Micro-Animations
1. **Cartes 3D au Survol** : `transform hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300`.
2. **Surbrillance des Lignes de Tableau** : Transition douce au survol (`hover:bg-blue-50/30`).
3. **Agitation/Zoom d'Icônes** : Les conteneurs d'icônes s'agrandissent (`group-hover:scale-110`).
4. **Flèches Glissantes** : Les flèches d'action glissent vers la droite au survol (`group-hover:translate-x-1.5`).
5. **Modales Animées** : Effet d'ouverture en échelle (`animate-scale-up`) avec fond flouté (`backdrop-blur-sm`).

---

## ⚡ 6. Gestion d'État (React Context API)

Le fichier `src/context/AppContext.tsx` fournit les méthodes suivantes :
- `invoices` : Liste réactive des factures.
- `clients` : Liste réactive des clients.
- `companySettings` : Paramètres de l'entreprise.
- `stats` : Statistiques financières recalculées en temps réel (`totalInvoices`, `totalAmount`, `paidAmount`, `pendingAmount`, `overdueAmount`, `draftCount`, `sentCount`, `paidCount`, `overdueCount`).
- `addInvoice(data)` / `updateInvoice(id, updates)` / `deleteInvoice(id)`.
- `addClient(data)` / `updateClient(id, updates)` / `deleteClient(id)`.
- `updateSettings(updates)`.

---

## 🗄️ 7. Base de Données & Supabase

Le fichier `supabase/migrations/001_initial_schema.sql` contient :
- **Tables** : `profiles`, `company_settings`, `clients`, `invoices`, `invoice_items`.
- **Contraintes** : Devises par défaut `'FCFA'`, statut check constraint (`brouillon`, `envoyee`, `payee`, `en_retard`), clés étrangères en cascade.
- **Securité RLS** : Politiques strictes garantissant que chaque utilisateur authentifié n'accède qu'à ses propres données (`auth.uid() = user_id`).

---

## 🤖 8. Instructions pour les Futurs Modèles IA

Si vous êtes un modèle IA reprenant le développement de ce projet, **veuillez respecter scrupuleusement les consignes suivantes** :

### 🚨 Règles Absolues
1. **Formatage Monétaire** : Tous les montants affichés doivent utiliser la fonction `formatCurrency()` du fichier `src/lib/utils/format.ts` pour garantir la mise en forme en FCFA (`250 000 FCFA`). Ne jamais afficher de symbole `$` ou `€` par défaut.
2. **Calcul de la TVA** : Conserver la TVA à **18%** (`TVA_RATE = 18` dans `src/lib/constants.ts`) et utiliser les fonctions de calcul définies dans `src/lib/utils/invoice.ts`.
3. **Format des Dates** : Toujours formater les dates au format francophone `JJ/MM/AAAA` via `formatDate()`.
4. **Déclarations de Types** : Si vous ajoutez de nouvelles icônes `lucide-react`, veillez à ajouter leurs déclarations dans `src/types/declarations.d.ts` pour éviter les erreurs de compilation TypeScript.
5. **Intégrité des Animations** : Conserver les classes Tailwind d'animation (`hover:-translate-y-1`, `hover:shadow-xl`, `transition-all duration-300`, `group-hover:scale-110`) lors de la modification des composants.
6. **Alias d'Importation** : Utiliser l'alias `@/` pour tous les imports internes (`@/components/...`, `@/lib/...`, `@/context/...`).

### 🔄 Transition du Contexte Local vers Supabase
Pour remplacer l'état en mémoire par Supabase :
1. Remplacer les appels de state dans `AppContext.tsx` par des requêtes `supabase.from('invoices').select('*')` et des mutations via les helpers de `src/lib/supabase/client.ts`.
2. Conserver la signature des fonctions `addInvoice`, `updateInvoice`, `deleteInvoice` pour ne pas casser les pages existantes.

---

*Documentation générée avec succès pour OuzihFacture.*
