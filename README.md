<h1 align="center">Droplify</h1>

<p align="center">
  <strong>A full-stack AI dropshipping intelligence platform for modern e-commerce.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-blue.svg?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.5-blue.svg?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Express-4.21-lightgrey.svg?style=flat-square&logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-green.svg?style=flat-square&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Vite-6.4-purple.svg?style=flat-square&logo=vite" alt="Vite" />
</p>

<hr />

## 📖 Overview

**Droplify** is a comprehensive, full-stack application designed to help e-commerce entrepreneurs evaluate product viability, assess supplier reliability, and make data-driven decisions before launching a product. 

Unlike basic CRUD applications, this platform implements a dynamic **AI Scoring Engine** (running on the backend) that evaluates products across multiple dimensions—such as demand, profitability, and supplier risk—to generate detailed, actionable recommendations.

## ✨ Key Features

- **Product & Supplier Management:** Full CRUD capabilities with real-time updates and seamless state management.
- **AI Decision Engine:** Algorithmic evaluation of products computing profit margins, risk levels, and confidence ratings.
- **Supplier Scoring System:** Automatically calculates a supplier's reliability score and risk profile based on their delivery times, return rates, and past performance.
- **Interactive Business Analytics:** Beautiful, responsive charts (Radar and Line graphs via Chart.js) visualizing product portfolio health and simulated revenue trends.
- **Execution Workflow Tracker:** A dynamic step-by-step pipeline execution tracker for pushing a product from "Selection" to "Final Decision".
- **Zero-Config Local Dev:** The backend leverages an in-memory MongoDB fallback out-of-the-box so you can run the app immediately even without a remote database string.

## 🛠 Technology Stack

### Frontend
- **Framework:** React 18 (Bootstrapped with Vite)
- **Styling:** Tailwind CSS with custom glassmorphism and modern gradient overlays
- **Animations:** Framer Motion
- **Icons & Visuals:** Lucide React, Chart.js / React-Chartjs-2
- **Routing:** React Router v6
- **Network Requests:** Axios

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript (executed via `tsx`)
- **Security & Optimization:** Helmet, Cors, Express-Rate-Limit, Morgan (Logging)

### Database & Storage
- **Primary Database:** MongoDB Atlas
- **ODM:** Mongoose
- **Dev-Environment Fallback:** `mongodb-memory-server`

## 🏗 Architecture & Project Structure

The platform follows a classic Client-Server architecture separated into `src/` (Frontend) and `server/` (Backend).

```text
ai-dropshipping-decision-planner/
├── server/                      # Express.js Backend
│   ├── models/                  # Mongoose Schemas (Activity, Product, Supplier, Workflow)
│   ├── routes/                  # REST API Endpoints (/analysis, /products, /suppliers, etc.)
│   └── index.ts                 # Server entry point & DB connection logic
├── src/                         # React Frontend
│   ├── components/              # Reusable UI components (Modals, Protected Routes, Layout)
│   ├── context/                 # Global State (DataContext, ToastContext)
│   ├── pages/                   # Application views (Dashboard, Analysis, Charts, etc.)
│   ├── services/                # Axios API clients
│   ├── App.tsx                  # Core React Router setup
│   └── main.tsx                 # Vite mounting point
├── .env.example                 # Environment variables template
├── package.json                 # Project dependencies & scripts
└── vite.config.ts               # Vite configuration
```

### Data Flow
1. User interacts with a highly responsive React frontend.
2. `axios` intercepts the request and sends it to the Express REST API (running on `localhost:8080`).
3. Express processes business logic, interacting with the MongoDB cluster via Mongoose models.
4. Responses are sent back, and UI state is seamlessly animated using Framer Motion.

## 🚀 Installation and Setup

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/PrernaAsswani/Ai-Dropshipping-Decision-Planner.git
cd Ai-Dropshipping-Decision-Planner
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory. You can copy the template:
```bash
cp .env.example .env
```
Inside `.env`, define your MongoDB URI:
```env
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/decision_intel?retryWrites=true&w=majority"
PORT=8080
```
> **Note:** If `MONGODB_URI` is left blank, the application will automatically provision an in-memory MongoDB server for testing and evaluation without any configuration!

### 4. Run the Application

You need to start both the backend server and the frontend client. Open two separate terminals:

**Terminal 1 (Backend Server):**
```bash
npm run server
```
*You should see "MongoDB Connected" and "Server running on port 8080".*

**Terminal 2 (Frontend Client):**
```bash
npm run dev
```
*The frontend will be available at `http://localhost:3000` or `http://localhost:5173`.*

## 🔒 Security Measures Implemented
- **Helmet.js** protects Express apps by setting various HTTP headers.
- **Express-Rate-Limit** prevents brute-force attacks and limits repeated requests to public APIs.
- **CORS Configuration** strictly binds the backend to frontend origin requests.
- **Environment Variable Protection** prevents sensitive data like DB credentials from being tracked in version control.

## 🤝 Contributing
Contributions are always welcome! If you have suggestions or want to add a new feature:
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---
*Built with passion for data-driven decisions.*
