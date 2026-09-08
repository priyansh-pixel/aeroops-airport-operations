import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

function Turnaround() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const flightNumber = "AI302";

  // ==========================================
  // LOAD TASKS
  // ==========================================

  async function loadTasks() {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("turnaround_tasks")
      .select("*")
      .eq("flight_number", flightNumber)
      .order("id", { ascending: true });

    if (error) {
      console.error("Turnaround load error:", error);
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    const taskData = data || [];

    setTasks(taskData);

    await syncFlightFromTurnaround(taskData);

    setLoading(false);
  }

  // ==========================================
  // SYNC TURNAROUND → FLIGHT
  // ==========================================

  async function syncFlightFromTurnaround(taskData) {
    const totalDelay = taskData.reduce(
      (sum, task) =>
        sum + Number(task.delay_minutes || 0),
      0
    );

    const delayedTasks = taskData.filter(
      (task) => task.status === "Delayed"
    ).length;

    let risk = "Low";
    let status = "Turnaround";

    if (
      totalDelay >= 15 ||
      delayedTasks >= 2
    ) {
      risk = "High";
      status = "Operational Risk";
    } else if (
      totalDelay > 0 ||
      delayedTasks === 1
    ) {
      risk = "Medium";
      status = "Turnaround";
    }

    const allCompleted =
      taskData.length > 0 &&
      taskData.every(
        (task) => task.status === "Completed"
      );

    if (allCompleted) {
      status = "Ready for Departure";

      if (totalDelay === 0) {
        risk = "Low";
      }
    }

    const { error } = await supabase
      .from("flights")
      .update({
        delay_minutes: totalDelay,
        risk,
        status,
      })
      .eq("flight_number", flightNumber);

    if (error) {
      console.error(
        "Flight sync error:",
        error
      );
    }
  }

  // ==========================================
  // UPDATE STATUS
  // ==========================================

  async function updateTaskStatus(task, newStatus) {
    const updateData = {
      status: newStatus,
    };

    if (newStatus === "Completed") {
      updateData.delay_minutes = 0;
    }

    const { error } = await supabase
      .from("turnaround_tasks")
      .update(updateData)
      .eq("id", task.id);

    if (error) {
      console.error("Task update error:", error);

      alert(
        `Could not update task: ${error.message}`
      );

      return;
    }

    await loadTasks();
  }

  // ==========================================
  // MARK DELAYED
  // ==========================================

  async function markTaskDelayed(task) {
    const enteredDelay = window.prompt(
      `Enter delay in minutes for ${task.task_name}:`,
      task.delay_minutes || 5
    );

    if (enteredDelay === null) {
      return;
    }

    const delayMinutes = Number(
      enteredDelay
    );

    if (
      !Number.isFinite(delayMinutes) ||
      delayMinutes <= 0
    ) {
      alert(
        "Please enter a valid delay greater than 0 minutes."
      );

      return;
    }

    const { error } = await supabase
      .from("turnaround_tasks")
      .update({
        status: "Delayed",
        delay_minutes: delayMinutes,
      })
      .eq("id", task.id);

    if (error) {
      console.error(
        "Delay update error:",
        error
      );

      alert(
        `Could not record delay: ${error.message}`
      );

      return;
    }

    await loadTasks();
  }

  // ==========================================
  // RESUME
  // ==========================================

  async function resumeTask(task) {
    const { error } = await supabase
      .from("turnaround_tasks")
      .update({
        status: "In Progress",
      })
      .eq("id", task.id);

    if (error) {
      alert(
        `Could not resume task: ${error.message}`
      );

      return;
    }

    await loadTasks();
  }

  // ==========================================
  // REALTIME
  // ==========================================

  useEffect(() => {
    loadTasks();

    const turnaroundChannel = supabase
      .channel("turnaround-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "turnaround_tasks",
        },
        () => {
          loadTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(
        turnaroundChannel
      );
    };
  }, []);

  // ==========================================
  // KPI CALCULATIONS
  // ==========================================

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const delayedTasks = tasks.filter(
    (task) => task.status === "Delayed"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const progress =
    totalTasks === 0
      ? 0
      : Math.round(
          (completedTasks / totalTasks) * 100
        );

  const totalDelay = tasks.reduce(
    (sum, task) =>
      sum + Number(task.delay_minutes || 0),
    0
  );

  let departureRisk = "LOW";

  if (
    totalDelay >= 15 ||
    delayedTasks >= 2
  ) {
    departureRisk = "HIGH";
  } else if (
    totalDelay > 0 ||
    delayedTasks === 1
  ) {
    departureRisk = "MEDIUM";
  }

  const riskScore = Math.min(
    100,
    totalDelay * 4 +
      delayedTasks * 10
  );

  // ==========================================
  // UI
  // ==========================================

  return (
    <>
      <div className="header">
        <div>
          <h1>Aircraft Turnaround</h1>

          <p>
            Monitor ground operations and departure readiness
          </p>
        </div>

        <span className="live">
          ● LIVE
        </span>
      </div>

      <section className="panel">
        <div className="turnaround-heading">
          <div>
            <h2>{flightNumber}</h2>

            <p>
              Air India • Ground Operations
            </p>
          </div>

          <strong>
            {completedTasks} of {totalTasks} tasks completed
          </strong>
        </div>

        <div className="kpis">
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
            <h2>{departureRisk}</h2>
          </div>

          <div className="card">
            <p>In Progress</p>
            <h2>{inProgressTasks}</h2>
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
              width: `${progress}%`,
            }}
          />
        </div>
      </section>

      <section
        className={`risk-box ${departureRisk.toLowerCase()}`}
      >
        <h2>
          Departure Risk Score: {riskScore}/100
        </h2>

        {departureRisk === "HIGH" && (
          <p>
            Immediate intervention recommended.
            Delayed ground operations may affect
            scheduled departure.
          </p>
        )}

        {departureRisk === "MEDIUM" && (
          <p>
            Turnaround requires monitoring.
            Address delayed operations before
            they affect departure.
          </p>
        )}

        {departureRisk === "LOW" && (
          <p>
            Ground operations are currently
            within acceptable limits.
          </p>
        )}
      </section>

      {loading && (
        <section className="panel">
          <p>
            Loading turnaround tasks...
          </p>
        </section>
      )}

      {errorMessage && (
        <section className="panel">
          <p style={{ color: "red" }}>
            Supabase Error:{" "}
            {errorMessage}
          </p>
        </section>
      )}

      {!loading && !errorMessage && (
        <section className="panel">
          <h2>Ground Operations</h2>

          <div className="task-list">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`task-card ${task.status
                  .toLowerCase()
                  .replaceAll(" ", "-")}`}
              >
                <div className="task-info">
                  <h3>
                    {task.task_name}
                  </h3>

                  <p>
                    Team: {task.team}
                  </p>

                  <p>
                    Scheduled:{" "}
                    {task.scheduled_time}
                  </p>

                  {Number(
                    task.delay_minutes
                  ) > 0 && (
                    <p>
                      Delay:{" "}
                      <strong>
                        +
                        {
                          task.delay_minutes
                        }{" "}
                        min
                      </strong>
                    </p>
                  )}
                </div>

                <div className="task-actions">
                  <strong>
                    {task.status}
                  </strong>

                  {task.status ===
                    "Pending" && (
                    <>
                      <button
                        onClick={() =>
                          updateTaskStatus(
                            task,
                            "In Progress"
                          )
                        }
                      >
                        Start Task
                      </button>

                      <button
                        onClick={() =>
                          markTaskDelayed(
                            task
                          )
                        }
                      >
                        Mark Delayed
                      </button>
                    </>
                  )}

                  {task.status ===
                    "In Progress" && (
                    <>
                      <button
                        onClick={() =>
                          updateTaskStatus(
                            task,
                            "Completed"
                          )
                        }
                      >
                        Complete
                      </button>

                      <button
                        onClick={() =>
                          markTaskDelayed(
                            task
                          )
                        }
                      >
                        Mark Delayed
                      </button>
                    </>
                  )}

                  {task.status ===
                    "Delayed" && (
                    <>
                      <button
                        onClick={() =>
                          resumeTask(
                            task
                          )
                        }
                      >
                        Resume
                      </button>

                      <button
                        onClick={() =>
                          updateTaskStatus(
                            task,
                            "Completed"
                          )
                        }
                      >
                        Complete
                      </button>

                      <button
                        onClick={() =>
                          markTaskDelayed(
                            task
                          )
                        }
                      >
                        Edit Delay
                      </button>
                    </>
                  )}

                  {task.status ===
                    "Completed" && (
                    <span>
                      ✓ Completed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export default Turnaround;