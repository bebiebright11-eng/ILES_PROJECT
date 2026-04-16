
import { useEffect, useState } from "react";
import API from "../api";

function StudentDashboard() {
  const [applications, setApplications] = useState([]);
  const [logs, setLogs] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  // The below has been added
  const [organizations, setOrganizations] = useState([]);

  useEffect(() => {
    fetchApplications();
    fetchLogs();
    fetchEvaluations();
    fetchOrganizations(); // 🔥 ADD THIS LINE
  }, []);

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

  // This line has also been added to fetch organizations
  const fetchOrganizations = async () => {
  try {
    const res = await API.get("internships/organizations/");
      setOrganizations(res.data);
    } catch (error) {
      console.log(error);
    }
  };
// added for applying
const applyToOrganization = async (orgId) => {
  try {
    await API.post(
      "internships/applications/",
      {
        organization: orgId,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    alert("Application submitted!");
    fetchApplications(); // refresh applications
  } catch (error) {
  console.log("FULL ERROR:", error);
  console.log("BACKEND RESPONSE:", error.response?.data);

  alert(JSON.stringify(error.response?.data));
}
};

  return (
    <div style={{ padding: "20px" }}>
      <h1>Student Dashboard</h1>

      {/* APPLICATIONS */}
      <h2>My Applications</h2>
      {applications.length === 0 ? (
        <p>No applications yet</p>
      ) : (
        applications.map((app) => (
          <div key={app.id} style={{ border: "1px solid blue", margin: "10px", padding: "10px" }}>
            <p><strong>Organization:</strong> {app.organization}</p>
            <p><strong>Status:</strong> {app.status}</p>
          </div>
        ))
      )}

      {/* WEEKLY LOGS */}
      <h2>My Weekly Logs</h2>
      {logs.length === 0 ? (
        <p>No logs yet</p>
      ) : (
        logs.map((log) => (
          <div key={log.id} style={{ border: "1px solid black", margin: "10px", padding: "10px" }}>
            <p>Week: {log.week_number}</p>
            <p>Tasks: {log.tasks}</p>
            <p>Status: {localStorage.status}</p>
          </div>
        ))
      )}

      {/* EVALUATIONS */}
      <h2>My Evaluations</h2>
      {evaluations.length === 0 ? (
        <p>No evaluations yet</p>
      ) : (
        evaluations.map((ev) => (
          <div key={ev.id} style={{ border: "1px solid green", margin: "10px", padding: "10px" }}>
            <p>Score: {ev.score}</p>
            <p>Comments: {ev.comments}</p>
            <p>Final Grade: {ev.final_grade || "Not finalised"}</p>
          </div>
        ))
      )}

      {/* ORGANIZATIONS */}
      <h2>Available Organizations</h2>
      {organizations.length === 0 ? (
        <p>No organizations available</p>
        ) : (
        organizations.map((org) => (
          <div key={org.id} style={{ border: "1px solid purple", margin: "10px", padding: "10px" }}
          >
            <p><strong>Name:</strong> {org.name}</p>
            <p><strong>Location:</strong> {org.location}</p>
            <button onClick={() => applyToOrganization(org.id)}>
              Apply
            </button>
          </div>
        ))
      )}
    </div>
  );
}
export default StudentDashboard;

