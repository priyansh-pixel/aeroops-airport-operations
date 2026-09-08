import { useAeroOps } from "../context/AeroOpsContext";

function Flights() {
  const { flights } = useAeroOps();

  return (
    <>
      <div className="header">
        <div>
          <h1>Flight Operations</h1>
          <p>Monitor arrivals, departures and operational risk</p>
        </div>

        <span className="live">● LIVE</span>
      </div>

      <section className="panel">
        <h2>All Flights</h2>

        <table>
          <thead>
            <tr>
              <th>Flight</th>
              <th>Airline</th>
              <th>Origin</th>
              <th>Destination</th>
              <th>Gate</th>
              <th>Status</th>
              <th>Delay</th>
              <th>Risk</th>
            </tr>
          </thead>

          <tbody>
            {flights.map((flight) => (
              <tr key={flight.flight}>
                <td>{flight.flight}</td>
                <td>{flight.airline}</td>
                <td>{flight.origin}</td>
                <td>{flight.destination}</td>
                <td>{flight.gate}</td>
                <td>{flight.status}</td>
                <td>{flight.delay} min</td>
                <td>
                  <span
                    className={`risk ${flight.risk.toLowerCase()}`}
                  >
                    {flight.risk}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

export default Flights;
