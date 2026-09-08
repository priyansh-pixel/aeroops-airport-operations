import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

function DatabaseTest() {
  const [flights, setFlights] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadFlights();
  }, []);

  async function loadFlights() {
    const { data, error } = await supabase
      .from("flights")
      .select("*");

    if (error) {
      setError(error.message);
      return;
    }

    setFlights(data);
  }

  return (
    <div>
      <h1>Supabase Connection Test</h1>

      {error && <p>{error}</p>}

      {flights.map((flight) => (
        <div className="card" key={flight.id}>
          <h2>{flight.flight_number}</h2>
          <p>{flight.airline}</p>
          <p>
            {flight.origin} → {flight.destination}
          </p>
        </div>
      ))}
    </div>
  );
}

export default DatabaseTest;
