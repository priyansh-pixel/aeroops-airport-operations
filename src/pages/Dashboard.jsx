import { useAeroOps } from "../context/AeroOpsContext";

function Dashboard() {
  const {
    flights,
    incidents,
    loading,
  } = useAeroOps();

  // ==========================================
  // ACTIVE INCIDENTS
  // ==========================================

  const activeIncidents = incidents.filter(
    (incident) =>
      incident.status !== "Resolved"
  );

  const criticalIncidents =
    activeIncidents.filter(
      (incident) =>
        incident.severity === "Critical" ||
        incident.severity === "High"
    );

  // ==========================================
  // FLIGHT METRICS
  // ==========================================

  const delayedFlights = flights.filter(
    (flight) =>
      Number(flight.delay_minutes || 0) > 0
  );

  const highRiskFlights = flights.filter(
    (flight) => flight.risk === "High"
  );

  const totalDelay = flights.reduce(
    (sum, flight) =>
      sum +
      Number(flight.delay_minutes || 0),
    0
  );

  const averageDelay =
    flights.length === 0
      ? 0
      : Math.round(
          totalDelay / flights.length
        );

  const onTimeFlights = flights.filter(
    (flight) =>
      Number(flight.delay_minutes || 0) === 0
  );

  const onTimePerformance =
    flights.length === 0
      ? 0
      : Math.round(
          (onTimeFlights.length /
            flights.length) *
            100
        );

  // ==========================================
  // OPERATIONAL HEALTH SCORE
  // ==========================================

  let operationalScore = 100;

  operationalScore -=
    highRiskFlights.length * 15;

  operationalScore -=
    criticalIncidents.length * 10;

  operationalScore -=
    delayedFlights.length * 5;

  operationalScore = Math.max(
    0,
    operationalScore
  );

  let healthStatus = "Stable";

  if (operationalScore < 80) {
    healthStatus = "Monitor";
  }

  if (operationalScore < 60) {
    healthStatus = "Critical";
  }

  // ==========================================
  // PRIORITY ALERTS
  // ==========================================

  const priorityAlerts = [];

  highRiskFlights.forEach((flight) => {
    priorityAlerts.push({
      id: `flight-${flight.id}`,
      type: "Flight Risk",
      title: `${flight.flight_number} requires attention`,
      description: `${flight.delay_minutes || 0} min delay • ${
        flight.status
      }`,
      severity: "High",
    });
  });

  criticalIncidents.forEach((incident) => {
    priorityAlerts.push({
      id: `incident-${incident.id}`,
      type: "Incident",
      title:
        incident.title ||
        incident.incident_code,
      description: `${
        incident.flight_number ||
        "Airport Operations"
      } • ${incident.team || "Team unassigned"}`,
      severity: incident.severity,
    });
  });

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <>
        <div className="header">
          <div>
            <h1>
              Airport Operations Control Center
            </h1>

            <p>
              Loading operational intelligence...
            </p>
          </div>
        </div>

        <section className="panel">
          <p>
            Loading airport operations...
          </p>
        </section>
      </>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <>
      {/* HEADER */}

      <div className="header">
        <div>
          <h1>
            Airport Operations Control Center
          </h1>

          <p>
            Real-time operational intelligence &
            decision support
          </p>
        </div>

        <span className="live">
          ● LIVE
        </span>
      </div>

      {/* PRIMARY KPI */}

      <div className="kpis">
        <div className="card">
          <p>Active Flights</p>

          <h2>{flights.length}</h2>

          <small>
            Flights currently monitored
          </small>
        </div>

        <div className="card">
          <p>Delayed Flights</p>

          <h2>
            {delayedFlights.length}
          </h2>

          <small>
            Average {averageDelay} min
          </small>
        </div>

        <div className="card">
          <p>High Risk Flights</p>

          <h2>
            {highRiskFlights.length}
          </h2>

          <small>
            Require operational attention
          </small>
        </div>

        <div className="card">
          <p>Active Incidents</p>

          <h2>
            {activeIncidents.length}
          </h2>

          <small>
            {criticalIncidents.length} high
            priority
          </small>
        </div>
      </div>

      {/* OPERATIONAL HEALTH */}

      <section className="panel">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div>
            <p>
              AIRPORT OPERATIONAL HEALTH
            </p>

            <h1>
              {operationalScore}/100
            </h1>

            <strong>
              {healthStatus}
            </strong>
          </div>

          <div
            style={{
              textAlign: "right",
            }}
          >
            <p>
              On-Time Performance
            </p>

            <h2>
              {onTimePerformance}%
            </h2>

            <p>
              Total Delay: {totalDelay} min
            </p>
          </div>
        </div>

        <div
          className="progress-track"
          style={{
            marginTop: "20px",
          }}
        >
          <div
            className="progress-fill"
            style={{
              width: `${operationalScore}%`,
            }}
          />
        </div>
      </section>

      {/* PRIORITY ALERTS */}

      <section className="panel">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2>
            Priority Operational Alerts
          </h2>

          <span>
            {priorityAlerts.length} alerts
          </span>
        </div>

        {priorityAlerts.length === 0 && (
          <div
            className="alert success"
            style={{
              marginTop: "15px",
            }}
          >
            ✓ No high-priority operational
            alerts.
          </div>
        )}

        {priorityAlerts.map((alert) => (
          <div
            key={alert.id}
            className="alert danger"
            style={{
              marginTop: "12px",
            }}
          >
            <strong>
              ⚠ {alert.type}
            </strong>

            <h3>
              {alert.title}
            </h3>

            <p>
              {alert.description}
            </p>
          </div>
        ))}
      </section>

      {/* FLIGHT RISK MONITOR */}

      <section className="panel">
        <h2>
          Flight Risk Monitor
        </h2>

        {flights.length === 0 && (
          <p>No flights available.</p>
        )}

        <div className="flight-list">
          {flights.map((flight) => (
            <div
              className="flight-card"
              key={flight.id}
            >
              <div className="flight-top">
                <div>
                  <h2>
                    {flight.flight_number}
                  </h2>

                  <p>
                    {flight.airline}
                  </p>
                </div>

                <span
                  className={`badge ${
                    flight.risk === "High"
                      ? "danger"
                      : flight.risk ===
                          "Medium"
                      ? "warning"
                      : "success"
                  }`}
                >
                  {flight.risk || "Low"} Risk
                </span>
              </div>

              <p>
                {flight.origin} →{" "}
                {flight.destination}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(3, 1fr)",
                  gap: "15px",
                  marginTop: "15px",
                }}
              >
                <div>
                  <small>Gate</small>

                  <p>
                    <strong>
                      {flight.gate ||
                        "Unassigned"}
                    </strong>
                  </p>
                </div>

                <div>
                  <small>Delay</small>

                  <p>
                    <strong>
                      {Number(
                        flight.delay_minutes ||
                          0
                      )}{" "}
                      min
                    </strong>
                  </p>
                </div>

                <div>
                  <small>Status</small>

                  <p>
                    <strong>
                      {flight.status}
                    </strong>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* INCIDENT COMMAND CENTER */}

      <section className="panel">
        <h2>
          Incident Command Center
        </h2>

        {activeIncidents.length === 0 ? (
          <div className="alert success">
            ✓ No active operational incidents.
          </div>
        ) : (
          activeIncidents.map(
            (incident) => (
              <div
                className={
                  incident.severity ===
                    "High" ||
                  incident.severity ===
                    "Critical"
                    ? "alert danger"
                    : "alert warning"
                }
                key={incident.id}
                style={{
                  marginTop: "12px",
                }}
              >
                <strong>
                  {incident.incident_code}
                  {" • "}
                  {incident.severity}
                </strong>

                <h3>
                  {incident.title}
                </h3>

                <p>
                  Flight:{" "}
                  {incident.flight_number ||
                    "N/A"}
                </p>

                <p>
                  Assigned:{" "}
                  {incident.team ||
                    "Unassigned"}
                </p>

                <p>
                  Status:{" "}
                  {incident.status}
                </p>
              </div>
            )
          )
        )}
      </section>
    </>
  );
}

export default Dashboard;