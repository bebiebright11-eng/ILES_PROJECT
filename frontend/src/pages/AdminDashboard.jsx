import {useEffect, useState} from "react";
import API from "../api";

function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [supervisors, setSupervisors] = useState([]);


const [organizations, setOrganizations] = useState([]);

const [orgForm, setOrgForm] = useState({
  name: "",
  location: "",
  email: "",
  phone: "",
  description: "",
  website: "",
});


const [editingOrg, setEditingOrg] = useState(null);
const [editForm, setEditForm] = useState({
  name: "",
  location: "",
  email: "",
  phone: "",
  description: "",
  website: "",
});

const startEdit = (org) => {
  setEditingOrg(org.id);
  setEditForm({
    name: org.name,
    location: org.location,
    email: org.email,
    phone: org.phone,
    description: org.description,
    website: org.website,
  });
};

const saveEdit = async (id) => {
  try {
    const res = await API.patch(`organizations/${id}/`, editForm);

    // update UI instantly
    setOrganizations((prev) =>
      prev.map((org) => (org.id === id ? res.data : org))
    );

    setEditingOrg(null);
    alert("Organization updated!");
  } catch (err) {
    console.log(err.response?.data);
    alert("Update failed");
  }
};

const deleteOrganization = async (id) => {
  const confirmDelete = window.confirm("Delete this organization?");
  if (!confirmDelete) return;

  try {
    await API.delete(`organizations/${id}/`);

    // remove from UI instantly
    setOrganizations((prev) => prev.filter((org) => org.id !== id));

    alert("Deleted!");
  } catch (err) {
    console.log(err);
    alert("Delete failed");
  }
};

const fetchOrganizations = async () => {
  try {
    const res = await API.get("internships/organizations/");
    setOrganizations(res.data);
  } catch (err) {
    console.log(err);
  }
};

  // NEW: track which application form is open
const [activePlacementForm, setActivePlacementForm] = useState(null);

// NEW: store form input values
const [placementFormData, setPlacementFormData] = useState({
  start_date: "",
  end_date: "",
});

// NEW: store selected supervisors per placement
const [selectedSupervisors, setSelectedSupervisors] = useState({});

const [showDropdown, setShowDropdown] = useState({});

const [savedRows, setSavedRows] = useState({});


const [criteria, setCriteria] = useState([]);
const [newCriteria, setNewCriteria] = useState({
  name: "",
  max_score: "",
});


//  handle dropdown selection
const handleSupervisorChange = (placementId, type, value) => {
  setSelectedSupervisors((prev) => ({
    ...prev,
    [placementId]: {
      ...prev[placementId],
      [type]: value,
    },
  }));
};

//  assign supervisors to placement
const assignSupervisors = async (placementId) => {
  const data = selectedSupervisors[placementId];

  if (!data || !data.workplace || !data.academic) {
    alert("Please select both supervisors");
    return;
  }

  try {
    await API.patch(`internships/placements/${placementId}/`, {
      workplace_supervisor: data.workplace,
      academic_supervisor: data.academic,
    });

    alert("Supervisors assigned!");
    fetchPlacements();
  } catch (error) {
    console.log(error);
    alert("Failed to assign supervisors");
  }
};


const fetchCriteria = async () => {
  try {
    const res = await API.get("supervision/criteria/");
    console.log("CRITERIA:", res.data); // 🔥 DEBUG
    setCriteria(res.data);
  } catch (err) {
    console.log(err);
  }
};



  //  GROUP APPLICATIONS BY STUDENT
const groupApplicationsByStudent = () => {
  const grouped = {};

  applications.forEach((app) => {
    const student = app.student_name; // or app.student_name if available

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


  const createOrganization = async () => {
  if (!orgForm.name || !orgForm.location) {
    alert("Name and location are required");
    return;
  }

  try {
    const res = await API.post("organizations/", orgForm);

    setOrganizations((prev) => [...prev, res.data]);

    // reset form
    setOrgForm({
      name: "",
      location: "",
      email: "",
      phone: "",
      description: "",
      website: "",
    });

    alert("Organization created!");
  } catch (err) {
    console.log(err.response?.data);
    alert("Failed to create organization");
  }
};


useEffect(() => {
  fetchApplications();
  fetchPlacements();
  fetchSupervisors();
  fetchCriteria();  // ✅ ADD THIS LINE
  fetchOrganizations();
  
}, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>


      <h2>Organizations</h2>

<div
  style={{
    border: "1px solid #ccc",
    padding: "15px",
    marginBottom: "20px",
    borderRadius: "8px",
    background: "#f9f9f9",
    maxWidth: "500px"
  }}
>
  <h3>Add Organization</h3>

  <input
    type="text"
    placeholder="Name"
    value={orgForm.name}
    onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
  />
  <br /><br />

  <input
    type="text"
    placeholder="Location"
    value={orgForm.location}
    onChange={(e) => setOrgForm({ ...orgForm, location: e.target.value })}
  />
  <br /><br />

  <input
    type="email"
    placeholder="Email"
    value={orgForm.email}
    onChange={(e) => setOrgForm({ ...orgForm, email: e.target.value })}
  />
  <br /><br />

  <input
    type="text"
    placeholder="Phone"
    value={orgForm.phone}
    onChange={(e) => setOrgForm({ ...orgForm, phone: e.target.value })}
  />
  <br /><br />

  <textarea
    placeholder="Description"
    value={orgForm.description}
    onChange={(e) =>
      setOrgForm({ ...orgForm, description: e.target.value })
    }
  />
  <br /><br />

  <input
    type="text"
    placeholder="Website URL"
    value={orgForm.website}
    onChange={(e) =>
      setOrgForm({ ...orgForm, website: e.target.value })
    }
  />
  <br /><br />

  <button onClick={createOrganization}>
    Create Organization
  </button>
</div>


<h3>Existing Organizations</h3>

{organizations.length === 0 ? (
  <p>No organizations yet</p>
) : (
  organizations.map((org) => (
    <div
      key={org.id}
      style={{
        border: "1px solid #ddd",
        padding: "10px",
        marginBottom: "10px",
        borderRadius: "6px",
        background: "#fff",
      }}
    >
      {editingOrg === org.id ? (
        <>
          <input
            value={editForm.name}
            onChange={(e) =>
              setEditForm({ ...editForm, name: e.target.value })
            }
          />
          <br />

          <input
            value={editForm.location}
            onChange={(e) =>
              setEditForm({ ...editForm, location: e.target.value })
            }
          />
          <br />

          <input
            value={editForm.email}
            onChange={(e) =>
              setEditForm({ ...editForm, email: e.target.value })
            }
          />
          <br />

          <input
            value={editForm.phone}
            onChange={(e) =>
              setEditForm({ ...editForm, phone: e.target.value })
            }
          />
          <br />

          <textarea
            value={editForm.description}
            onChange={(e) =>
              setEditForm({ ...editForm, description: e.target.value })
            }
          />
          <br />

          <input
            value={editForm.website}
            onChange={(e) =>
              setEditForm({ ...editForm, website: e.target.value })
            }
          />
          <br /><br />

          <button onClick={() => saveEdit(org.id)}>Save</button>
          <button onClick={() => setEditingOrg(null)}>Cancel</button>
        </>
      ) : (
        <>
          <p><strong>{org.name}</strong></p>
          <p>{org.location}</p>
          <p>{org.email}</p>
          <p>{org.phone}</p>
          <p>{org.description}</p>
          <p>{org.website}</p>

          <button onClick={() => startEdit(org)}>Edit</button>
          <button onClick={() => deleteOrganization(org.id)}>
            Delete
          </button>
        </>
      )}
    </div>
  ))
)}


      <h2>Global Evaluation Criteria (Admin Only)</h2>

<table border="1" cellPadding="10" style={{ marginTop: "10px",marginLeft:"30px" }}>
  <thead>
    <tr>
      <th>Criteria</th>
      <th>Max Score</th>
      <th>Score</th>
      <th>Actions</th>
    </tr>
  </thead>

  <tbody>
    {criteria.map((c) => (
      <tr key={c.id}>
        <td>
          <input
            type="text"
            value={c.name}
            onChange={(e) => {
              const updated = criteria.map((item) =>
                item.id === c.id ? { ...item, name: e.target.value } : item
              );
              setCriteria(updated);
            }}
          />
        </td>

        <td>
          <input
            type="number"
            value={c.max_score}
            onChange={(e) => {
              const updated = criteria.map((item) =>
                item.id === c.id
                  ? { ...item, max_score: e.target.value }
                  : item
              );
              setCriteria(updated);
            }}
          />
        </td>

        {/* 🔥 Score column (Admin optional / future use) */}
        <td>
          <input type="number" placeholder="-" disabled />
        </td>

        <td>
<button
  onClick={async () => {
    try {
      await API.patch(`supervision/criteria/${c.id}/`, {
        name: c.name,
        max_score: Number(c.max_score),
      });

      setSavedRows((prev) => ({
        ...prev,
        [c.id]: true,
      }));

    } catch {
      alert("Update failed");
    }
  }}
>
  {savedRows[c.id] ? "Saved ✅" : "Save"}
</button>
  <button
  onClick={async () => {
    try {
      await API.delete(`supervision/criteria/${c.id}/`);

      // ✅ remove instantly from UI
      setCriteria((prev) => prev.filter((item) => item.id !== c.id));

    } catch {
      alert("Delete failed");
    }
  }}
>
  Delete
</button>


        </td>
      </tr>
    ))}

    {/* 🔥 ADD NEW ROW */}
    <tr>
      <td>
        <input
          type="text"
          placeholder="New Criteria"
          value={newCriteria.name}
          onChange={(e) =>
            setNewCriteria({ ...newCriteria, name: e.target.value })
          }
        />
      </td>

      <td>
        <input
          type="number"
          placeholder="Max"
          value={newCriteria.max_score}
          onChange={(e) =>
            setNewCriteria({ ...newCriteria, max_score: e.target.value })
          }
        />
      </td>

      <td>-</td>

      <td>
<button
  onClick={async () => {
    if (!newCriteria.name || !newCriteria.max_score) {
      alert("Please fill all fields");
      return;
    }

    // 🚨 LIMIT CHECK
    if (criteria.length >= 6) {
      const confirmAdd = window.confirm(
        "You have reached 6 criteria. Do you want to add another?"
      );

      if (!confirmAdd) return;
    }

    try {
      const res = await API.post("supervision/criteria/", {
        name: newCriteria.name,
        max_score: Number(newCriteria.max_score),
      });

      // ✅ add instantly to UI
      setCriteria((prev) => [...prev, res.data]);

      setNewCriteria({ name: "", max_score: "" });

    } catch (err) {
      console.log(err.response?.data);
      alert("Failed to create criteria");
    }
  }}
>
  Add
</button>

      </td>
    </tr>
  </tbody>
</table>




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
          <p><strong>Organization:</strong> {app.organization_name}</p>
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





{/* 🔥 SHOW BUTTON ONLY IF APPROVED */}
{app.status === "approved" && (
  placements.some((p) => p.student === app.student) ? (
    <p style={{ color: "green", fontWeight: "bold" }}>
      ✅ Placement Created
    </p>
  ) : (
    <button
      onClick={() => {
        setActivePlacementForm(app.id);
        setPlacementFormData({
          start_date: "",
          end_date: "",
        });
      }}
    >
      Create Placement
    </button>
  )
)}


{/* 🔥 INLINE PLACEMENT FORM */}
{activePlacementForm === app.id && (
  <div style={{ marginTop: "10px", padding: "10px", border: "1px solid blue" }}>
    
    {/* START DATE */}
    <input
      type="date"
      value={placementFormData.start_date}
      onChange={(e) =>
        setPlacementFormData({
          ...placementFormData,
          start_date: e.target.value,
        })
      }
    />

    <br /><br />

    {/* END DATE */}
    <input
      type="date"
      value={placementFormData.end_date}
      onChange={(e) =>
        setPlacementFormData({
          ...placementFormData,
          end_date: e.target.value,
        })
      }
    />

    <br /><br />

    {/* SAVE BUTTON */}
    <button
      onClick={async () => {
        try {
          await API.post("internships/placements/", {
            student: app.student,
            organization: app.organization,
            start_date: placementFormData.start_date,
            end_date: placementFormData.end_date,
          });

          alert("Placement created!");

          // 🔥 close form after saving
          setActivePlacementForm(null);

          fetchPlacements();
        } catch (error) {
            console.log(error.response?.data);

            if (error.response?.data?.student) {
               alert("This student already has a placement!");
            } else {
              alert("Failed to create placement");
            }
          }
      }}
    >
      Save Placement
    </button>

  </div>
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
      placements.map((p) => {
        // 🔥 filter supervisors per placement
      const workplaceSupervisors = supervisors.filter(
        (u) => u.role === "workplace" && u.organization === p.organization
      );

      const academicSupervisors = supervisors.filter(
        (u) => u.role === "academic"
      );
      return(
        <div key={p.id}>
  <p><strong>Student:</strong> {p.student_name}</p>
  <p><strong>Organization:</strong> {p.organization_name}</p>
  <p><strong>Start Date:</strong> {p.start_date || "Not set"}</p>
  <p><strong>End Date:</strong> {p.end_date || "Not set"}</p>

  {/* ✅ SHOW FINAL STATE */}
  {p.is_fully_assigned ? (
    <>
      <p><strong>Status:</strong> {p.status}</p>

      <p><strong>Workplace Supervisor:</strong> {p.workplace_supervisor_name}</p>
      <p><strong>Academic Supervisor:</strong> {p.academic_supervisor_name}</p>

      <p style={{ color: "green", fontWeight: "bold" }}>
        ✅ Placement Confirmed
      </p>
    </>
  ) : (
    <>
      {/* 🔧 EDIT MODE (ONLY BEFORE ASSIGNMENT) */}

      <br />

      <input
        type="date"
        defaultValue={p.start_date || ""}
        onBlur={async (e) => {
          try {
            await API.patch(`internships/placements/${p.id}/`, {
              start_date: e.target.value,
            });
            fetchPlacements();
          } catch (err) {
            alert("Failed to update start date");
          }
        }}
      />

      <br /><br />

      <input
        type="date"
        defaultValue={p.end_date || ""}
        onBlur={async (e) => {
          try {
            await API.patch(`internships/placements/${p.id}/`, {
              end_date: e.target.value,
            });
            fetchPlacements();
          } catch (err) {
            alert("Failed to update end date");
          }
        }}
      />

      <br /><br />

      {/* 🔍 WORKPLACE SEARCH */}
<input
  type="text"
  placeholder="Search workplace supervisor"
  value={selectedSupervisors[p.id]?.workplace_search || ""}
  onFocus={() =>
    setShowDropdown((prev) => ({ ...prev, [p.id]: true }))
  }
  onChange={(e) => {
    handleSupervisorChange(p.id, "workplace_search", e.target.value);
    setShowDropdown((prev) => ({ ...prev, [p.id]: true }));
  }}
/>

{/* ✅ DROPDOWN */}
{showDropdown[p.id] && (
  <div style={{
    border: "1px solid #ccc",
    maxHeight: "120px",
    overflowY: "auto",
    background: "#fff"
  }}>
    {workplaceSupervisors
      .filter((u) => {
        const search = selectedSupervisors[p.id]?.workplace_search || "";
        return u.username.toLowerCase().includes(search.toLowerCase());
      })
      .map((u) => (
        <div
          key={u.id}
          onClick={() => {
            handleSupervisorChange(p.id, "workplace", u.id);
            handleSupervisorChange(p.id, "workplace_search", u.username);

            setShowDropdown((prev) => ({
              ...prev,
              [p.id]: false,
            }));
          }}
          style={{ padding: "5px", cursor: "pointer" }}
        >
          {u.username}
        </div>
      ))}
  </div>
)}


      <br /><br />

      {/* 🔍 ACADEMIC SEARCH */}
<input
  type="text"
  placeholder="Search academic supervisor"
  value={selectedSupervisors[p.id]?.academic_search || ""}
  onFocus={() =>
    setShowDropdown((prev) => ({ ...prev, [p.id]: true }))
  }
  onChange={(e) => {
    handleSupervisorChange(p.id, "academic_search", e.target.value);
    setShowDropdown((prev) => ({ ...prev, [p.id]: true }));
  }}
/>

{showDropdown[p.id] && (
  <div style={{
    border: "1px solid #ccc",
    maxHeight: "120px",
    overflowY: "auto",
    background: "#fff"
  }}>
    {academicSupervisors
      .filter((u) => {
        const search = selectedSupervisors[p.id]?.academic_search || "";
        return u.username.toLowerCase().includes(search.toLowerCase());
      })
      .map((u) => (
        <div
          key={u.id}
          onClick={() => {
            handleSupervisorChange(p.id, "academic", u.id);
            handleSupervisorChange(p.id, "academic_search", u.username);

            setShowDropdown((prev) => ({
              ...prev,
              [p.id]: false,
            }));
          }}
          style={{ padding: "5px", cursor: "pointer" }}
        >
          {u.username}
        </div>
      ))}
  </div>
)}

      <br /><br />

      <button onClick={() => assignSupervisors(p.id)}>
        Assign Supervisors
      </button>
    </>
  )}
</div>
        

      );
    })
  )}

    </div>    
  );
}

export default AdminDashboard;



