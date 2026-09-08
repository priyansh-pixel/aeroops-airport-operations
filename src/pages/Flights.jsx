import { useAeroOps } from "../context/AeroOpsContext";

function Flights() {
  const {
    flights,
    incidents,
    loading,
  } = useAeroOps();

  // ==========================================
  // FLIGHT STATISTICS
  // ==========================================

  const totalFlights = flights.length;

  const delayedFlights = flights.filter(
    (flight) =>
      Number(flight.delay_minutes || 0) > 0
  ).length;

  const highRiskFlights = flights.filter(
    (flight) => flight.risk === "High"
  ).length;

  const operationalRiskFlights =
    flights.filter(
      (flight) =>
        flight.status === "Operational Risk"
    ).length;

  // ==========================================
  // GET ACTIVE INCIDENTS FOR A FLIGHT
  // ==========================================

  function getActiveIncidents(flightNumber) {
    return incidents.filter(
      (incident) =>
        incident.flight_number ===
          flightNumber &&
        incident.status !== "Resolved"
    );
  }

  // ==========================================
  // STATUS CLASS
  // ==========================================

  function getStatusClass(status) {
    if (status === "Operational Risk") {
      return "danger";
    }

    if (status === "Ready for Departure") {
      return "success";
    }

    if (status === "Turnaround") {
      return "warning";
    }

    return "";
  }

  // ==========================================
  // RISK CLASS
  // ==========================================

  function getRiskClass(risk) {
    if (risk === "High") {
      return "danger";
    }

    if (risk === "Medium") {
      return "warning";
    }

    return "success";
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <>
        <div className="header">
          <div>
            <h1>Flight Operations</h1>
            <p>
              Real-time flight monitoring and
              operational status
            </p>
          </div>

          <span className="live">
            ● LIVE
          </span>
        </div>

        <section className="panel">
          <p>Loading flights...</p>
        </section>
      </>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <>
      <div className="header">
        <div>
          <h1>Flight Operations</h1>

          <p>
            Real-time flight monitoring and
            operational status
          </p>
        </div>

        <span className="live">
          ● LIVE
        </span>
      </div>

      {/* KPI CARDS */}

      <div className="kpis">
        <div className="card">
          <p>Total Flights</p>
          <h2>{totalFlights}</h2>
        </div>

        <div className="card">
          <p>Delayed Flights</p>
          <h2>{delayedFlights}</h2>
        </div>

        <div className="card">
          <p>High Risk</p>
          <h2>{highRiskFlights}</h2>
        </div>

        <div className="card">
          <p>Operational Risk</p>
          <h2>{operationalRiskFlights}</h2>
        </div>
      </div>

      {/* FLIGHT LIST */}

      <section className="panel">
        <h2>Live Flight Operations</h2>

        {flights.length === 0 && (
          <p>No flights available.</p>
        )}

        <div className="flight-list">
          {flights.map((flight) => {
            const activeIncidents =
              getActiveIncidents(
                flight.flight_number
              );

            return (
              <div
                className="flight-card"
                key={flight.id}
              >
                {/* FLIGHT HEADER */}

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
                    className={`badge ${getRiskClass(
                      flight.risk
                    )}`}
                  >
                    {flight.risk || "Low"} Risk
                  </span>
                </div>

                {/* ROUTE */}

                <div
                  style={{
                    marginTop: "15px",
                  }}
                >
                  <p>
                    <strong>
                      {flight.origin}
                    </strong>
                    {" → "}
                    <strong>
                      {flight.destination}
                    </strong>
                  </p>
                </div>

                {/* OPERATION DETAILS */}

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
                      <span
                        className={`badge ${getStatusClass(
                          flight.status
                        )}`}
                      >
                        {flight.status ||
                          "Unknown"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* ACTIVE INCIDENT WARNING */}

                {activeIncidents.length >
                  0 && (
                  <div
                    className="alert danger"
                    style={{
                      marginTop: "15px",
                    }}
                  >
                    <strong>
                      ⚠{" "}
                      {
                        activeIncidents.length
                      }{" "}
                      Active Incident
                      {activeIncidents.length >
                      1
                        ? "s"
                        : ""}
                    </strong>

                    {activeIncidents.map(
                      (incident) => (
                        <p
                          key={incident.id}
                        >
                          {
                            incident.incident_code
                          }{" "}
                          — {incident.title} (
                          {incident.severity})
                        </p>
                      )
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

export default Flights;