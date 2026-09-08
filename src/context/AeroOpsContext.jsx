import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabaseClient";

const AeroOpsContext = createContext();

export function AeroOpsProvider({ children }) {
  const [flights, setFlights] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);

    const [
      { data: flightData, error: flightError },
      { data: incidentData, error: incidentError },
    ] = await Promise.all([
      supabase
        .from("flights")
        .select("*")
        .order("id", { ascending: true }),

      supabase
        .from("incidents")
        .select("*")
        .order("id", { ascending: false }),
    ]);

    if (flightError) {
      console.error("Flights error:", flightError);
    }

    if (incidentError) {
      console.error("Incidents error:", incidentError);
    }

    setFlights(flightData || []);
    setIncidents(incidentData || []);
    setLoading(false);
  }

  useEffect(() => {
  loadData();

  const channel = supabase
    .channel("aeroops-realtime")
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
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "incidents",
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

  async function addIncident(incident) {
      console.log("Trying to create incident:", incident);

  const { data, error } = await supabase
    .from("incidents")
    .insert([incident])
    .select();

  if (error) {
    console.error("Add incident error:", error);

    alert(
      `Incident could not be created:\n${error.message}`
    );

    return false;
  }

  console.log("Incident created successfully:", data);

  if (
    incident.severity === "High" ||
    incident.severity === "Critical"
  ) {
    const { error: flightUpdateError } = await supabase
      .from("flights")
      .update({
        risk: "High",
        status: "Operational Risk",
      })
      .eq(
        "flight_number",
        incident.flight_number
      );

    if (flightUpdateError) {
      console.error(
        "Flight update error:",
        flightUpdateError
      );
    }
  }

  await loadData();

  return true;
  }

  async function resolveIncident(id) {
    const { data: incident, error } = await supabase
      .from("incidents")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !incident) {
      console.error("Incident lookup error:", error);
      return;
    }

    await supabase
      .from("incidents")
      .update({
        status: "Resolved",
      })
      .eq("id", id);

    const {
      data: seriousIncidents,
      error: seriousError,
    } = await supabase
      .from("incidents")
      .select("*")
      .eq("flight_number", incident.flight_number)
      .neq("status", "Resolved")
      .in("severity", ["High", "Critical"]);

    if (seriousError) {
      console.error(seriousError);
    }

    if (!seriousIncidents || seriousIncidents.length === 0) {
      const { data: flight } = await supabase
        .from("flights")
        .select("*")
        .eq("flight_number", incident.flight_number)
        .single();

      if (flight) {
        await supabase
          .from("flights")
          .update({
            risk:
              flight.delay_minutes > 0
                ? "Medium"
                : "Low",

            status:
              flight.delay_minutes > 0
                ? "Turnaround"
                : "Arriving",
          })
          .eq("flight_number", incident.flight_number);
      }
    }

    await loadData();
  }

  return (
    <AeroOpsContext.Provider
      value={{
        flights,
        incidents,
        loading,
        addIncident,
        resolveIncident,
        reloadData: loadData,
      }}
    >
      {children}
    </AeroOpsContext.Provider>
  );
}

export function useAeroOps() {
  return useContext(AeroOpsContext);
}