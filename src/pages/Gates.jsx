import { useState } from "react";

const initialGates = [
  { gate: "G01", flight: "AI202", status: "Occupied", available: "15:15" },
  { gate: "G02", flight: null, status: "Available", available: "Now" },
  { gate: "G03", flight: "AI821", status: "Occupied", available: "16:05" },
  { gate: "G04", flight: null, status: "Available", available: "Now" },
  { gate: "G05", flight: "6E415", status: "Occupied", available: "15:40" },
  { gate: "G06", flight: null, status: "Available", available: "Now" },
  { gate: "G07", flight: "UK904", status: "Occupied", available: "16:20" },
  { gate: "G08", flight: "AI302", status: "Conflict", available: "15:50" },
  { gate: "G09", flight: null, status: "Available", available: "Now" },
  { gate: "G10", flight: null, status: "Available", available: "Now" },
  { gate: "G11", flight: "6E221", status: "Occupied", available: "16:10" },
  { gate: "G12", flight: "6E415", status: "Occupied", available: "15:35" },
];

function Gates() {
  const [gates, setGates] = useState(initialGates);

  const occupied = gates.filter(
    (g) => g.status === "Occupied"
  ).length;

  const available = gates.filter(
    (g) => g.status === "Available"
  ).length;

  const conflicts = gates.filter(
    (g) => g.status === "Conflict"
  ).length;

  function resolveConflict() {
    setGates((current) =>
      current.map((gate) =>
        gate.gate === "G08"
          ? {
              ...gate,
              status: "Occupied",
              available: "15:50",
            }
          : gate
      )
    );
  }

  return (
    <>
      <div className="header">
        <div>
          <h1>Gate Management</h1>
          <p>Real-time gate allocation & conflict monitoring</p>
        </div>

        <span className="live">● LIVE</span>
      </div>

      <div className="kpis">
        <div className="card">
          <p>Total Gates</p>
          <h2>{gates.length}</h2>
        </div>

        <div className="card">
          <p>Occupied</p>
          <h2>{occupied}</h2>
        </div>

        <div className="card">
          <p>Available</p>
          <h2>{available}</h2>
        </div>

        <div className="card">
          <p>Conflicts</p>
          <h2>{conflicts}</h2>
        </div>
      </div>

      {conflicts > 0 && (
        <section className="conflict-box">
          <div>
            <strong>⚠ Gate Conflict Detected</strong>

            <p>
              AI302 currently occupies G08. Incoming flight
              AI506 requires the same gate before scheduled
              availability.
            </p>

            <p>
              Recommended action: Reallocate AI506 to G10.
            </p>
          </div>

          <button onClick={resolveConflict}>
            Resolve Conflict
          </button>
        </section>
      )}

      <section className="panel">
        <h2>Gate Status</h2>

        <div className="gate-grid">
          {gates.map((gate) => (
            <div
              key={gate.gate}
              className={`gate-card ${gate.status.toLowerCase()}`}
            >
              <div className="gate-top">
                <h2>{gate.gate}</h2>

                <span>
                  {gate.status}
                </span>
              </div>

              <p>
                Flight:{" "}
                <strong>
                  {gate.flight || "None"}
                </strong>
              </p>

              <p>
                Available: {gate.available}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default Gates;
