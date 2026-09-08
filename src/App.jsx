import DatabaseTest from "./pages/DatabaseTest";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Flights from "./pages/Flights";
import Gates from "./pages/Gates";
import Turnaround from "./pages/Turnaround";
import Incidents from "./pages/Incidents";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <aside className="sidebar">
          <h2>AeroOps</h2>

          <nav>
            <NavLink to="/">Dashboard</NavLink>
            <NavLink to="/flights">Flights</NavLink>
            <NavLink to="/gates">Gates</NavLink>
            <NavLink to="/turnaround">Turnaround</NavLink>
            <NavLink to="/incidents">Incidents</NavLink>
          </nav>
        </aside>

        <main className="main">
          <Routes>
<Route
  path="/database-test"
  element={<DatabaseTest />}
/>
            <Route path="/" element={<Dashboard />} />
            <Route path="/flights" element={<Flights />} />
            <Route path="/gates" element={<Gates />} />
            <Route path="/turnaround" element={<Turnaround />} />
            <Route path="/incidents" element={<Incidents />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
