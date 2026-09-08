# ✈️ AeroOps — Airport Operations Management & Decision Support System

AeroOps is a full-stack, real-time airport operations management platform designed to provide airport operations teams with a centralized view of flights, gates, turnaround activities, operational incidents, delays, and risk.

The system combines operational monitoring, workflow management, real-time database updates, and rule-based decision support into a single Airport Operations Control Center.

## 🌐 Live Demo

**Live Application:**  
https://aeroops-airport-operations.vercel.app

> The application uses authenticated access because operational actions such as gate assignments and incident management modify the backend database.

---

## 🎯 Problem Statement

Airport operations involve multiple interconnected activities including flight monitoring, gate allocation, aircraft turnaround, baggage handling, fueling, boarding, and incident management.

When these activities are monitored independently, operational teams may face:

- delayed identification of operational risks
- inefficient gate utilization
- poor visibility into aircraft turnaround activities
- fragmented incident tracking
- difficulty understanding how disruptions affect flights
- slower operational decision-making

AeroOps was developed as a centralized operational decision-support system to demonstrate how these workflows can be integrated into one real-time platform.

---

## 💡 Solution

AeroOps provides an Airport Operations Control Center where users can monitor and manage:

- flight operations
- flight delays
- operational risk
- gate assignments
- turnaround activities
- ground handling tasks
- operational incidents
- airport operational health

Changes made in one operational module can automatically affect other modules.

For example:

**Turnaround Delay → Flight Delay → Risk Escalation → Dashboard Alert**

and:

**High-Severity Incident → Flight Operational Risk → Control Center Alert**

This creates an interconnected operational workflow rather than a collection of independent dashboards.

---

# 🚀 Core Features

## 📊 Operations Control Center

The main dashboard provides a real-time overview of airport operations including:

- active flights
- delayed flights
- high-risk flights
- active incidents
- on-time performance
- total operational delay
- airport operational health score
- priority operational alerts
- flight risk monitoring
- incident command center

---

## ✈️ Flight Operations

Provides centralized monitoring of flights including:

- flight number
- airline
- origin and destination
- assigned gate
- operational status
- delay minutes
- operational risk
- active incidents

Flight information updates when operational events occur elsewhere in AeroOps.

---

## 🚪 Gate Management

Supports operational gate allocation including:

- gate availability monitoring
- flight-to-gate assignment
- occupied/available gate status
- prevention of duplicate flight assignments
- synchronization between gate and flight records
- real-time gate updates

---

## 🔄 Aircraft Turnaround Management

Tracks aircraft ground operations such as:

- aircraft cleaning
- catering
- fueling
- baggage loading
- boarding
- pushback preparation

The module monitors:

- task completion
- task status
- operational delays
- turnaround progress
- departure risk

Turnaround disruption can propagate to the associated flight and operational dashboard.

---

## 🚨 Incident Management

Provides an operational incident workflow where users can:

- report incidents
- classify incident severity
- associate incidents with flights
- assign operational teams
- monitor incident status
- resolve incidents

High-severity incidents can automatically escalate the associated flight's operational risk.

---

## ⚡ Real-Time Operations

AeroOps uses Supabase Realtime subscriptions to synchronize operational changes.

Updates to:

- flights
- gates
- incidents
- turnaround tasks

can automatically refresh connected parts of the application without requiring a manual browser refresh.

---

## 🔐 Authentication & Security

AeroOps uses Supabase Authentication for email/password authentication.

Database access is protected using PostgreSQL Row Level Security (RLS).

The MVP follows the principle of:

- public/read access where appropriate for demonstration
- authenticated operational writes
- restricted destructive actions
- environment variables for frontend configuration

Sensitive backend credentials are not stored in the GitHub repository.

---

# 🧠 Decision-Support Logic

AeroOps includes rule-based operational decision support.

Examples include:

### Incident Risk Escalation

```text
High / Critical Incident
        ↓
Associated Flight
        ↓
Risk = High
        ↓
Status = Operational Risk
        ↓
Control Center Alert
```

### Turnaround Delay Propagation

```text
Ground Handling Delay
        ↓
Turnaround Delay
        ↓
Flight Delay
        ↓
Risk Evaluation
        ↓
Operations Dashboard
```

### Gate Assignment

```text
Available Gate
      ↓
Select Flight
      ↓
Assignment Validation
      ↓
Gate = Occupied
      ↓
Flight Gate Updated
      ↓
Realtime Synchronization
```

---

# 📈 Airport Operational Health

The Operations Control Center contains an operational health indicator.

The current MVP uses a transparent rule-based heuristic derived from factors such as:

- number of delayed flights
- number of high-risk flights
- high-priority operational incidents

The score is intended as a **decision-support indicator**, not a machine-learning prediction.

This provides a foundation for future predictive operational risk models.

---

# 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │       AeroOps       │
                    │    React + Vite     │
                    └──────────┬──────────┘
                               │
                               │ Supabase JS Client
                               │
                    ┌──────────▼──────────┐
                    │      Supabase       │
                    ├─────────────────────┤
                    │ Authentication      │
                    │ PostgreSQL Database │
                    │ Row Level Security  │
                    │ Realtime            │
                    └──────────┬──────────┘
                               │
           ┌───────────────────┼───────────────────┐
           │                   │                   │
           ▼                   ▼                   ▼
       Flights              Gates             Incidents
           │                   │                   │
           └──────────────┬────┴──────────────┬────┘
                          │                   │
                          ▼                   ▼
                  Turnaround Tasks     Decision Support
                          │                   │
                          └─────────┬─────────┘
                                    ▼
                         Operations Dashboard
```

---

# 🗄️ Data Model

The current AeroOps MVP uses four primary operational tables.

### Flights

Stores information including:

- flight number
- airline
- origin
- destination
- gate
- operational status
- delay
- risk

### Gates

Stores:

- gate number
- assigned flight
- gate status
- availability information

### Turnaround Tasks

Stores:

- flight number
- operational task
- assigned team
- scheduled time
- task status
- delay minutes

### Incidents

Stores:

- incident code
- incident description
- associated flight
- severity
- assigned team
- incident status

---

# 🛠️ Technology Stack

### Frontend

- React
- Vite
- JavaScript
- CSS
- React Router

### Backend

- Supabase
- PostgreSQL
- Supabase Authentication
- Supabase Realtime
- PostgreSQL Row Level Security

### Deployment & Development

- Vercel
- Git
- GitHub
- Visual Studio Code

---

# 🔄 Example Operational Workflow

A typical AeroOps workflow can look like:

```text
Flight Arrives
     ↓
Gate Assigned
     ↓
Turnaround Begins
     ↓
Cleaning / Catering / Fueling / Baggage / Boarding
     ↓
Operational Delay Detected
     ↓
Flight Delay Updated
     ↓
Risk Level Recalculated
     ↓
Operations Control Center Alert
     ↓
Incident Managed
     ↓
Flight Prepared for Departure
```

---

# 📱 Responsive Design

AeroOps is designed to support multiple screen sizes.

The interface includes:

- full-width desktop operations dashboard
- responsive KPI layouts
- adaptive flight and gate grids
- tablet navigation
- mobile layouts
- horizontally scrollable operational tables where required

---

# ⚙️ Local Development

Clone the repository:

```bash
git clone https://github.com/priyansh-pixel/aeroops-airport-operations.git
```

Navigate to the project:

```bash
cd aeroops-airport-operations
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Start the development server:

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:5173
```

---

# 🔮 Future Enhancements

AeroOps can be expanded with:

- role-based access control for airport stakeholders
- transactional gate assignment using PostgreSQL functions
- advanced gate conflict management
- predictive flight-delay models
- turnaround delay prediction
- historical operational analytics
- airline and terminal filtering
- aircraft-tail-level tracking
- SLA monitoring
- automated operational notifications
- maintenance workflows
- resource and workforce allocation
- audit logs
- mobile-first operational interfaces

---

# 📌 Project Status

**Current Stage:** Functional MVP

Implemented:

- ✅ Supabase database integration
- ✅ Email/password authentication
- ✅ Row Level Security
- ✅ Real-time synchronization
- ✅ Flight monitoring
- ✅ Gate management
- ✅ Flight-to-gate assignment
- ✅ Turnaround monitoring
- ✅ Incident reporting and resolution
- ✅ Operational risk propagation
- ✅ Airport Operations Control Center
- ✅ Responsive interface
- ✅ Vercel production deployment

---

# 👨‍💻 Author

**Priyansh Srivastava**

GitHub:  
https://github.com/priyansh-pixel

---

## ⭐ About the Project

AeroOps was developed as a portfolio project demonstrating how modern web technologies, relational databases, real-time systems, operational workflows, and business decision-support concepts can be combined to address airport operations management challenges.
