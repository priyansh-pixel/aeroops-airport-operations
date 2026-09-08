import { useAeroOps } from "../context/AeroOpsContext";

function Dashboard() {
  const {
  flights,
  incidents,
  resetDemoData,
} = useAeroOps();

  const activeIncidents = incidents.filter(
    (incident) => incident.status !== "Resolved"
  );

  const criticalIncidents = activeIncidents.filter(
    (incident) => incident.severity === "Critical"
  );

  const highRiskFlights = flights.filter(
    (flight) => flight.risk === "High"
  );

  const delayedFlights = flights.filter(
    (flight) => flight.delay > 0
  );

  const averageDelay =
    flights.length > 0
      ? Math.round(
          flights.reduce(
            (sum, flight) => sum + flight.delay,
            0
          ) / flights.length
        )
      : 0;

  const onTimeFlights = flights.filter(
    (flight) => flight.delay === 0
  ).length;

  const onTimePerformance =
    flights.length > 0
      ? Math.round(
          (onTimeFlights / flights.length) * 100
        )
      : 0;

  return (
    <>
      <div className="header">
        <div>
          <h1>Airport Operations Control Center</h1>
          <p>Live operational overview</p>
        </div>

        <span className="live">● LIVE</span>
      </div>

      <div className="kpis">
        <div className="card">
          <p>Total Flights</p>
          <h2>{flights.length}</h2>
        </div>

        <div className="card">
          <p>On-Time Performance</p>
          <h2>{onTimePerformance}%</h2>
        </div>

        <div className="card">
          <p>Average Delay</p>
          <h2>{averageDelay} min</h2>
        </div>

        <div className="card">
          <p>High-Risk Flights</p>
          <h2>{highRiskFlights.length}</h2>
        </div>

        <div className="card">
          <p>Delayed Flights</p>
          <h2>{delayedFlights.length}</h2>
        </div>

        <div className="card">
          <p>Active Incidents</p>
          <h2>{activeIncidents.length}</h2>
        </div>

        <div className="card">
          <p>Critical Incidents</p>
          <h2>{criticalIncidents.length}</h2>
        </div>

        <div className="card">
          <p>Resolved Incidents</p>
          <h2>
<button
  className="primary-button"
  onClick={resetDemoData}
>
  Reset Demo Data
</button>
            {
              incidents.filter(
                (incident) =>
                  incident.status === "Resolved"
              ).length
            }
          </h2>
        </div>
      </div>

      <section className="panel">
        <h2>Operational Alerts</h2>

        {activeIncidents.length === 0 ? (
          <div className="alert success">
            No active operational incidents.
          </div>
        ) : (
          activeIncidents.map((incident) => (
            <div
              key={incident.id}
              className={`alert ${
                incident.severity === "Critical" ||
                incident.severity === "High"
                  ? "danger"
                  : "warning"
              }`}
            >
              <strong>
                {incident.severity}: {incident.title}
              </strong>

              <div>
                Flight {incident.flight} • {incident.team}
              </div>
            </div>
          ))
        )}
      </section>

      <section className="panel">
        <h2>High-Risk Flights</h2>

        {highRiskFlights.length === 0 ? (
          <div className="alert success">
            No flights currently classified as high risk.
          </div>
        ) : (
          <div className="risk-flight-list">
            {highRiskFlights.map((flight) => (
              <div
                key={flight.flight}
                className="risk-flight-card"
              >
                <div>
                  <h3>{flight.flight}</h3>

                  <p>
                    {flight.airline} • Gate {flight.gate}
                  </p>
                </div>

                <div>
                  <strong>{flight.delay} min delay</strong>
                  <span className="risk high">
                    HIGH
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default Dashboard;
