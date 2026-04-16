import { useEffect, useState } from "react";
import API from "../api";

function AdminDashboard() {

  // 🔹 STATE 1: Stores all applications
  const [applications, setApplications] = useState([]);

  // 🔹 STATE 2: Stores all placements (NEW FEATURE)
  const [placements, setPlacements] = useState([]);

  // 🔹 STATE 3: Stores all users (for supervisors dropdown)
  const [supervisors, setSupervisors] = useState([]);


  // 🔹 FETCH APPLICATIONS (Already existed, but improved with token)
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


  // 🔹 NEW: FETCH PLACEMENTS
  const fetchPlacements = async () => {
    try {
      const res = await API.get("internships/placements/");
      setPlacements(res.data);
    } catch (error) {
      console.log(error);
    }
  };


  // 🔹 NEW: FETCH USERS (to pick supervisors)
  const fetchSupervisors = async () => {
    try {
      const res = await API.get("accounts/users/");
      setSupervisors(res.data);
    } catch (error) {
      console.log(error);
    }
  };


  // 🔹 UPDATE APPLICATION STATUS (Approve / Reject)
  const updateStatus = async (id, status) => {
    try {
      await API.patch(
        `internships/applications/${id}/`,
        { status: status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("Updated successfully!");
      fetchApplications(); // refresh applications

    } catch (error) {
      console.log("FULL ERROR:", error);
      console.log("BACKEND RESPONSE:", error.response?.data);

      alert(JSON.stringify(error.response?.data));
    }
  };


  // 🔹 NEW: ASSIGN SUPERVISORS TO A PLACEMENT
  const assignSupervisors = async (placementId, workplaceId, academicId) => {
    try {
      await API.patch(`internships/placements/${placementId}/`, {
        workplace_supervisor: workplaceId,
        academic_supervisor: academicId,
      });

      alert("Supervisors assigned!");
      fetchPlacements(); // refresh placements

    } catch (error) {
      console.log(error.response?.data);
      alert("Failed to assign supervisors");
    }
  };


  // 🔹 RUN EVERYTHING WHEN PAGE LOADS
  useEffect(() => {
    fetchApplications();
    fetchPlacements();     // NEW
    fetchSupervisors();    // NEW
  }, []);


  // 🔹 UI STARTS HERE (THIS WAS YOUR MAIN PROBLEM BEFORE)
  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Dashboard</h1>

      {/* ================= APPLICATIONS SECTION ================= */}
      <h2>Applications</h2>

      {applications.length === 0 ? (
        <p>No applications yet</p>
      ) : (
        applications.map((app) => (
          <div
            key={app.id}
            style={{
              border: "1px solid black",
              margin: "10px",
              padding: "10px",
            }}
          >
            <p><strong>Student:</strong> {app.student}</p>
            <p><strong>Organization:</strong> {app.organization}</p>
            <p><strong>Status:</strong> {app.status}</p>

            {/* Only show buttons if pending */}
            {app.status === "pending" && (
              <>
                <button onClick={() => updateStatus(app.id, "approved")}>
                  Approve
                </button>

                <button onClick={() => updateStatus(app.id, "rejected")}>
                  Reject
                </button>
              </>
            )}
          </div>
        ))
      )}


      {/* ================= PLACEMENTS SECTION (NEW) ================= */}
      <h2>Placements</h2>

      {placements.length === 0 ? (
        <p>No placements yet</p>
      ) : (
        placements.map((p) => (
          <div
            key={p.id}
            style={{
              border: "1px solid blue",
              margin: "10px",
              padding: "10px",
            }}
          >
            <p><strong>Student:</strong> {p.student}</p>
            <p><strong>Organization:</strong> {p.organization}</p>

            {/* 🔹 WORKPLACE SUPERVISOR DROPDOWN */}
            <select id={`workplace-${p.id}`}>
              <option>Select Workplace Supervisor</option>
              {supervisors
                .filter((u) => u.role === "workplace")
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username}
                  </option>
                ))}
            </select>

            <br /><br />

            {/* 🔹 ACADEMIC SUPERVISOR DROPDOWN */}
            <select id={`academic-${p.id}`}>
              <option>Select Academic Supervisor</option>
              {supervisors
                .filter((u) => u.role === "academic")
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username}
                  </option>
                ))}
            </select>

            <br /><br />

            {/* 🔹 BUTTON TO ASSIGN SUPERVISORS */}
            <button
              onClick={() =>
                assignSupervisors(
                  p.id,
                  document.getElementById(`workplace-${p.id}`).value,
                  document.getElementById(`academic-${p.id}`).value
                )
              }
            >
              Assign Supervisors
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default AdminDashboard;
