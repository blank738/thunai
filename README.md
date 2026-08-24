# THUNAI (துணை) — Smart Resource Redistribution Platform
> **Tagline:** Connect. Collect. Deliver. Hope.  
> **Sub-tagline:** *Donor → THUNAI Smart Matching → NGO → Orphanage*  
> **Geographic Focus:** Tiruchirappalli (Trichy), Tamil Nadu, India

---

## 🌟 Executive Summary

**THUNAI** (meaning *"Companion / Support"* in Tamil) is an intelligent, location-based social-impact platform designed to solve the critical logistics gap in community resource redistribution.

While donors often have surplus food and goods, and orphanages have urgent deficits, direct matching frequently fails due to transport limitations, food perishability, and coordination bottlenecks. **THUNAI solves this by establishing verified NGOs as the physical coordination, transport, and delivery bridge.**

```
┌──────────────┐       ┌────────────────────────────┐       ┌──────────────────────┐       ┌────────────────────────┐
│  1. DONOR    │  ───> │  2. THUNAI SMART MATCHING  │  ───> │  3. VERIFIED NGO     │  ───> │  4. ORPHANAGE (HOME)   │
│  Posts Offer │       │  Multi-Factor AI Scoring   │       │  Collects & Transports│      │  Digital Receipt Sign  │
└──────────────┘       └────────────────────────────┘       └──────────────────────┘       └────────────────────────┘
```

---

## 🎯 UN Sustainable Development Goals (SDG) Alignment

THUNAI directly accelerates 5 United Nations Sustainable Development Goals:

- **SDG 2 — Zero Hunger:** Rapid food rescue matching expiring banquet & restaurant meals within 4 hours to hungry children.
- **SDG 4 — Quality Education:** Distributing notebooks, school bags, pens, and digital devices to underprivileged students.
- **SDG 10 — Reduced Inequalities:** Bridging resource deficits across sheltered children and grassroots orphanages.
- **SDG 12 — Responsible Consumption & Production:** Diverting high-quality surplus meals and textiles from landfills.
- **SDG 17 — Partnerships for the Goals:** Uniting community donors, transport NGOs, and child care institutions in a transparent trust network.

---

## 🔄 The 7-Step Core Workflow

Every resource transaction in THUNAI executes through an immutable 7-step lifecycle answering **Who has the resource? Who collects it? Who needs it? How far are they? What is the real-time status?**

1. **Step 1: Orphanage Posts a Need**  
   Orphanage publishes required items (e.g. 80 meals, 50 notebooks) with required-by dates and priority (Normal, Medium, Urgent).
2. **Step 2: Donor Posts a Donation**  
   Donor posts surplus food (Veg/Non-Veg, meal count, prep time, best-before) or item packages (condition, pickup zone).
3. **Step 3: THUNAI Finds Best Match**  
   Smart Matching algorithm calculates a 0–100% Match Score across distance, category, quantity, urgency, food expiry, and NGO fleet radius.
4. **Step 4: NGO Accepts Job**  
   Verified NGO inspects route distance (Donor ➔ NGO ➔ Orphanage) and accepts pickup custody. Status changes to `🟢 NGO Accepted`.
5. **Step 5: NGO Collects Donation**  
   NGO schedules pickup and collects items from donor. Status advances: `Pickup Scheduled` ➔ `📦 Picked Up`.
6. **Step 6: NGO Delivers to Orphanage**  
   NGO drives to orphanage and uploads delivery handover proof. Status advances: `🚚 Out for Delivery` ➔ `Delivered`.
7. **Step 7: Orphanage Confirms Receipt**  
   Orphanage signs the Digital Signature Canvas or enters name verification. Custody closes: `✅ Confirmed & Closed`. Donor receives a **Certificate of Social Impact**.

---

## 🧠 Smart Matching Engine & Formula

The matching engine ranks pending requests and compatible NGOs using a multi-factor weighted equation:

$$\text{Match Score} = S_{\text{distance}} (30\%) + S_{\text{resource}} (20\%) + S_{\text{quantity}} (20\%) + S_{\text{urgency}} (15\%) + S_{\text{expiry}} (15\%) + S_{\text{transport}} (10\%)$$

- **Distance Score (30 pts):** Evaluated via Haversine distance formula $\le$ NGO service radius ($3\text{--}30\text{ km}$).
- **Resource Match (20 pts):** Category and item taxonomy alignment.
- **Quantity Match (20 pts):** Proportional quantity fit with **Partial Allocation Support** (e.g. 100 available, 60 allocated $\rightarrow$ 40 remains available for next match).
- **Urgency Bonus (15 pts):** Higher weight for `🔴 Urgent` requirements and 1-Click SOS emergency requests.
- **Food Expiry Weight (15 pts):** Boosts donations expiring in $< 4\text{ hours}$ to prevent food waste.
- **Transport Fleet Fit (10 pts):** Matches heavy sacks/meals with Vans and stationery with Two-wheelers.

---

## 👥 Role Matrix & Features

### 🍱 1. Donor Portal (“Give What You Can.”)
- **Food Rescue Form:** Veg/Non-Veg toggles, meal counts, preparation time, best-before timestamps, and packaging instructions.
- **Item Donation Form:** Books, school bags, stationery, clothing, groceries, electronics with condition ratings.
- **Photo Upload:** Simulated photo attachment and live preview.
- **Real-Time Status Tracker:** 5-question status layout, custody stepper, and live progress bars.
- **Certificate of Impact Modal:** Printable verified certificate with THUNAI verification seal for completed donations.

### 🚐 2. NGO Coordination Bridge (Core Logistics Hub)
- **Nearby Matching Jobs:** Displays match score breakdown pills (Distance, Qty Fit, Urgency, Expiry, Fleet).
- **Nearby Orphanage Demands:** Browses unfulfilled requirements within service radius.
- **Transit Control Bar:** 1-click status transitions (`Schedule Pickup` ➔ `Mark Picked Up` ➔ `Out for Delivery` ➔ `Mark Delivered`).
- **Proof of Delivery Modal:** Handover document / photo verification upload before closing transit.
- **Transport Profile Configurator:** Service radius slider ($3\text{--}30\text{ km}$) and vehicle fleet checklist (Vans, Cars, Two-Wheelers, Volunteer vehicles).

### 🏠 3. Orphanage Recipient Portal (“Request What You Need.”)
- **Resource Requirement Post:** Category selector, quantities, required-by calendar, and priority toggles.
- **1-Click SOS Emergency Button:** Instantly broadcasts urgent meal/ration deficit alerts to all verified NGOs.
- **Digital Signature Pad:** HTML5 Canvas signature pad supporting stylus/finger touch and cursive name verification.
- **Incoming Deliveries Tracker:** Real-time visibility into driver assignment, pickup progress, and ETA.

### 🛡️ 4. Administrator Console
- **Partner Verification Engine:** Audit and approve/revoke NGO transport bridges and orphanage centers.
- **Resource Registry Ledger:** Live audits of active donations, partial allocations, requests, and custody shipments.
- **Census & Social Impact Analytics:** Metric cards tracking kg of food rescued, items distributed, and children supported.
- **Demo Database Reset:** 1-click reset to seed demo state.

### 🗺️ 5. Interactive Trichy Geospatial Map
- **Landmark Anchors:** Kaveri River, Rockfort Hill, Cantonment, Thillai Nagar, KK Nagar, and Kailasapuram.
- **Dynamic Route Lines:** Animated dashed vectors connecting matched `Donor (Blue) ➔ NGO (Green) ➔ Orphanage (Orange)`.
- **Radius Filters:** 2 km, 5 km, 10 km, and 25 km scope filtering.
- **Entity Popover:** Full details with coordinates, contact numbers, active listings, and distance callouts.

---

## 🛠️ Technology Stack

- **Frontend Framework:** React 19 + Vite 8
- **Styling:** Custom Modern CSS Design System (CSS Custom Properties, Glassmorphism, Dark/Light Themes, Micro-animations)
- **Iconography:** Lucide React
- **Audio Synthesis:** HTML5 Web Audio API for interactive notification chimes
- **Canvas:** HTML5 2D Context for digital signature pad
- **Data Persistence:** Browser LocalStorage with automatic schema migration and seed resilience

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation & Run

1. Clone or open the repository:
   ```bash
   cd thunai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

4. Build production bundle:
   ```bash
   npm run build
   ```

---

## 🧪 Role Simulator Guide

To explore the entire platform without logging in and out, use the **Role Switcher Dropdown** in the top navigation bar:

1. Switch to **🏠 Orphanage (Hope Children)** and click **"1-Click SOS Food Need"**.
2. Switch to **🍱 Donor (Grand Palace)** and post **"100 Veg Briyani Packets"** with expiry set to today evening.
3. Switch to **🚐 NGO (CareConnect)** to see the **98% Smart Match** and click **"Accept Donation Pickup"**.
4. Step through the transit buttons: `Schedule Pickup` ➔ `Mark Picked Up` ➔ `Start Delivery` ➔ `Mark Delivered`.
5. Switch back to **🏠 Orphanage (Hope Children)** to sign on the **Digital Signature Pad** and confirm receipt.
6. Switch back to **🍱 Donor (Grand Palace)** to view and print your **Certificate of Social Impact**!

---

**THUNAI — Connect. Collect. Deliver. Hope.**
