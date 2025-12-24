import React, { useState, useEffect } from "react";
import { Analytics } from '@vercel/analytics/react';
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider } from "./User/context/AuthContext";
import { AdminProvider } from "./context/AdminContext";

import Header from "./User/components/Header";
import Profile from './User/pages/Profile';
import Footer from "./User/components/Footer";
import AdminLayout from "./Admin/components/AdminLayout";
import AdminAbout from "./Admin/pages/AdminAbout";
import NotFound from "./User/components/NotFound";
import AdminInfo from "./Admin/components/AdminInfo";
import AdminLogin from "./Admin/pages/AdminLogin";
import AdminRegister from "./Admin/pages/AdminRegister.jsx";
import JobPostForm from "./Admin/pages/JobPostForm"; // ✅ Fixed path
import AdminProfile from "./Admin/pages/AdminProfile"; // ✅ Fixed path
import CandidateManagement from "./Admin/components/CandidateManagement.jsx";

import Home from "./User/pages/Home";
import About from "./User/pages/About";
import Pricing from "./User/pages/Pricing";
import Contact from "./User/pages/Contact";
import JobDetails from './User/components/JobDetails';
import MyApplications from './User/components/MyApplications';
import Faq from "./User/pages/Faq";
import Login from "./User/pages/Login";
import Register from "./User/pages/Register";
import CompanyReviews from "./User/pages/CompanyReviews";
import JobList from "./User/pages/JobList";
import CareerAdvice from "./User/pages/CareerAdvice";
import Help from "./User/pages/Help";
import Salary from "./User/pages/Salary";
import ProtectedRoute from "./User/components/ProtectedRoute";
import RoleSelection from "./User/pages/RoleSelection";
import JobManagement from "./Admin/components/JobManagement";

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("darkMode");
    return savedTheme ? JSON.parse(savedTheme) : false;
  });

  const location = useLocation();

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.body.classList.add("dark-theme");
      document.body.classList.remove("light-theme");
    } else {
      document.body.classList.add("light-theme");
      document.body.classList.remove("dark-theme");
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Check if current route is admin route
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <AuthProvider>
      <AdminProvider>
        <Analytics />
        <div className={isDarkMode ? "dark-theme" : "light-theme"}>
          {!isAdminRoute && (
            <Header 
              isDarkMode={isDarkMode} 
              toggleTheme={toggleTheme} 
            />
          )}
          
          <main className="main-content">
            <div className="container mt-4 mb-5">
              <Routes>
                {/* Default route */}
                <Route path="/" element={<Navigate to="/welcome" replace />} />
                
                {/* Welcome/Role Selection Page */}
                <Route path="/welcome" element={<RoleSelection />} />
                
                {/* Main Home Page */}
                <Route path="/home" element={<Home />} />
                
                {/* ✅ Admin Routes - WITHOUT AdminLayout for login/register */}
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/admin-register" element={<AdminRegister />} />
                
                {/* ✅ Admin Routes with Layout */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminInfo />} /> {/* /admin */}
                  <Route path="about" element={<AdminAbout />} />
                  <Route path="dashboard" element={<AdminInfo />} />
                  <Route path="post-job" element={<JobPostForm />} />

                  <Route path="profile" element={<AdminProfile />} />
                  <Route path="candidates" element={<CandidateManagement />} />
                  <Route path="jobs" element={<JobManagement />} />
                  
                   {/* ✅ Add inside AdminLayout */}
                  {/* અન્ય Admin Routes અહીં ઉમેરો */}
                </Route>
                
                {/* Other Routes */}
                <Route path="/about" element={<About />} />
                <Route path="/jobs/:id" element={<JobDetails />} />
                <Route path="/my-applications" element={<MyApplications />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<Faq />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/companyreviews" element={<CompanyReviews />} />
                <Route path="/jobs" element={<JobList />} />
                <Route path="/careeradvice" element={<CareerAdvice />} />
                <Route path="/help" element={<Help />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/salary" element={<Salary />} />

                
                {/* ❌ Remove external /post-job route - it should be inside /admin */}
                
                {/* Example protected route */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <div className="container mt-4">
                        <h2>Dashboard</h2>
                        <p>Welcome to your dashboard!</p>
                      </div>
                    </ProtectedRoute>
                  } 
                />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </main>

          {!isAdminRoute && <Footer isDarkMode={isDarkMode} />}
        </div>
      </AdminProvider>
    </AuthProvider>
  );
};

export default App;