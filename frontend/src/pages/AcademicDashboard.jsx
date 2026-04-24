import { useEffect, useState } from "react";
import API from "../api";

function AcademicDashboard() {
  const [placements, setPlacements] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [scores, setScores] = useState({});
  const [evaluations, setEvaluations] = useState([]);

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

  useEffect(() => {
    fetchPlacements();
    fetchCriteria();
    fetchEvaluations();
  }, []);

  // 🔹 Handle input
  const handleScoreChange = (placementId, criteriaId, value) => {
    setScores((prev) => ({
      ...prev,
      [placementId]: {
        ...prev[placementId],
        [criteriaId]: parseInt(value),
      },
    }));
  };

  // 🔹 Submit FINAL evaluation
  const submitEvaluation = async (placementId) => {
    try {
      const criteriaScores = Object.entries(scores[placementId] || {}).map(
        ([criteriaId, score]) => ({
          criteria: parseInt(criteriaId),
          score: score,
        })
      );

      await API.post(
        "supervision/evaluations/",
        {
          placement: placementId,
          supervisor_type: "academic",
          comments: "Final academic evaluation",
          criteria_scores: criteriaScores,
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

              {/* 🔹 ACADEMIC INPUT */}
              <h4>Academic Evaluation</h4>

              {criteria.map((c) => (
                <div key={c.id}>
                  <label>
                    {c.name} (Max: {c.max_score})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={c.max_score}
                    onChange={(e) =>
                      handleScoreChange(p.id, c.id, e.target.value)
                    }
                  />
                </div>
              ))}

              <br />

              <button onClick={() => submitEvaluation(p.id)}>
                Submit Final Evaluation
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}

export default AcademicDashboard;