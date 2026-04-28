import { useEffect, useState } from "react";
import API from "../api";

function AcademicDashboard() {
  const [placements, setPlacements] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [scores, setScores] = useState({});
  const [evaluations, setEvaluations] = useState([]);

  // added during modification
  const [logs, setLogs] = useState([]);
  const [manualMarks, setManualMarks] = useState({});
  const [activeLogs, setActiveLogs] = useState(null);

  // 🔹 Fetch placements assigned to academic supervisor
  const fetchPlacements = async () => {
    try {
      const res = await API.get("internships/placements/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const filtered = res.data.filter(
        (p) =>
          p.academic_supervisor ===
          parseInt(localStorage.getItem("user_id"))
      );

      setPlacements(filtered);
    } catch (error) {
      console.log(error);
    }
  };

  // 🔹 Fetch criteria
  const fetchCriteria = async () => {
    try {
      const res = await API.get("supervision/evaluationcriteria/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setCriteria(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // 🔹 Fetch existing evaluations (to show workplace scores)
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

  //Added during modification
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


  // 🔹 Submit FINAL evaluation

const submitEvaluation = async (placementId) => {
  try {
    await API.post(
      "supervision/evaluations/",
      {
        placement: placementId,
        supervisor_type: "academic",
        score: manualMarks[placementId] || 0,
        comments: "Final academic evaluation",
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    alert("Final Evaluation submitted!");
  } catch (error) {
    console.log(error.response?.data);
    alert(JSON.stringify(error.response?.data));
  }
};

  useEffect(() => {
    fetchPlacements();
    fetchCriteria();
    fetchEvaluations();
    fetchLogs();

  }, []);
  /// added during
  const submittedFinals = evaluations
  .filter(ev => ev.supervisor_type === "academic")
  .reduce((acc, ev) => {
    acc[ev.placement] = true;
    return acc;
  }, {});



  return (
    <div style={{ padding: "20px" }}>
      <h1>Academic Supervisor Dashboard</h1>

      {placements.length === 0 ? (
        <p>No students assigned</p>
      ) : (
        placements.map((p) => {
          const workplaceEval = evaluations.find(
            (ev) =>
              ev.placement === p.id &&
              ev.supervisor_type === "workplace"
          );

          return (
            <div
              key={p.id}
              style={{
                border: "1px solid green",
                margin: "10px",
                padding: "10px",
              }}
            >
              <h3><strong>Student: </strong>{p.student_name || p.student}</h3>
              <p><strong>Organization: </strong>{p.organization_name || p.organization}</p>

              {/* 🔹 SHOW WORKPLACE EVALUATION */}
              <h4>Workplace Evaluation</h4>
              {workplaceEval ? (
                <div>
                  <p><strong>Total Score: </strong>{workplaceEval.score}</p>
                  <p><strong>Comments: </strong>{workplaceEval.comments}</p>
                </div>
              ) : (
                <p>No workplace evaluation yet</p>
              )}





{/* 🔹 VIEW LOGS BUTTON */}
<button onClick={() => setActiveLogs(activeLogs === p.id ? null : p.id)}>
  {activeLogs === p.id ? "Hide Weekly Logs" : "View Weekly Logs"}
</button>
{activeLogs === p.id && (
  <div style={{ marginTop: "10px" }}>
    <h4>Weekly Logs</h4>

    {logs.filter(log => log.placement === p.id && log.status !== "draft").length > 0 ? (
      logs
        .filter(log => log.placement === p.id && log.status !== "draft")
        .sort((a, b) => a.week_number - b.week_number)
        .map(log => (
          <div
            key={log.id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "6px",
              backgroundColor: "#f9f9f9"
            }}
          >
            <p><strong>Week:</strong> {log.week_number}</p>
            <p><strong>Tasks:</strong> {log.tasks}</p>
            <p><strong>Challenges:</strong> {log.challenges || "None"}</p>
            <p><strong>Attendance:</strong> {log.attendance_days} days</p>
            <p><strong>Status:</strong> {log.status}</p>
          </div>
        ))
    ) : (
      <p>No logs yet</p>
    )}
  </div>
)}


              {/* 🔹 ACADEMIC INPUT */}
            <h4>Academic Marks (Max: 20)</h4>

<input
  type="number"
  min="0"
  max="20"
  value={manualMarks[p.id] || ""}
  onChange={(e) =>
    setManualMarks(prev => ({
      ...prev,
      [p.id]: Math.min(20, Math.max(0, parseInt(e.target.value) || 0))
    }))
  }
/>

              <br />

{!submittedFinals[p.id] ? (
  <button onClick={() => submitEvaluation(p.id)}>
    Submit Final Evaluation
  </button>
) : (
  <p style={{ color: "green", fontWeight: "bold" }}>
    ✅ Final Evaluation Submitted
  </p>
)}
            </div>
          );
        })
      )}
    </div>
  );
}

export default AcademicDashboard;