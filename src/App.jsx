import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "./lib/supabaseClient";

import Dashboard from "./pages/Dashboard";
import Flights from "./pages/Flights";
import Gates from "./pages/Gates";
import Turnaround from "./pages/Turnaround";
import Incidents from "./pages/Incidents";
import Login from "./pages/Login";

import "./App.css";

function App() {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] =
    useState(true);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
        setLoadingSession(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  if (loadingSession) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return (
      <Login
        onLogin={(newSession) =>
          setSession(newSession)
        }
      />
    );
  }

  return (
    <BrowserRouter>
      <div className="app">
        <aside className="sidebar">
          <h2>AeroOps</h2>

          <nav>
            <NavLink to="/">
              Dashboard
            </NavLink>

            <NavLink to="/flights">
              Flights
            </NavLink>

            <NavLink to="/gates">
              Gates
            </NavLink>

            <NavLink to="/turnaround">
              Turnaround
            </NavLink>

            <NavLink to="/incidents">
              Incidents
            </NavLink>
          </nav>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </aside>

        <main className="main">
          <Routes>
            <Route
              path="/"
              element={<Dashboard />}
            />

            <Route
              path="/flights"
              element={<Flights />}
            />

            <Route
              path="/gates"
              element={<Gates />}
            />

            <Route
              path="/turnaround"
              element={<Turnaround />}
            />

            <Route
              path="/incidents"
              element={<Incidents />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;