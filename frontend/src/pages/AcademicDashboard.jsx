import { useEffect, useState, useRef } from "react";
import API from "../api";

function AcademicDashboard() {
  const [placements, setPlacements] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [scores, setScores] = useState({});

  const [logs, setLogs] = useState({});

  const [editing, setEditing] = useState({});
  const [activeStudent, setActiveStudent] = useState(null);
  const [viewMode, setViewMode] = useState({});

  const [menuOpen, setMenuOpen] = useState(false);
  const [page, setPage] = useState("home");
  const menuRef = useRef(null);


  // --- Data Fetching Functions ---

  const fetchPlacements = async () => {
    try {
      const res = await API.get("internships/placements/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const filtered = res.data.filter(
        (p) => p.academic_supervisor === parseInt(localStorage.getItem("user_id"))
      );

      setPlacements(filtered);
    } catch (error) {
      console.log(error);
    }
  };

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

  const fetchLogs = async () => {
  try {
    const res = await API.get("supervision/weeklylogs/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    // group logs by placement
    const grouped = {};

    res.data.forEach((log) => {
      if (!grouped[log.placement]) {
        grouped[log.placement] = [];
      }
      grouped[log.placement].push(log);
    });

    setLogs(grouped);
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

  // --- Event Handlers ---

  const handleScoreChange = (placementId, criteriaId, value) => {
    setScores((prev) => ({
      ...prev,
      [placementId]: {
        ...prev[placementId],
        [criteriaId]: parseInt(value),
      },
    }));
  };

  const submitEvaluation = async (placementId) => {
  try {
    const existing = evaluations.find(
      (ev) =>
        ev.placement === placementId &&
        ev.supervisor_type === "academic"
    );

    const payload = {
      placement: placementId,
      supervisor_type: "academic",
      score: scores[placementId] || 0,
      comments: "Final academic evaluation",
      criteria_scores: []
    };

    if (existing) {
      await API.put(`supervision/evaluations/${existing.id}/`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
    } else {
      await API.post("supervision/evaluations/", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
    }

    // ✅ IMPORTANT FIX
    await fetchEvaluations();

    alert("Saved successfully!");

  } catch (error) {
    console.log(error.response?.data);
    alert(JSON.stringify(error.response?.data));
  }
};

  // --- Lifecycle ---

  useEffect(() => {
    fetchPlacements();
    fetchCriteria();
    fetchEvaluations();
    fetchLogs(); 
    const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setMenuOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
    
  }, []);

  // --- Main Render ---
  // ✅ TABLE STYLES (PUT THEM HERE — OUTSIDE return)

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "20px",
  background: "white",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  borderRadius: "8px",
  overflow: "hidden"
};

const thStyle = {
  background: "#2c3e50",
  color: "white",
  padding: "12px",
  textAlign: "left",
};

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #ddd",
};

const buttonStyle = {
  padding: "6px 12px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  background: "#3498db",
  color: "white"
};

  return (
    <div style={{ padding: "20px" }}>
      <h1>Academic Dashboard</h1>

<div ref={menuRef} style={{ position: "relative", display: "inline-block" }}>
  <button style={buttonStyle}
    onClick={() => setMenuOpen((prev) => !prev)}
    style={{
      padding: "8px 12px",
      cursor: "pointer",
      border: "1px solid black",
      background: "#eee"
    }}
  >
    Menu ☰
  </button>

  {menuOpen && (
    <div
      style={{
        position: "absolute",
        top: "40px",
        left: "0",
        background: "white",
        border: "1px solid black",
        borderRadius: "5px",
        padding: "10px",
        width: "180px",
        boxShadow: "0px 2px 8px rgba(0,0,0,0.2)",
        zIndex: 1000
      }}
    >
      <p onClick={() => setPage("home")} style={{ cursor: "pointer" }}>Home</p>
      <p onClick={() => setPage("students")} style={{ cursor: "pointer" }}>My Students</p>
      <p onClick={() => setPage("evaluations")} style={{ cursor: "pointer" }}>My Evaluations</p>
      <p onClick={() => setPage("reports")} style={{ cursor: "pointer" }}>Reports</p>
    </div>
  )}
</div>


{page === "home" && (
  <>
     <h2>Assigned Students</h2>
      {placements.length === 0 ? (
        <p>No students assigned</p>
      ) : (
        
        placements.map((p) => {
          const workplaceEval = evaluations.find(
            (ev) => ev.placement === p.id && ev.supervisor_type === "workplace"
          );
const academicEval = evaluations.find(
  (ev) => ev.placement === p.id && ev.supervisor_type === "academic"
);
  
  // ✅ ADD THIS BLOCK EXACTLY HERE
  const studentLogs = (logs[p.id] || []).sort(
  (a, b) => a.week_number - b.week_number
);
  const logCount = studentLogs.length;

  const countedLogs = Math.min(logCount, 8);
  const logScore = countedLogs * 2.5;
  const academicScore =
  scores[p.id] !== undefined
    ? scores[p.id] // if user is editing
    : academicEval?.score ?? 0; // otherwise use saved score
  const workplaceScore = workplaceEval?.score || 0;

  const finalScore = workplaceScore + logScore + academicScore;

          return (
            <div key={p.id} style={{ border: "1px solid green", margin: "10px", padding: "10px" }}>
              <h3>Student: {p.student_name}</h3>
              <p>Organization: {p.organization_name}</p>


    {/* ✅ SUMMARY ONLY */}
    <p><strong>Workplace Score:</strong> {workplaceScore} / 60</p>
    <p><strong>Logs Score:</strong> {logScore} / 20</p>

    {/* ✅ BUTTON */}
    <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>

  <button style={buttonStyle} onClick={() => {
    setActiveStudent(p.id);
    setViewMode((prev) => ({ ...prev, [p.id]: "evaluate" }));
  }}>
    Evaluate Student
  </button>

  <button style={buttonStyle} onClick={() => {
    setActiveStudent(p.id);
    setViewMode((prev) => ({ ...prev, [p.id]: "logs" }));
  }}>
    View Weekly Logs
  </button>

  <button style={buttonStyle} onClick={() => {
    setActiveStudent(p.id);
    setViewMode((prev) => ({ ...prev, [p.id]: "workplace" }));
  }}>
    View Workplace Evaluation
  </button>

</div>


{activeStudent === p.id && viewMode[p.id] === "evaluate" && (
  <>           

<h4>Workplace Evaluation</h4>
{workplaceEval ? (
  <div>
    <p><strong>Total Score:</strong> {workplaceEval.score} / 60</p>

    <p><strong>Comments:</strong> {workplaceEval.comments}</p>
  </div>
) : (
  <p>No workplace evaluation yet</p>
)}

              {/* ✅ ADD THIS BLOCK HERE */}
<h4>Weekly Logs</h4>

<p>Total Logs Submitted: {logCount}</p>
<p>Logs Counted (Max 8): {countedLogs}</p>
<p>Log Score: {logScore} / 20</p>


<h4>Academic Evaluation</h4>

{/* ✅ IF NOT SUBMITTED OR EDITING */}
{!academicEval || editing[p.id] ? (
  <div>
    <input
      type="number"
      min="0"
      max="20"
      placeholder="Enter marks out of 20"
      value={
        scores[p.id] !== undefined
          ? scores[p.id]
          : academicEval?.score || ""
      }
      onChange={(e) => {
        let value = parseInt(e.target.value);

        if (isNaN(value)) value = 0;
        if (value < 0) value = 0;
        if (value > 20) value = 20;

        setScores((prev) => ({
          ...prev,
          [p.id]: value,
        }));
      }}
    />

    <br />

    <button style={buttonStyle}
      onClick={() => {
        submitEvaluation(p.id);
        setEditing((prev) => ({ ...prev, [p.id]: false }));
      }}
    >
      {academicEval ? "Update Evaluation" : "Submit Evaluation"}
    </button>
  </div>
) : (
  <div>
    {/* ✅ SHOW SUBMITTED STATE */}
    <p style={{ color: "green" }}>
      ✅ Evaluation submitted
    </p>

    {/* ✅ EDIT BUTTON */}
    <button style={buttonStyle}
      onClick={() =>
        setEditing((prev) => ({ ...prev, [p.id]: true }))
      }
    >
      Edit Evaluation
    </button>
  </div>
)}



<h4>Final Score Preview</h4>

<p>
  Workplace: {workplaceScore} / 60
</p>

<p>
  Logs: {logScore} / 20
</p>

<p>
  Academic: {academicScore} / 20
</p>

<hr />

<p>
  <strong>Total: {finalScore} / 100</strong>
</p>

  </>
)}

{/* ✅ VIEW WORKPLACE EVALUATION */}
{activeStudent === p.id && viewMode[p.id] === "workplace" && (
  <div style={{ marginTop: "15px" }}>
    <h4>Workplace Evaluation</h4>

    {workplaceEval ? (
      <>
        <p><strong>Total Score:</strong> {workplaceEval.score} / 60</p>

        <h5>Criteria Breakdown</h5>
        <ul>
          {workplaceEval.criteria_scores?.map((item) => (
            <li key={item.id}>
              {item.criteria_name}: {item.score}
            </li>
          ))}
        </ul>

        <p><strong>Comments:</strong> {workplaceEval.comments}</p>
      </>
    ) : (
      <p>No workplace evaluation yet</p>
    )}
  </div>
)}

{/* ✅ VIEW WEEKLY LOGS */}
{activeStudent === p.id && viewMode[p.id] === "logs" && (
  <div style={{ marginTop: "15px" }}>
    <h4>Weekly Logs</h4>

    <p>Total Logs Submitted: {logCount}</p>
    <p>Logs Counted (Max 8): {countedLogs}</p>
    <p>Log Score: {logScore} / 20</p>

    <ul>
      {studentLogs.map((log) => (
  <div
    key={log.id}
    style={{
      border: "1px solid #ccc",
      padding: "15px",
      marginBottom: "10px",
      borderRadius: "8px",
      background: "#f9f9f9"
    }}
  >
    <p><strong>Week:</strong> {log.week_number}</p>
    <p><strong>Organization:</strong> {p.organization_name}</p>

    <p><strong>Tasks:</strong> {log.tasks}</p>

    {/* ✅ SAFE: challenges exists */}
    <p><strong>Challenges:</strong> {log.challenges || "None"}</p>

    {/* ✅ CORRECT FIELD NAME */}
    <p><strong>Days Worked:</strong> {log.attendance_days}</p>

    {/* ✅ status exists */}
    <p><strong>Status:</strong> {log.status}</p>

    {/* ✅ OPTIONAL: only show if exists */}
    {log.supervisor_feedback && (
      <p><strong>Supervisor Feedback:</strong> {log.supervisor_feedback}</p>
    )}
  </div>
))}
    </ul>
  </div>
)}
            </div>
          );
        })
      )}
        </>
)}

{page === "students" && (
  <div>
    <h2>My Students</h2>

<table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>Name</th>
          <th style={thStyle}>Status</th>
          <th style={thStyle}>Action</th>
        </tr>
      </thead>
      <tbody>
        {placements.map((p) => {
          const academicEval = evaluations.find(
            (ev) =>
              ev.placement === p.id &&
              ev.supervisor_type === "academic"
          );

          return (
            <tr key={p.id}>
              <td style={tdStyle}>{p.student_name}</td>
              <td>
                {academicEval ? "Evaluated" : "Pending"}
              </td>
              <td>
<button style={buttonStyle}
  onClick={() => {
    setActiveStudent(p.id);
    setViewMode((prev) => ({
      ...prev,
      [p.id]:
        prev[p.id] === "viewStudent" ? null : "viewStudent",
    }));
  }}
>
  {academicEval ? "View" : "Evaluate"}
</button>    
{viewMode[p.id] === "viewStudent" && (
  <div style={{ marginTop: "10px", padding: "10px", background: "#f4f6f7", borderRadius: "6px" }}>
    
    <p><strong>Student:</strong> {p.student_name}</p>

    <p>
<strong>Academic Score:</strong>{" "}
{academicEval?.score !== undefined
  ? academicEval.score
  : "Not yet graded"}
    </p>

    <p>
      <strong>Workplace Score:</strong>{" "}
      {evaluations.find(e => e.placement === p.id && e.supervisor_type === "workplace")?.score || 0} / 60
    </p>

    <p>
      <strong>Logs:</strong>{" "}
      {(logs[p.id]?.length || 0)} submitted
    </p>

  </div>
)}         

              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
)}

{page === "evaluations" && (
  <div>
    <h2>My Evaluations</h2>

    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>Student</th>
          <th style={thStyle}>Total Score</th>
        </tr>
      </thead>
      <tbody>
        {placements.map((p) => {
          const workplaceEval = evaluations.find(
            (ev) => ev.placement === p.id && ev.supervisor_type === "workplace"
          );

          const academicEval = evaluations.find(
            (ev) => ev.placement === p.id && ev.supervisor_type === "academic"
          );

          const studentLogs = logs[p.id] || [];
          const logScore = Math.min(studentLogs.length, 8) * 2.5;

const academicScore =
  academicEval?.score !== undefined
    ? academicEval.score
    : 0;

const total =
  (workplaceEval?.score || 0) +
  logScore +
  academicScore;

          return (
            <tr key={p.id}>
              <td style={tdStyle}>{p.student_name}</td>
              <td style={tdStyle}>{total} / 100</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
)}

{page === "reports" && (
  <div>
    <h2>Reports</h2>

    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>Student</th>
          <th style={thStyle}>Action</th>
        </tr>
      </thead>
      <tbody>
        {placements.map((p) => (
          <tr key={p.id}>
            <td style={tdStyle}>{p.student_name}</td>
            <td style={tdStyle}>
              <button style={buttonStyle}
                onClick={() =>
                  setViewMode((prev) => ({
                    ...prev,
                    [p.id]:
                      prev[p.id] === "report" ? null : "report",
                  }))
                }
              >
                View Full Evaluation
              </button>

              {viewMode[p.id] === "report" && (
                <div style={{ marginTop: "10px" }}>
                  <p><strong>Full Report for {p.student_name}</strong></p>

                  <p>Workplace: {
                    evaluations.find(e => e.placement === p.id && e.supervisor_type === "workplace")?.score || 0
                  }</p>
{/* ✅ FIXED: removed forced 0 */}
<p>
  Academic: {
    evaluations.find(e => e.placement === p.id && e.supervisor_type === "academic")?.score !== undefined
      ? evaluations.find(e => e.placement === p.id && e.supervisor_type === "academic").score
      : "Not graded"
  }
</p>

                  <p>Logs: {(logs[p.id]?.length || 0) * 2.5}</p>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

{page === "reportDetail" && activeStudent && (
  <div>
    <button style={buttonStyle} onClick={() => setPage("reports")}>← Back</button>

    {placements
      .filter((p) => p.id === activeStudent)
      .map((p) => {
        const workplaceEval = evaluations.find(
          (ev) => ev.placement === p.id && ev.supervisor_type === "workplace"
        );

        const academicEval = evaluations.find(
          (ev) => ev.placement === p.id && ev.supervisor_type === "academic"
        );

        const studentLogs = logs[p.id] || [];
        const logScore = Math.min(studentLogs.length, 8) * 2.5;

// ✅ FIXED: removed forced 0 for academic
const total =
  (workplaceEval?.score || 0) +
  logScore +
  (academicEval?.score !== undefined ? academicEval.score : 0);

        return (
          <div key={p.id}>
            <h3>{p.student_name}</h3>

            <p>Workplace: {workplaceEval?.score || 0} / 60</p>
            <p>Logs: {logScore} / 20</p>
            <p>
  Academic: {
    academicEval?.score !== undefined
      ? academicEval.score
      : "Not graded"
  } / 20
</p>

            <hr />

            <h2>Total: {total} / 100</h2>
          </div>
        );
      })}
  </div>
)}

    </div>
    
  );
}

export default AcademicDashboard;