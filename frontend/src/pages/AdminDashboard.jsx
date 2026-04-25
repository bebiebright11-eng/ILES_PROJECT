import {useEffect, useState} from "react";
import API from "../api";

function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [supervisors, setSupervisors] = useState([]);




  // 🔥 GROUP APPLICATIONS BY STUDENT
const groupApplicationsByStudent = () => {
  const grouped = {};

  applications.forEach((app) => {
    const student = app.student; // or app.student_name if available

    if (!grouped[student]) {
      grouped[student] = [];
    }

    grouped[student].push(app);
  });

  return grouped;
};




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
      fetchApplications(); // refresh data

    } catch (error) {
      console.log(error);
    }
  };

const fetchPlacements = async () => {
    try {
      const res = await API.get("internships/placements/");
      setPlacements(res.data);
    } catch (error) {
      console.log(error);
    }
  };

const fetchSupervisors = async () => {
    try {
      const res = await API.get("accounts/users/");
      setSupervisors(res.data);
    } catch (error) {
      console.log(error);
    }
  };  

const assignSupervisors = async (placementId, workplaceId, academicId) => {
  try {
    await API.patch(`internships/placements/${placementId}/`, {
      workplace_supervisor: workplaceId,
      academic_supervisor: academicId,
    });

    alert("Supervisors assigned!");
    fetchPlacements(); // refresh placements

  } catch (error) {
    console.log(error);
    alert("Failed to assign supervisors");
  }
};

useEffect(() => {
  fetchApplications();
  fetchPlacements();
  fetchSupervisors();
}, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <h2>Applications</h2>


{applications.length === 0 ? (
  <p>No applications yet</p>
) : (
  Object.entries(groupApplicationsByStudent()).map(([student, apps]) => (
    <div
      key={student}
      style={{ border: "2px solid black", margin: "15px", padding: "10px" }}
    >
      
      {/* 🔥 STUDENT NAME */}
      <h3>Student: {student}</h3>

      {/* 🔥 APPLICATIONS UNDER THAT STUDENT */}
      {apps.map((app) => (
        <div
          key={app.id}
          style={{
            marginLeft: "20px",
            borderTop: "1px solid gray",
            padding: "5px",
          }}
        >
          <p><strong>Organization:</strong> {app.organization}</p>
          <p><strong>Status:</strong> {app.status}</p>

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
      ))}
    </div>
  ))
)}

      <h2>Placements</h2>

    {placements.length === 0 ? (
      <p>No placements yet</p>
    ) : (
      placements.map((p) => (
        <div key={p.id}>
          <p><strong>Student:</strong> {p.student}</p>
          <p><strong>Organization:</strong> {p.organization}</p>

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