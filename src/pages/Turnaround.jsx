import { useState } from "react";

const initialTasks = [
  {
    id: 1,
    name: "Cleaning",
    team: "Team C2",
    planned: "14:35",
    status: "Completed",
    delay: 0,
  },
  {
    id: 2,
    name: "Catering",
    team: "Team C5",
    planned: "14:40",
    status: "Completed",
    delay: 3,
  },
  {
    id: 3,
    name: "Fueling",
    team: "Team F4",
    planned: "14:45",
    status: "Delayed",
    delay: 14,
  },
  {
    id: 4,
    name: "Baggage Loading",
    team: "Team B7",
    planned: "15:00",
    status: "In Progress",
    delay: 5,
  },
  {
    id: 5,
    name: "Boarding",
    team: "Gate Team G08",
    planned: "15:10",
    status: "Pending",
    delay: 0,
  },
  {
    id: 6,
    name: "Pushback",
    team: "Ramp Team R3",
    planned: "15:35",
    status: "Pending",
    delay: 0,
  },
];

function Turnaround() {
  const [tasks, setTasks] = useState(initialTasks);

  const completed = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const progress = Math.round(
    (completed / tasks.length) * 100
  );
const totalDelay = tasks.reduce(
  (sum, task) =>
    task.status !== "Completed"
      ? sum + task.delay
      : sum,
  0
);
 

  const incompleteTasks = tasks.filter(
  (task) => task.status !== "Completed"
).length;

const riskScore =
  incompleteTasks === 0
    ? 0
    : Math.min(
        100,
        totalDelay * 3 + incompleteTasks * 8
      );

  let riskLevel = "LOW";

  if (riskScore >= 70) {
    riskLevel = "HIGH";
  } else if (riskScore >= 40) {
    riskLevel = "MEDIUM";
  }

  function completeTask(id) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? {
              ...task,
              status: "Completed",
              delay: 0,
            }
          : task
      )
    );
  }

  return (
    <>
      <div className="header">
        <div>
          <h1>Aircraft Turnaround</h1>
          <p>
            AI302 • Air India • Gate G08
          </p>
        </div>

        <span className="live">
          ● LIVE
        </span>
      </div>

      <div className="kpis">
        <div className="card">
          <p>Scheduled Departure</p>
          <h2>15:35</h2>
        </div>

        <div className="card">
          <p>Turnaround Progress</p>
          <h2>{progress}%</h2>
        </div>

        <div className="card">
          <p>Total Task Delay</p>
          <h2>{totalDelay} min</h2>
        </div>

        <div className="card">
          <p>Departure Risk</p>
          <h2>{riskLevel}</h2>
        </div>
      </div>

      <section className="panel">
        <div className="turnaround-heading">
          <div>
            <h2>Turnaround Progress</h2>
            <p>
              {completed} of {tasks.length} tasks completed
            </p>
          </div>

          <strong>{progress}%</strong>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </section>

      <section
        className={`risk-box ${riskLevel.toLowerCase()}`}
      >
        <div>
          <strong>
            Departure Risk Score: {riskScore}/100
          </strong>

          <p>
            Current operational risk: {riskLevel}
          </p>

          {riskLevel === "HIGH" && (
            <p>
              Recommended action: Prioritize fueling and
              baggage operations to protect scheduled departure.
            </p>
          )}
        </div>
      </section>

      <section className="panel">
        <h2>Ground Operations</h2>

        <div className="task-list">
          {tasks.map((task) => (
            <div
              className={`task-card ${task.status
                .toLowerCase()
                .replace(" ", "-")}`}
              key={task.id}
            >
              <div className="task-info">
                <h3>{task.name}</h3>

                <p>
                  {task.team} • Planned {task.planned}
                </p>
              </div>

              <div className="task-actions">
                <span>
                  {task.status}
                </span>

                {task.delay > 0 && (
                  <small>
                    +{task.delay} min
                  </small>
                )}

                {task.status !== "Completed" && (
                  <button
                    onClick={() =>
                      completeTask(task.id)
                    }
                  >
                    Complete
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

export default Turnaround;
