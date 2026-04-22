// 🔥 IMPORTS (React hooks + API file)
import { useEffect, useState } from "react";
import API from "../api";

function StudentDashboard() {

  // 🔥 STATE 1: STORE STUDENT APPLICATIONS
  const [applications, setApplications] = useState([]);

  // 🔥 STATE 2: STORE WEEKLY LOGS
  const [logs, setLogs] = useState([]);

  // 🔥 STATE 3: STORE EVALUATIONS (FEEDBACK + FINAL RESULTS)
  const [evaluations, setEvaluations] = useState([]);

  // 🔥 STATE 4: STORE ALL ORGANIZATIONS (FOR APPLYING)
  const [organizations, setOrganizations] = useState([]);

  // 🔥 STATE 5: STORE STUDENT'S CURRENT PLACEMENT
  // 👉 VERY IMPORTANT: used to control UI (hide apps, allow logs, etc)
  const [placement, setPlacement] = useState(null);

  // 🔥 STATE 6: STORE FORM DATA FOR WEEKLY LOG SUBMISSION
  const [formData, setFormData] = useState({
    week_number: "",
    tasks: "",
    challenges: "",
    attendance_days: 5,
  });

  // 🔥 RUN ALL FETCH FUNCTIONS WHEN COMPONENT LOADS
  useEffect(() => {
    fetchApplications();
    fetchLogs();
    fetchEvaluations();
    fetchOrganizations();
    fetchPlacement(); // 🔥 VERY IMPORTANT (controls most UI logic)
  }, []);

  // 🔥 FETCH STUDENT APPLICATIONS
  const fetchApplications = async () => {
    try {
      const res = await API.get("internships/applications/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setApplications(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // 🔥 FETCH WEEKLY LOGS
  const fetchLogs = async () => {
    try {
      const res = await API.get("supervision/weeklylogs/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setLogs(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // 🔥 FETCH EVALUATIONS (FEEDBACK + FINAL RESULTS)
  const fetchEvaluations = async () => {
    try {
      const res = await API.get("supervision/evaluations/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setEvaluations(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // 🔥 FETCH ORGANIZATIONS (FOR APPLICATION)
  const fetchOrganizations = async () => {
    try {
      const res = await API.get("internships/organizations/");
      setOrganizations(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // 🔥 APPLY TO ORGANIZATION
  const applyToOrganization = async (orgId) => {
    try {
      await API.post(
        "internships/applications/",
        { organization: orgId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("Application submitted!");
      fetchApplications(); // 🔥 REFRESH APPLICATION LIST

    } catch (error) {
      console.log(error.response?.data);
      alert("Failed to apply");
    }
  };

  // 🔥 FETCH STUDENT PLACEMENT (VERY IMPORTANT LOGIC)
  const fetchPlacement = async () => {
    try {
      const res = await API.get("internships/placements/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // 🔥 FIND ONLY CURRENT STUDENT'S PLACEMENT
      const myPlacement = res.data.find(
        (p) => p.student === parseInt(localStorage.getItem("user_id"))
      );

      setPlacement(myPlacement || null);

    } catch (error) {
      console.log(error);
    }
  };

  // 🔥 HANDLE FORM INPUT CHANGES
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 🔥 SUBMIT WEEKLY LOG (AUTO USES PLACEMENT ID)
  const submitLog = async (e) => {
    e.preventDefault();

    try {
      await API.post(
        "supervision/weeklylogs/",
        {
          ...formData,

          // 🔥 VERY IMPORTANT:
          // Automatically attach placement ID instead of user typing it
          placement: placement?.id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("Weekly log submitted!");

      // 🔥 RESET FORM AFTER SUBMISSION
      setFormData({
        week_number: "",
        tasks: "",
        challenges: "",
        attendance_days: 5,
      });

      fetchLogs(); // 🔥 REFRESH LOGS

    } catch (error) {
      console.log(error.response?.data);
      alert("Failed to submit log");
    }
  };

  // 🔥 UI STARTS HERE
  return (
    <div className="container">

      {/* 🔥 PAGE TITLE */}
      <h1 className="title">Student Dashboard</h1>

      {/* 🔥 NOTIFICATION WHEN STUDENT IS PLACED */}
      {placement && (
        <div style={{
          backgroundColor: "#d4edda",
          padding: "10px",
          marginBottom: "15px",
          border: "1px solid green"
        }}>
          ✅ You have been placed at <strong>{placement.organization_name}</strong>
        </div>
      )}

      {/* 🔥 PLACEMENT SECTION */}
      <div className="card">
        <h2>My Placement</h2>

        {placement ? (
          <>
            {/* 🔥 SHOW ORGANIZATION NAME */}
            <p><strong>Organization:</strong> {placement.organization_name}</p>

            {/* 🔥 SHOW SUPERVISORS */}
            <p><strong>Workplace Supervisor:</strong> {placement.workplace_supervisor_name || "Not assigned"}</p>
            <p><strong>Academic Supervisor:</strong> {placement.academic_supervisor_name || "Not assigned"}</p>

            {/* 🔥 SHOW DATES */}
            <p><strong>Start Date:</strong> {placement.start_date || "Not set"}</p>
            <p><strong>End Date:</strong> {placement.end_date || "Not set"}</p>
          </>
        ) : (
          <p>You have not been placed yet.</p>
        )}
      </div>

      {/* 🔥 APPLICATIONS SECTION (HIDDEN AFTER PLACEMENT) */}
      {!placement && (
        <div className="card">
          <h2>My Applications</h2>

          {applications.length === 0 ? (
            <p>No applications yet</p>
          ) : (
            applications.map((app) => (
              <div key={app.id}>
                <p><strong>Organization:</strong> {app.organization_name || app.organization}</p>
                <p><strong>Status:</strong> {app.status}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* 🔥 WEEKLY LOG FORM (ONLY IF PLACED) */}
      {placement && (
        <div className="card">
          <h2>Add Weekly Log</h2>

          <form onSubmit={submitLog}>

            <input
              name="week_number"
              placeholder="Week Number"
              value={formData.week_number}
              onChange={handleChange}
              required
            />

            <textarea
              name="tasks"
              placeholder="Tasks done"
              value={formData.tasks}
              onChange={handleChange}
              required
            />

            <textarea
              name="challenges"
              placeholder="Challenges faced"
              value={formData.challenges}
              onChange={handleChange}
            />

            <input
              name="attendance_days"
              value={formData.attendance_days}
              onChange={handleChange}
            />

            <button type="submit">Submit Log</button>
          </form>
        </div>
      )}

      {/* 🔥 WEEKLY LOGS DISPLAY */}
      <div className="card">
        <h2>My Weekly Logs</h2>

        {logs.length === 0 ? (
          <p>No logs yet</p>
        ) : (
          logs.map((log) => (
            <div key={log.id}>
              <p><strong>Week:</strong> {log.week_number}</p>
              <p><strong>Organization:</strong> {log.organization_name}</p>
              <p><strong>Tasks:</strong> {log.tasks}</p>
              <p><strong>Status:</strong> {log.status}</p>
            </div>
          ))
        )}
      </div>

      {/* 🔥 EVALUATIONS */}
      <div className="card">
        <h2>My Evaluations</h2>

        {evaluations.length === 0 ? (
          <p>No evaluations yet</p>
        ) : (
          evaluations.map((ev) => (
            <div key={ev.id}>
              <p><strong>Organization:</strong> {ev.organization_name}</p>
              <p><strong>Supervisor:</strong> {ev.supervisor_name}</p>
              <p><strong>Score:</strong> {ev.score}</p>
              <p><strong>Feedback:</strong> {ev.comments || "No feedback yet"}</p>
              <p><strong>Final Grade:</strong> {ev.final_grade || "Not finalised"}</p>
            </div>
          ))
        )}
      </div>

      {/* 🔥 FINAL RESULT */}
      <div className="card">
        <h2>Final Result</h2>

        {evaluations.some(ev => ev.is_final) ? (
          evaluations
            .filter(ev => ev.is_final)
            .map(ev => (
              <div key={ev.id}>
                <p><strong>Final Grade:</strong> {ev.final_grade}</p>
              </div>
            ))
        ) : (
          <p>Final evaluation not yet available</p>
        )}
      </div>

      {/* 🔥 ORGANIZATIONS */}
      <div className="card">
        <h2>Available Organizations</h2>

        {organizations.length === 0 ? (
          <p>No organizations available</p>
        ) : (
          organizations.map((org) => (
            <div key={org.id}>
              <p><strong>Name:</strong> {org.name}</p>
              <p><strong>Location:</strong> {org.location}</p>

              {/* 🔥 DISABLE APPLY IF ALREADY PLACED */}
              {placement ? (
                <button disabled>Already Placed</button>
              ) : (
                <button onClick={() => applyToOrganization(org.id)}>
                  Apply
                </button>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}

export default StudentDashboard;

