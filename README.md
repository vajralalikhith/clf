# 🎓 Campus Lost & Found — AI-Powered Item Recovery Network

An official, enterprise-grade university lost and found platform built with **React 18**, **TypeScript**, **Tailwind CSS**, and **Firebase (Firestore & Authentication)**. Features automated **AI Vision Image Matching**, verification workflows, student/faculty claim management, and role-based security monitoring.

---

## 🌟 Key Highlights & Portfolio Features

- 🤖 **AI-Powered Image & Vector Matching**: Automated similarity matching that compares lost and found item images, titles, and tags using visual embeddings.
- ⚡ **Real-Time Firebase Synchronization**: Instant live updates via Firestore `onSnapshot` subscriptions across reports, status updates, and user notifications.
- 🛡️ **Role-Based Access Control (RBAC)**: Dedicated permissions for **Students**, **Faculty/Staff**, **Campus Security**, and **Administrators**.
- 🔐 **Granular Security Rules**: Custom Firestore & Storage security rules protecting user data, item ownership, and admin moderation controls.
- 📱 **Mobile-First Responsive UI**: Fluid layout, accessible touch targets, adaptive sidebar drawers, dark mode toggle, and micro-interactions powered by `motion`.
- ⚡ **Production-Optimized Performance**: Code-split React routes (`React.lazy`), skeleton loaders, Error Boundaries, image pre-connecting, and full SEO metadata.

---

## 🏗️ Architecture & Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 18, TypeScript, Vite |
| **Styling & UI** | Tailwind CSS v4, Lucide React Icons |
| **Animation Engine** | Motion (`motion/react`) |
| **State & Auth Context**| React Context API + Firebase Auth |
| **Database & Realtime**| Firebase Firestore |
| **Storage & Security** | Firebase Storage Rules & Firestore Security Rules |
| **Deployment Target** | Firebase Hosting & Cloud Run Containers |

---

## 📁 Repository Structure

```
├── firebase-applet-config.json # Firebase Applet runtime configuration
├── firebase-blueprint.json     # Initial database schema blueprint
├── firestore.rules             # Production Firestore security rules
├── storage.rules               # Production Firebase Storage security rules
├── firebase.json                # Firebase Hosting rewrite & caching rules
├── index.html                  # Main entry template with OpenGraph & preconnect tags
├── src/
│   ├── components/             # Reusable UI controls (Navbar, Sidebar, Modal, ErrorBoundary, EmptyState, Logo)
│   ├── context/                # AppContext (Auth state, Firestore sync, Notification triggers)
│   ├── pages/                  # Route views (LandingPage, Dashboard, AdminDashboard, ItemDetails, MatchResults, etc.)
│   ├── types/                  # Shared TypeScript interfaces (Item, User, ClaimRequest)
│   ├── main.tsx                # Application mounting point
│   └── App.tsx                 # Lazy routes & global layout shell
```

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm** or **bun**

### 2. Installation
```bash
# Clone repository
git clone https://github.com/your-username/campus-lost-and-found.git
cd campus-lost-and-found

# Install dependencies
npm install
```

### 3. Running Development Server
```bash
npm run dev
```
The application will launch locally at `http://localhost:3000`.

---

## 📦 Building & Firebase Deployment

### Production Build
```bash
npm run build
```
Generates production static assets in the `/dist` directory.

### Firebase Hosting Deployment
```bash
# Login to Firebase CLI
firebase login

# Deploy Hosting, Firestore Rules, and Storage Rules
firebase deploy
```

---

## 🔒 Security & Role Rules

- **Public Access**: Anyone can browse active lost and found listings.
- **Authenticated Users**: Can submit lost or found reports, edit/delete their own reports, and file claims.
- **Campus Security / Administrators**: Access to `/admin` portal to verify legitimate reports, moderate content, update user roles, and resolve lost-and-found cases.

---

## 📄 License

Distributed under the **MIT License**. Created for university campus safety and item recovery management.
