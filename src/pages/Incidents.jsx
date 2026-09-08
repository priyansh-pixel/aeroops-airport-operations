import { useState } from "react";
import { useAeroOps } from "../context/AeroOpsContext";

function Incidents() {
  const {
    incidents,
    addIncident,
    resolveIncident,
  } = useAeroOps();

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    title: "",
    flight: "",
    severity: "Medium",
    team: "",
  });

  const open = incidents.filter(
    (i) => i.status !== "Resolved"
  ).length;

  const critical = incidents.filter(
    (i) =>
      i.severity === "Critical" &&
      i.status !== "Resolved"
  ).length;

  const resolved = incidents.filter(
    (i) => i.status === "Resolved"
  ).length;

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  function reportIncident(event) {
    event.preventDefault();

    if (!form.title || !form.flight || !form.team) {
      alert("Please complete all fields.");
      return;
    }

    addIncident({
      id: `INC-${String(incidents.length + 1).padStart(3, "0")}`,
      ...form,
      status: "Open",
    });

    setForm({
      title: "",
      flight: "",
      severity: "Medium",
      team: "",
    });

    setShowForm(false);
  }

  return (
    <>
      <div className="header">
        <div>
          <h1>Incident Management</h1>
          <p>Track and resolve airport operational disruptions</p>
        </div>

        <span className="live">● LIVE</span>
      </div>

      <div className="kpis">
        <div className="card">
          <p>Total Incidents</p>
          <h2>{incidents.length}</h2>
        </div>

        <div className="card">
          <p>Active</p>
          <h2>{open}</h2>
        </div>

        <div className="card">
          <p>Critical</p>
          <h2>{critical}</h2>
        </div>

        <div className="card">
          <p>Resolved</p>
          <h2>{resolved}</h2>
        </div>
      </div>

      <button
        className="primary-button"
        onClick={() => setShowForm(!showForm)}
      >
        + Report Incident
      </button>

      {showForm && (
        <section className="panel">
          <h2>Report New Incident</h2>

          <form
            className="incident-form"
            onSubmit={reportIncident}
          >
            <label>
              Incident
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Hydraulic leak"
              />
            </label>

            <label>
              Flight
              <input
                name="flight"
                value={form.flight}
                onChange={handleChange}
                placeholder="e.g. AI302"
              />
            </label>

            <label>
              Severity
              <select
                name="severity"
                value={form.severity}
                onChange={handleChange}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </label>

            <label>
              Assigned Team
              <input
                name="team"
                value={form.team}
                onChange={handleChange}
                placeholder="Engineering Team E2"
              />
            </label>

            <button
              type="submit"
              className="primary-button"
            >
              Submit Incident
            </button>
          </form>
        </section>
      )}

      <section className="panel">
        <h2>Operational Incidents</h2>

        <div className="incident-list">
          {incidents.map((incident) => (
            <div
              key={incident.id}
              className={`incident-card ${incident.severity.toLowerCase()}`}
            >
              <div>
                <small>{incident.id}</small>

                <h3>{incident.title}</h3>

                <p>
                  Flight {incident.flight} • {incident.team}
                </p>
              </div>

              <div className="incident-actions">
                <strong>{incident.severity}</strong>

                <span>{incident.status}</span>

                {incident.status !== "Resolved" && (
                  <button
                    onClick={() =>
                      resolveIncident(incident.id)
                    }
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default Incidents;
