 import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './MainLayout/Layout';
import Dashboard from './Pages/Dashboard';
import AddMachine from './Pages/AddMachine';
import Report from './Pages/Report';
import Login from './Login';
import AdminDashboard from './Pages/Admindashboard';
import ForgotPassword from './Pages/ForgotPassword';
import VerifyOTP from './Pages/VerifyOTP';
import ResetPassword from './Pages/ResetPassword';

const App = () => {
  return (
    <Router>
      <Routes>
        
         <Route path="/" element={<Login />}/>
         <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path='/admin-dashboard' element={<AdminDashboard/>}></Route>
          <Route path="dashboard" element={<Layout />}> 
          <Route index element={<Dashboard />} />
          <Route path="addmachine" element={<AddMachine />} />
          <Route path="report" element={<Report />} />
        </Route>
      </Routes>
    </Router>
  )
};

export default App; 
/* import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './MainLayout/Layout';
import Dashboard from './Pages/Dashboard';
import AddMachine from './Pages/AddMachine';
import Report from './Pages/Report';
import Login from './Login';
import AdminDashboard from './Pages/Admindashboard.jsx'; // Create this component

// A wrapper component to protect routes based on role
const ProtectedRoute = ({ children, requiredRole }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const userRole = localStorage.getItem("userRole");

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/" />;
  }

  if (requiredRole && userRole !== requiredRole) {
    // Redirect to dashboard if the user doesn't have the required role
    return <Navigate to="/dashboard" />;
  }

  return children;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Login Route */
        /*<Route path="/" element={<Login />} />

        {/* Protected Routes under Layout *
        <Route element={<Layout />}>
          {/* Regular User Dashboard 
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="user">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addmachine"
            element={
              <ProtectedRoute>
                <AddMachine />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report"
            element={
              <ProtectedRoute>
                <Report />
              </ProtectedRoute>
            }
          />
          {/* Admin Dashboard 
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
};

export default App; */