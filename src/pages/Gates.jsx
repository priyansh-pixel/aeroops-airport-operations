import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

function Gates() {
  const [gates, setGates] = useState([]);
  const [flights, setFlights] = useState([]);
  const [selectedFlights, setSelectedFlights] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // ==========================================
  // LOAD DATA
  // ==========================================

  async function loadData() {
    setLoading(true);
    setErrorMessage("");

    const [
      { data: gateData, error: gateError },
      { data: flightData, error: flightError },
    ] = await Promise.all([
      supabase
        .from("gates")
        .select("*")
        .order("gate_number", { ascending: true }),

      supabase
        .from("flights")
        .select("*")
        .order("id", { ascending: true }),
    ]);

    if (gateError) {
      console.error("Gate load error:", gateError);
      setErrorMessage(gateError.message);
    }

    if (flightError) {
      console.error("Flight load error:", flightError);
      setErrorMessage(flightError.message);
    }

    setGates(gateData || []);
    setFlights(flightData || []);
    setLoading(false);
  }

  // ==========================================
  // RELEASE GATE
  // ==========================================

  async function makeGateAvailable(gate) {
    const currentFlight = gate.flight_number;

    const { error: gateError } = await supabase
      .from("gates")
      .update({
        status: "Available",
        flight_number: null,
        available_time: "Now",
      })
      .eq("id", gate.id);

    if (gateError) {
      alert(
        `Could not release gate: ${gateError.message}`
      );
      return;
    }

    if (currentFlight) {
      const { error: flightError } = await supabase
        .from("flights")
        .update({
          gate: null,
        })
        .eq("flight_number", currentFlight);

      if (flightError) {
        console.error(
          "Flight update error:",
          flightError
        );
      }
    }
  }

  // ==========================================
  // ASSIGN FLIGHT
  // ==========================================

  async function assignFlight(gate) {
    const flightNumber =
      selectedFlights[gate.id];

    if (!flightNumber) {
      alert("Please select a flight.");
      return;
    }

    const alreadyAssigned = gates.find(
      (item) =>
        item.flight_number === flightNumber
    );

    if (alreadyAssigned) {
      alert(
        `${flightNumber} is already assigned to ${alreadyAssigned.gate_number}.`
      );
      return;
    }

    const { error: gateError } = await supabase
      .from("gates")
      .update({
        flight_number: flightNumber,
        status: "Occupied",
      })
      .eq("id", gate.id);

    if (gateError) {
      alert(
        `Could not assign flight: ${gateError.message}`
      );
      return;
    }

    const { error: flightError } = await supabase
      .from("flights")
      .update({
        gate: gate.gate_number,
      })
      .eq("flight_number", flightNumber);

    if (flightError) {
      alert(
        `Could not update flight: ${flightError.message}`
      );
      return;
    }

    setSelectedFlights((current) => ({
      ...current,
      [gate.id]: "",
    }));
  }

  // ==========================================
  // RESOLVE GATE CONFLICT
  // ==========================================

  async function resolveConflict(conflict) {
    const recommendedGate = gates.find(
      (gate) =>
        gate.status === "Available" &&
        !gate.flight_number
    );

    if (!recommendedGate) {
      alert(
        "Conflict cannot be automatically resolved because no available gate exists."
      );
      return;
    }

    if (conflict.flights.length < 2) {
      return;
    }

    // Keep first flight at original gate.
    // Move second flight to recommended gate.
    const flightToMove = conflict.flights[1];

    const confirmed = window.confirm(
      `Move ${flightToMove.flight_number} from ${conflict.gateNumber} to ${recommendedGate.gate_number}?`
    );

    if (!confirmed) {
      return;
    }

    // Assign the recommended gate
    const { error: gateError } = await supabase
      .from("gates")
      .update({
        flight_number:
          flightToMove.flight_number,
        status: "Occupied",
      })
      .eq(
        "id",
        recommendedGate.id
      );

    if (gateError) {
      console.error(
        "Conflict gate update error:",
        gateError
      );

      alert(
        `Could not resolve conflict: ${gateError.message}`
      );

      return;
    }

    // Update the flight itself
    const { error: flightError } = await supabase
      .from("flights")
      .update({
        gate:
          recommendedGate.gate_number,
      })
      .eq(
        "flight_number",
        flightToMove.flight_number
      );

    if (flightError) {
      console.error(
        "Conflict flight update error:",
        flightError
      );

      alert(
        `Gate was assigned, but flight could not be updated: ${flightError.message}`
      );

      return;
    }

    console.log(
      `${flightToMove.flight_number} moved to ${recommendedGate.gate_number}`
    );
  }

  // ==========================================
  // REALTIME
  // ==========================================

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel("gate-management-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "gates",
        },
        () => {
          loadData();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "flights",
        },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ==========================================
  // UNASSIGNED FLIGHTS
  // ==========================================

  const unassignedFlights = flights.filter(
    (flight) => {
      return !gates.some(
        (gate) =>
          gate.flight_number ===
          flight.flight_number
      );
    }
  );

  // ==========================================
  // AUTOMATIC CONFLICT DETECTION
  // ==========================================

  const gateFlightGroups = {};

  flights.forEach((flight) => {
    if (!flight.gate) {
      return;
    }

    if (!gateFlightGroups[flight.gate]) {
      gateFlightGroups[flight.gate] = [];
    }

    gateFlightGroups[flight.gate].push(
      flight
    );
  });

  const detectedConflicts =
    Object.entries(gateFlightGroups)
      .filter(
        ([, assignedFlights]) =>
          assignedFlights.length > 1
      )
      .map(
        ([gateNumber, assignedFlights]) => ({
          gateNumber,
          flights: assignedFlights,
        })
      );

  // ==========================================
  // KPI CALCULATIONS
  // ==========================================

  const occupied = gates.filter(
    (gate) => gate.status === "Occupied"
  ).length;

  const available = gates.filter(
    (gate) => gate.status === "Available"
  ).length;

  const conflictCount =
    detectedConflicts.length;

  // ==========================================
  // UI
  // ==========================================

  return (
    <>
      <div className="header">
        <div>
          <h1>Gate Management</h1>

          <p>
            Real-time gate allocation & conflict monitoring
          </p>
        </div>

        <span className="live">
          ● LIVE
        </span>
      </div>

      {/* KPIs */}

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
          <h2>{conflictCount}</h2>
        </div>
      </div>

      {/* CONFLICTS */}

      {detectedConflicts.map(
        (conflict) => {
          const recommendedGate =
            gates.find(
              (gate) =>
                gate.status ===
                  "Available" &&
                !gate.flight_number
            );

          return (
            <div
              className="conflict-box"
              key={conflict.gateNumber}
            >
              <div>
                <strong>
                  ⚠ Gate Conflict Detected
                </strong>

                <p>
                  Gate{" "}
                  <strong>
                    {conflict.gateNumber}
                  </strong>{" "}
                  currently has multiple
                  flights assigned.
                </p>

                <p>
                  Flights:{" "}
                  <strong>
                    {conflict.flights
                      .map(
                        (flight) =>
                          flight.flight_number
                      )
                      .join(" • ")}
                  </strong>
                </p>

                {recommendedGate ? (
                  <p>
                    Recommended action:
                    Reassign{" "}
                    <strong>
                      {
                        conflict.flights[1]
                          ?.flight_number
                      }
                    </strong>{" "}
                    to{" "}
                    <strong>
                      {
                        recommendedGate.gate_number
                      }
                    </strong>
                    .
                  </p>
                ) : (
                  <p>
                    No available gate exists
                    for automatic
                    reallocation.
                  </p>
                )}
              </div>

              {recommendedGate && (
                <button
                  onClick={() =>
                    resolveConflict(
                      conflict
                    )
                  }
                >
                  Resolve Conflict
                </button>
              )}
            </div>
          );
        }
      )}

      {/* LOADING */}

      {loading && (
        <section className="panel">
          <p>Loading gates...</p>
        </section>
      )}

      {/* ERROR */}

      {errorMessage && (
        <section className="panel">
          <p style={{ color: "red" }}>
            Supabase Error:{" "}
            {errorMessage}
          </p>
        </section>
      )}

      {/* GATE CARDS */}

      {!loading && !errorMessage && (
        <section className="panel">
          <h2>Gate Status</h2>

          <div className="gate-grid">
            {gates.map((gate) => (
              <div
                key={gate.id}
                className={`gate-card ${gate.status.toLowerCase()}`}
              >
                <div className="gate-top">
                  <h2>
                    {gate.gate_number}
                  </h2>

                  <span>
                    {gate.status}
                  </span>
                </div>

                <p>
                  Flight:{" "}
                  <strong>
                    {gate.flight_number ||
                      "None"}
                  </strong>
                </p>

                <p>
                  Available:{" "}
                  {gate.available_time ||
                    "Now"}
                </p>

                {/* AVAILABLE GATE */}

                {gate.status ===
                  "Available" && (
                  <div
                    style={{
                      marginTop: "15px",
                    }}
                  >
                    <select
                      value={
                        selectedFlights[
                          gate.id
                        ] || ""
                      }
                      onChange={(event) =>
                        setSelectedFlights(
                          (current) => ({
                            ...current,
                            [gate.id]:
                              event.target
                                .value,
                          })
                        )
                      }
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "7px",
                        marginBottom: "8px",
                      }}
                    >
                      <option value="">
                        Select Flight
                      </option>

                      {unassignedFlights.map(
                        (flight) => (
                          <option
                            key={flight.id}
                            value={
                              flight.flight_number
                            }
                          >
                            {
                              flight.flight_number
                            }{" "}
                            -{" "}
                            {
                              flight.airline
                            }
                          </option>
                        )
                      )}
                    </select>

                    <button
                      className="primary-button"
                      style={{
                        marginTop: "0",
                        width: "100%",
                      }}
                      onClick={() =>
                        assignFlight(gate)
                      }
                    >
                      Assign Flight
                    </button>
                  </div>
                )}

                {/* OCCUPIED */}

                {gate.status ===
                  "Occupied" && (
                  <button
                    className="primary-button"
                    onClick={() =>
                      makeGateAvailable(
                        gate
                      )
                    }
                  >
                    Release Gate
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export default Gates;