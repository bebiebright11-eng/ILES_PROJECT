import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import WorkplaceDashboard from "./pages/WorkplaceDashboard";
import AcademicDashboard from "./pages/AcademicDashboard";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/workplace" element={<WorkplaceDashboard />} />
      <Route path="/academic" element={<AcademicDashboard />} />
    </Routes>
  </BrowserRouter>
);
