# LifeLink — Unified Blood Donation & Coordination Platform

> A real-time, life-critical coordination platform connecting patients, voluntary donors, hospitals, blood banks, and NGOs with smart matching algorithms, telemetry tracking, and cold-chain compliance.

---

## 🌟 Key Highlights & Capabilities

- **🚑 Real-Time Coordination & Telemetry Tracker**: Live dispatch pipeline tracking requests through all operational stages (*Requested ➔ Matched ➔ Dispatched ➔ In-Transit ➔ Delivered ➔ Transfused*).
- **⚡ 3-Tier Automatic Multi-Level Escalation**:
  - **Tier 1**: Immediate broadcast to top-ranked nearby voluntary donors within a 5km radius.
  - **Tier 2**: Dynamic failover to licensed blood banks with verified reserved stocks if unfulfilled within 15 minutes.
  - **Tier 3**: Emergency inter-hospital dispatch and NGO mobilization network.
- **🏷️ Clinical Unit Passport & ISBT-128 QR Tracking**: Generates verifiable QR codes adhering to ISBT-128 standards with live cold-chain telemetry ($2^\circ\text{C} - 6^\circ\text{C}$).
- **📈 Predictive Blood Demand Heatmap**: 7-day and 30-day forecast engines analyzing surgical schedules, seasonal spikes (e.g. dengue), and regional deficits.
- **🏆 Donor Reliability Scoring & Smart Ranking**: Algorithms calculating composite scores based on response SLAs, 90-day cooldown windows, and zero no-show rates.
- **🤖 Lifeline AI Assistant**: On-demand triage chatbot providing donor eligibility checks, compatibility lookups, and one-click emergency ticket routing.
- **🌐 Trilingual Localization**: Full parity support across **English**, **हिन्दी (Hindi)**, and **मराठी (Marathi)**.
- **🛡️ Regulatory & DPDP Act 2023 Audit Trail**: Transparent, immutable audit logging with purpose limitation, consent records, and institutional verification.

---

## 👥 Supported Portals & Roles

| Role | Target Users | Key Capabilities |
| :--- | :--- | :--- |
| **Public** | General Visitors & First-time Donors | Blood compatibility matrix, live camps finder, quick emergency request modal |
| **Patient** | Patients & Family Attendants | Real-time unit tracking, auto-escalation timeline, hospital ward dispatch |
| **Donor** | Voluntary Donors | Emergency surge alerts, eligibility cooldown calculator, reliability score card |
| **Hospital** | Transfusion Wards & Clinicians | Emergency request dispatch, cross-match verification, incoming shipment tracking |
| **Blood Bank** | Technicians & Center Managers | Inventory by component (RBC, FFP, Platelets), expiry monitoring, QR passport issuance |
| **NGO** | Donation Camp Organizers | Camp scheduling, voluntary donor mobilization, drive target analytics |
| **Admin** | Health Directorate & Regulators | Institutional KYC verification, system-wide demand heatmap, audit log compliance |

---

## 🛠️ Technology Stack

- **Core Framework:** [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Build Tool:** [Vite 6](https://vite.dev/)
- **Icons & Visuals:** [Lucide React](https://lucide.dev/)
- **QR Engine:** [qrcode](https://www.npmjs.com/package/qrcode)
- **Authentication:** [Google Identity Services](https://developers.google.com/identity/gsi/web) (`@react-oauth/google`, `jwt-decode`)
- **Styling:** Custom Clinical Design System (`src/index.css`) with WCAG AA compliance

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)

### 1. Clone the Repository

```bash
git clone https://github.com/<YOUR_USERNAME>/LifeLink_BloodBank.git
cd LifeLink_BloodBank
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file based on `.env.example`:

```bash
cp .env.example .env.local
```

Configure your Google OAuth Client ID (optional for local testing; simulated authentication fallback is built-in):

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
```

### 4. Run Development Server

```bash
npm run dev
```

Open your browser at [http://localhost:3000](http://localhost:3000) to view the application.

### 5. Build for Production

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## 📁 Project Structure

```text
LifeLink_BloodBank/
├── Docs/                     # Product, technical, and regulatory specification docs
├── public/                   # Static public assets
├── src/
│   ├── components/
│   │   ├── common/           # Shared modules (Chatbot, QRModal, LiveTracker, Heatmap, etc.)
│   │   └── dashboards/       # Role-specific portals (Patient, Donor, Hospital, Admin, etc.)
│   ├── context/              # Central state management & actions (AppContext.tsx)
│   ├── data/                 # Clinical mock records, mock donors, inventory units
│   ├── locales/              # Translation dictionaries (en.json, hi.json, mr.json)
│   ├── services/             # Compatibility logic, matching engine, audit logger, i18n
│   ├── types/                # Strict TypeScript interface and type definitions
│   ├── App.tsx               # Root application shell & routing
│   ├── index.css             # Unified clinical CSS design tokens and layouts
│   └── main.tsx              # Application bootstrap with Google OAuth provider
├── .env.example              # Template for environment variables
├── .gitignore                # Production git ignore configuration
├── package.json              # Dependencies and build scripts
├── tsconfig.json             # TypeScript compiler settings
└── vite.config.ts            # Vite bundler configuration
```

---

## 🔒 Security & Privacy Standards

- **No Sensitive PII Exposure:** Masked contact numbers and zero public disclosure of patient diagnoses without role authorization.
- **ISBT-128 Compliance:** Traceability tags verify origin center, cold-chain temperature limits, collection date, and component breakdown.
- **Data Protection:** Follows principles of India's Digital Personal Data Protection (DPDP) Act 2023 with purpose-limited access control.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
