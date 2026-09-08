import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AeroOpsContext = createContext();

const defaultFlights = [
  {
    flight: "AI302",
    airline: "Air India",
    origin: "Mumbai",
    destination: "Delhi",
    gate: "G08",
    status: "Boarding",
    delay: 14,
    risk: "High",
  },
  {
    flight: "6E415",
    airline: "IndiGo",
    origin: "Bengaluru",
    destination: "Delhi",
    gate: "G12",
    status: "Turnaround",
    delay: 6,
    risk: "Medium",
  },
  {
    flight: "AI506",
    airline: "Air India",
    origin: "Hyderabad",
    destination: "Delhi",
    gate: "G10",
    status: "Arriving",
    delay: 0,
    risk: "Low",
  },
];

const defaultIncidents = [
  {
    id: "INC-001",
    title: "Fueling equipment delay",
    flight: "AI302",
    severity: "High",
    team: "Fuel Team F4",
    status: "Open",
  },
  {
    id: "INC-002",
    title: "Baggage belt congestion",
    flight: "6E415",
    severity: "Medium",
    team: "Baggage Team B7",
    status: "In Progress",
  },
];

function loadData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);

    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

export function AeroOpsProvider({ children }) {
  const [flights, setFlights] = useState(() =>
    loadData("aeroops-flights", defaultFlights)
  );

  const [incidents, setIncidents] = useState(() =>
    loadData("aeroops-incidents", defaultIncidents)
  );

  useEffect(() => {
    localStorage.setItem(
      "aeroops-flights",
      JSON.stringify(flights)
    );
  }, [flights]);

  useEffect(() => {
    localStorage.setItem(
      "aeroops-incidents",
      JSON.stringify(incidents)
    );
  }, [incidents]);

  function addIncident(incident) {
    setIncidents((current) => [
      incident,
      ...current,
    ]);

    if (
      incident.severity === "High" ||
      incident.severity === "Critical"
    ) {
      setFlights((current) =>
        current.map((flight) =>
          flight.flight === incident.flight
            ? {
                ...flight,
                risk: "High",
                status: "Operational Risk",
              }
            : flight
        )
      );
    }
  }

  function resolveIncident(id) {
    const incident = incidents.find(
      (item) => item.id === id
    );

    if (!incident) return;

    setIncidents((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "Resolved",
            }
          : item
      )
    );

    const remainingSeriousIncidents =
      incidents.filter(
        (item) =>
          item.flight === incident.flight &&
          item.id !== id &&
          item.status !== "Resolved" &&
          ["High", "Critical"].includes(
            item.severity
          )
      );

    if (remainingSeriousIncidents.length === 0) {
      setFlights((current) =>
        current.map((flight) =>
          flight.flight === incident.flight
            ? {
                ...flight,
                risk:
                  flight.delay > 10
                    ? "Medium"
                    : flight.delay > 0
                    ? "Medium"
                    : "Low",
                status:
                  flight.delay > 0
                    ? "Turnaround"
                    : "Arriving",
              }
            : flight
        )
      );
    }
  }

  function resetDemoData() {
    setFlights(defaultFlights);
    setIncidents(defaultIncidents);
  }

  return (
    <AeroOpsContext.Provider
      value={{
        flights,
        incidents,
        addIncident,
        resolveIncident,
        resetDemoData,
      }}
    >
      {children}
    </AeroOpsContext.Provider>
  );
}

export function useAeroOps() {
  return useContext(AeroOpsContext);
}
