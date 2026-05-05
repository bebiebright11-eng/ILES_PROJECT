import { useEffect, useState } from "react";
import { useRef } from "react";
import API from "../api";

function WorkplaceDashboard() {
  const [placements, setPlacements] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [scores, setScores] = useState({});


const [activeEvaluation, setActiveEvaluation] = useState(null);
const [submittedEvaluations, setSubmittedEvaluations] = useState({});
const [comments, setComments] = useState({});
const menuRef = useRef();

const [existingEvaluations, setExistingEvaluations] = useState({});



//Ui design
const [showMenu, setShowMenu] = useState(false);
const totalStudents = placements.length;
const evaluatedStudents = Object.keys(submittedEvaluations).length;
const pendingStudents = totalStudents - evaluatedStudents;



  // 🔹 Fetch students assigned to this workplace supervisor
  const fetchPlacements = async () => {
    try {
      const res = await API.get("internships/placements/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // filter only workplace supervisor students
      const filtered = res.data.filter(
        (p) => p.workplace_supervisor === parseInt(localStorage.getItem("user_id"))
      );

      setPlacements(filtered);
    } catch (error) {
      console.log(error);
    }
  };

  // 🔹 Fetch evaluation criteria
  const fetchCriteria = async () => {
    try {
      const res = await API.get("supervision/criteria/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setCriteria(res.data.filter(c => c.is_active)); // Only fetch active criterias
    } catch (error) {
      console.log(error);
    }
  };
  
  const cardStyle = {
  border: "1px solid green",
  padding: "10px",
  borderRadius: "10px",
  width: "120px",
  textAlign: "center",
};


  useEffect(() => {
    fetchPlacements();
    fetchCriteria();
    fetchEvaluations();
      const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setShowMenu(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
  }, []);

  

  // 🔹 Handle input change
const handleScoreChange = (placementId, criteriaId, value, maxScore) => {
  let numericValue = parseInt(value) || 0;

  // 🚫 prevent negative
  if (numericValue < 0) numericValue = 0;

  // 🚫 prevent above max
  if (numericValue > maxScore) {
    numericValue = maxScore;
    alert(`Score cannot exceed ${maxScore}`);
  }

  setScores((prev) => ({
    ...prev,
    [placementId]: {
      ...prev[placementId],
      [criteriaId]: numericValue,
    },
  }));
};

  // 🔹 Submit evaluation
  const submitEvaluation = async (placementId) => {
  const studentScores = scores[placementId];

  if (!studentScores || Object.keys(studentScores).length !== criteria.length) {
    alert("Please fill all criteria");
    return;
  }

  try {
    const criteriaScores = Object.entries(studentScores).map(
      ([criteriaId, score]) => ({
        criteria: parseInt(criteriaId),
        score: score,
      })
    );

    await API.post(
      "supervision/evaluations/",
      {
        placement: placementId,
        supervisor_type: "workplace",
        comments: comments[placementId] || "",
        criteria_scores: criteriaScores,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    // ✅ mark as submitted
    setSubmittedEvaluations((prev) => ({
      ...prev,
      [placementId]: true,
    }));

    // ✅ close form
    setActiveEvaluation(null);

  } catch (error) {
  console.log("ERROR:", error.response?.data);

  // ✅ CASE 1: Already submitted
  if (
    error.response?.data?.non_field_errors &&
    error.response.data.non_field_errors[0].includes("unique")
  ) {
    alert("This student has already been evaluated.");

    // 🔥 Mark as submitted in UI
    setSubmittedEvaluations((prev) => ({
      ...prev,
      [placementId]: true,
    }));

    // 🔥 Close the form
    setActiveEvaluation(null);

    return;
  }

  // ❌ Other errors
  alert("Submission failed. Try again.");
}
};

const fetchEvaluations = async () => {
  const res = await API.get("supervision/evaluations/", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const map = {};
  res.data.forEach((e) => {
    map[e.placement] = e;
  });

  setExistingEvaluations(map);
};


return (
  <div style={{ padding: "20px", fontFamily: "Arial", position: "relative" }}>
    <h1 style={{ textAlign: "center" }}>
  INTERNSHIP PLACEMENT SYSTEM (ILES)
    </h1>
    <h2 style={{ textAlign: "center" }}>
      Workplace Dashboard
    </h2>

    <p>Welcome, {localStorage.getItem("username")}</p>


    <div ref={menuRef}>
    {/* 🔹 MENU BUTTON */}
    <div
      style={{ cursor: "pointer",marginLeft:"20px", marginBottom: "10px",textAlign: "left" }}
      onClick={() => setShowMenu(!showMenu)}
    >
      ☰ Menu
    </div>

    {/* 🔹 POPUP MENU */}
    {showMenu && (
      <div
          style={{
            position: "absolute",
            marginTop: "10px",
            background: "white",
            border: "1px solid #f35f5f",
            padding: "10px",
            width: "250px",
            boxShadow: "0px 2px 8px rgba(0,0,0,0.2)",
            borderRadius: "8px",
            zIndex: 999,
          }}
      >
        <p>🏠 Home</p>
        <p>👨‍🎓 My Students</p>
        <p>📝 Evaluations</p>
        <p>👤 Profile</p>
      </div>
    )}
    </div>


    {/* 🔹 SUMMARY CARDS */}
    <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>

      <div style={cardStyle}>
        <p>Students</p>
        <strong>{totalStudents}</strong>
      </div>

      <div style={cardStyle}>
        <p>Evaluated</p>
        <strong>{evaluatedStudents}</strong>
      </div>

      <div style={cardStyle}>
        <p>Pending</p>
        <strong>{pendingStudents}</strong>
      </div>

    </div>

    {/* 🔹 STUDENT LIST */}
    {placements.length === 0 ? (
      <p>No students assigned</p>
    ) : (
      placements.map((p) => (
        <div key={p.id} style={{ border: "1px solid black", margin: "10px", padding: "10px" }}>

          <h3><strong>Student: </strong>{p.student_name || p.student}</h3>
          <p><strong>Organization: </strong>{p.organization_name || p.organization}</p>

          {/* ADD BUTTON */}
          {!submittedEvaluations[p.id] && (
         <button onClick={() => setActiveEvaluation(p.id)}>
           {existingEvaluations[p.id] ? "Edit Evaluation" : "Add Evaluation"}
          </button>
          )}

          {/* FORM */}
          {activeEvaluation === p.id && (
            <div style={{
              marginTop: "15px",
              padding: "15px",
              border: "2px solid #444",
              borderRadius: "8px",
              backgroundColor: "#f9f9f9",
            }}>

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th>Criteria</th>
                    <th>Max</th>
                    <th>Score</th>
                  </tr>
                </thead>

                <tbody>
                  {criteria.map((c) => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>{c.max_score}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max={c.max_score}
                          value={scores[p.id]?.[c.id] || ""}
                          onChange={(e) =>
                            handleScoreChange(p.id, c.id, e.target.value, c.max_score)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <textarea
                placeholder="Write comments..."
                value={comments[p.id] || ""}
                onChange={(e) =>
                  setComments((prev) => ({
                    ...prev,
                    [p.id]: e.target.value,
                  }))
                }
                rows="4"
                style={{ width: "100%", marginTop: "10px" }}
              />

              <button onClick={() => submitEvaluation(p.id)}>
                Submit Evaluation
              </button>
            </div>
          )}

          {/* AFTER SUBMIT */}
          {existingEvaluations[p.id] && (
            <p style={{ color: "green" }}>
              ✅ Evaluation submitted (You can edit)
           </p>
          )}

        </div>
      ))
    )}

  </div>
);
}
export default WorkplaceDashboard;