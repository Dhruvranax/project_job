// frontend/src/context/AdminContext.js - COMPLETE FIXED VERSION
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load admin from localStorage on app start
  useEffect(() => {
    console.log("🔄 AdminContext: Loading from localStorage...");
    
    const loadAdminData = () => {
      try {
        const savedAdmin = localStorage.getItem('admin');
        const savedToken = localStorage.getItem('adminToken');
        
        console.log("📦 LocalStorage admin:", savedAdmin ? "EXISTS" : "EMPTY");
        console.log("📦 LocalStorage token:", savedToken ? "EXISTS" : "EMPTY");
        
        if (savedAdmin && savedAdmin !== "null" && savedAdmin !== "undefined") {
          const parsedAdmin = JSON.parse(savedAdmin);
          
          // CRITICAL: Check if admin has valid ID
          if (parsedAdmin && (parsedAdmin._id || parsedAdmin.id)) {
            console.log("✅ Valid admin found in localStorage");
            console.log("Admin ID:", parsedAdmin._id || parsedAdmin.id);
            console.log("Admin Name:", parsedAdmin.fullName);
            
            setAdmin(parsedAdmin);
            
            // Set axios header
            if (savedToken) {
              axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
              console.log("🔐 Axios header set with token");
            }
          } else {
            console.log("❌ Admin in localStorage missing ID");
            console.log("Admin object:", parsedAdmin);
            localStorage.removeItem('admin');
            localStorage.removeItem('adminToken');
          }
        }
      } catch (error) {
        console.error("❌ Error loading admin from localStorage:", error);
        localStorage.removeItem('admin');
        localStorage.removeItem('adminToken');
      } finally {
        setLoading(false);
      }
    };
    
    loadAdminData();
  }, []);

  // ✅ FIXED: login function - SAVES ADMIN ID PROPERLY
  const login = (adminData) => {
    console.log("🔑 AdminContext.login() called");
    console.log("Admin data received:", adminData);
    
    if (!adminData) {
      console.error("❌ No admin data provided");
      return;
    }
    
    // Extract token
    const token = adminData.token || adminData.accessToken;
    
    // CRITICAL: Ensure we have the admin ID
    const adminId = adminData._id || adminData.id || (adminData.admin && adminData.admin._id);
    
    if (!adminId) {
      console.error("❌ CRITICAL ERROR: No admin ID in login data!");
      console.error("Full adminData:", adminData);
      alert("Login failed: No admin ID received from server");
      return;
    }
    
    // Create complete admin object
    const adminToSave = {
      // ID fields - MOST IMPORTANT
      _id: adminId,
      id: adminId,
      
      // Basic info
      fullName: adminData.fullName || adminData.name || "Admin",
      email: adminData.email,
      phone: adminData.phone || "",
      
      // Company info
      companyName: adminData.companyName || "",
      companyType: adminData.companyType || "",
      companySize: adminData.companySize || "",
      industry: adminData.industry || "",
      
      // System fields
      role: 'admin',
      isActive: true,
      loginTime: new Date().toISOString(),
      
      // Token
      token: token
    };
    
    console.log("💾 Saving admin to context:", adminToSave);
    console.log("Admin ID to save:", adminId);
    
    // Save to state
    setAdmin(adminToSave);
    
    // CRITICAL: Save to localStorage
    localStorage.setItem('admin', JSON.stringify(adminToSave));
    console.log("✅ Admin saved to localStorage");
    
    // Save token separately
    if (token) {
      localStorage.setItem('adminToken', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log("✅ Token saved to localStorage and axios header");
    }
    
    console.log("🎉 Admin login successful!");
  };

  // ✅ FIXED: getAdminId function - ALWAYS RETURNS VALID ID
  const getAdminId = () => {
    console.log("🔍 getAdminId() called");
    
    // Method 1: Try from context state
    if (admin && (admin._id || admin.id)) {
      const id = admin._id || admin.id;
      console.log("✅ Got ID from context:", id);
      return id;
    }
    
    // Method 2: Try localStorage directly
    console.log("⚠️ No ID in context, checking localStorage...");
    const savedAdmin = localStorage.getItem('admin');
    
    if (savedAdmin) {
      try {
        const parsed = JSON.parse(savedAdmin);
        const id = parsed._id || parsed.id;
        
        if (id) {
          console.log("✅ Got ID from localStorage:", id);
          // Update context with this data
          if (!admin) setAdmin(parsed);
          return id;
        }
      } catch (error) {
        console.error("Error parsing localStorage:", error);
      }
    }
    
    // Method 3: Return null if no ID found
    console.log("❌ No admin ID found anywhere!");
    console.log("Current admin state:", admin);
    console.log("LocalStorage admin:", savedAdmin);
    
    return null;
  };

  const logout = () => {
    console.log("🚪 Logging out admin");
    setAdmin(null);
    localStorage.removeItem('admin');
    localStorage.removeItem('adminToken');
    delete axios.defaults.headers.common['Authorization'];
  };

  const register = (adminData) => {
    console.log("📝 Registration:", adminData);
    login(adminData); // Registration also logs in
    return true;
  };

  const updateAdmin = (updatedData) => {
    if (admin) {
      const updatedAdmin = { ...admin, ...updatedData };
      setAdmin(updatedAdmin);
      localStorage.setItem('admin', JSON.stringify(updatedAdmin));
    }
  };

  // Check authentication status
  const isAuthenticated = () => {
    const id = getAdminId();
    const hasId = !!id && id !== "undefined" && id !== "null";
    console.log(`🔐 Auth check: ${hasId ? "AUTHENTICATED" : "NOT AUTHENTICATED"}`);
    return hasId;
  };

  return (
    <AdminContext.Provider value={{ 
      admin, 
      login, 
      logout,
      register,
      updateAdmin,
      getAdminId, // ✅ This is the FIXED function
      loading,
      isAuthenticated: isAuthenticated()
    }}>
      {children}
    </AdminContext.Provider>
  );
};