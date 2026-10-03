# 🎓 CampusFinder — Smart Lost & Found System for College

A full-stack, enterprise-grade web application engineered for college campuses to streamline reporting, searching, automated matching, and recovering lost items among students, faculty, and administrative staff.

---

## 🌟 Key Features

### 1. 🤖 Smart Matching Engine
- **Multi-Attribute Weighted Similarity Scoring (0–100%)**:
  - **Category Similarity**: 25%
  - **Keyword & N-Gram Token Similarity**: 25%
  - **Campus Location / Building Clusters**: 20%
  - **Color Matching & Color Families**: 10%
  - **Brand / Manufacturer Match**: 10%
  - **Date & Timeline Proximity**: 10%
- **Explainable Match Breakdown**: Generates human-readable explanations (e.g., `Same Category: Electronics (+25%)`, `Matching keywords: "dell", "laptop" (+19%)`, `Campus zone match: Library (+17%)`, `Same Color: Black (+10%)`).
- **Live Match Radar**: Automatically previews potential matches in real-time as users type on the reporting form.
- **Pluggable Architecture**: Modular service design (`server/services/smartMatchService.js`) ready to integrate ML/vector embeddings or LLM APIs.

### 2. 🛡️ User Roles & Privacy-Preserving Communication
- **Student / Staff Role**:
  - Register & log in with college email or student ID.
  - Report Lost or Found items with rich details and photo uploads.
  - Filter by category, campus zone, date range, and status.
  - In-app messaging system preserving personal privacy (masks personal phone numbers, email addresses, and full student IDs).
  - Manage personal reports: edit, delete, and mark items as recovered (with celebratory confetti 🎉).
- **Administrator Role (`admin`)**:
  - Dedicated **Admin Command Center** with real-time KPI metrics.
  - Visual charts: Category breakdown, campus location distribution, and recovery success rate.
  - Report Moderation: Approve, change status (Active, In Review, Recovered, Returned, Rejected), or delete suspicious posts.
  - User Management: View registered accounts, toggle roles, and suspend/activate users.
  - Community Flag Queue: Review flagged posts with one-click resolution actions.
  - One-Click **Demo Reset Button** to restore presentation seed state instantly.

---

## 🏗️ Architecture & Tech Stack

```
college-lost-and-found/
├── server/
│   ├── db.js                 # SQLite relational database layer (sql.js with persistence)
│   ├── seed.js               # College demo dataset with realistic items, matches, & threads
│   ├── index.js              # Express API server & static asset host
│   ├── middleware/
│   │   ├── auth.js           # JWT verification & role-based access control
│   │   └── upload.js         # Multer multipart image upload handler
│   ├── services/
│   │   └── smartMatchService.js # Weighted multi-attribute similarity algorithm
│   └── routes/
│       ├── auth.js           # /api/auth (register, login, me)
│       ├── items.js          # /api/items (CRUD, search, filters, my-items)
│       ├── matches.js        # /api/matches (cross-matches, live preview)
│       ├── messages.js       # /api/messages (conversations, chat threads)
│       └── admin.js          # /api/admin (statistics, moderation, user control)
├── src/
│   ├── context/
│   │   └── AuthContext.jsx   # Authentication state & one-click demo persona switcher
│   ├── components/
│   │   ├── Navbar.jsx        # Navigation, notifications badge, persona switcher
│   │   ├── Footer.jsx        # Campus safety desk locations & security hotline
│   │   ├── ItemCard.jsx      # Card component with match indicators
│   │   ├── MatchCard.jsx     # Confidence gauge with explainable score breakdown
│   │   ├── SearchFilters.jsx # Debounced search, category/location/date filters
│   │   ├── StatusBadge.jsx   # Color-coded status badges
│   │   ├── ContactModal.jsx  # In-app message composer
│   │   └── ReportFlagModal.jsx # Community flag modal
│   ├── pages/
│   │   ├── LandingPage.jsx   # College branding hero, live stats, how-it-works
│   │   ├── BrowsePage.jsx    # Complete catalog search & filter
│   │   ├── ItemDetailPage.jsx# High-res view, reporter privacy shield, matches list
│   │   ├── ReportItemPage.jsx# Form with image upload & live match radar
│   │   ├── MyReportsPage.jsx # Manage personal reports & mark recovered
│   │   ├── MessagesPage.jsx  # Split-screen in-app chat interface
│   │   ├── DashboardPage.jsx # User analytics & smart match alerts
│   │   ├── AdminDashboardPage.jsx # Admin moderation & analytics
│   │   ├── LoginPage.jsx     # Authentication + one-click demo buttons
│   │   └── RegisterPage.jsx  # College account signup
│   ├── App.jsx               # Client router & layout
│   └── main.jsx              # React DOM entry point
├── package.json
└── vite.config.js
```

---

## 🚀 Quick Start Guide

### 1. Start the Server
```powershell
# From the project directory:
npm start
```
The application will be live at **http://localhost:5000** (API + Frontend).

### 2. Development Mode (Vite Hot Reload)
```powershell
npm run dev
```
Frontend runs on **http://localhost:5173** and proxies requests to **http://localhost:5000**.

---

## 👥 Demo Test Accounts

| Persona | Email | College ID | Role | Password | Scenario / Demo Focus |
|---|---|---|---|---|---|
| **Alex Rivers** | `alex.rivers@college.edu` | `STU-2024-8841` | Student | `College@123` | Reported lost **Dell XPS Laptop** & **Student ID** |
| **Priya Sharma** | `priya.sharma@college.edu` | `STU-2024-6729` | Student | `College@123` | Found **Dell Laptop in Library Block** (91% Smart Match) |
| **Dr. Marcus Vance**| `marcus.vance@college.edu` | `STF-2021-042` | Staff | `College@123` | Found **AirPods in Auditorium** |
| **David Chen** | `david.chen@college.edu` | `STU-2025-1109` | Student | `College@123` | Lost **AirPods Pro** & recovered backpack |
| **Campus Admin** | `admin@college.edu` | `ADM-2024-001` | Admin | `College@123` | Access to **Admin Command Center** & moderation |

> 💡 **Tip:** Use the **"Demo User"** quick switcher dropdown in the navbar or the one-click buttons on the Login page to instantly switch between personas without typing credentials during presentations!

---

## 🧪 Verified User Flows

1. **Smart Matching Flow**:
   - Log in as **Alex Rivers** (Student).
   - View the active lost report for `Black Dell XPS 15 Laptop`.
   - The system detects a **91% Potential Match** against `Black Dell Laptop in sleeve` reported by Priya Sharma.
   - Click **"Contact Finder"** to send an in-app message.
   - Click **"Mark as Recovered"** once retrieved to trigger the celebration confetti.
2. **Live Radar on Reporting Flow**:
   - Go to **Report Lost Item** or **Report Found Item**.
   - As you type the title (e.g. `Dell laptop`) and select category `Electronics`, the **Live Campus Radar** box dynamically detects existing campus items in real-time.
3. **Administration & Moderation Flow**:
   - Switch to **Campus Admin**.
   - Open **Admin Console** to review live recovery metrics, category bar charts, all report logs, user status toggling, and the flagged content review queue.
