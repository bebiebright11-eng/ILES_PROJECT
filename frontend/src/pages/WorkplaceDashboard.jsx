import { useEffect, useState } from "react";
import API from "../api";

function WorkplaceDashboard() {
  const [placements, setPlacements] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [scores, setScores] = useState({});

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

  useEffect(() => {
    fetchPlacements();
    fetchCriteria();
  }, []);

  // 🔹 Handle input change
  const handleScoreChange = (placementId, criteriaId, value) => {
    setScores((prev) => ({
      ...prev,
      [placementId]: {
        ...prev[placementId],
        [criteriaId]: parseInt(value),
      },
    }));
  };

  // 🔹 Submit evaluation
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
          supervisor_type: "workplace",
          comments: "Workplace evaluation submitted",
          criteria_scores: criteriaScores,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("Evaluation submitted!");
    }catch (error) {
      console.log("FULL ERROR:", error);
      console.log("BACKEND RESPONSE:", error.response?.data);
      alert(JSON.stringify(error.response?.data));
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Workplace Supervisor Dashboard</h1>

      {placements.length === 0 ? (
        <p>No students assigned</p>
      ) : (
        placements.map((p) => (
          <div key={p.id} style={{ border: "1px solid black", margin: "10px", padding: "10px" }}>
            <h3><strong>Student: </strong>{p.student_name || p.student}</h3>
            <p><strong>Organization: </strong>{p.organization_name || p.organization}</p>

            <h4><strong>Evaluation: </strong></h4>

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
              Submit Evaluation
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default WorkplaceDashboard;