import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import TestInterface from './pages/TestInterface';
import ResultsPage from './pages/ResultsPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SolutionsReview from './pages/SolutionsReview';
import Resources from './pages/Resources';
import Settings from './pages/Settings';
import TestSelection from './pages/TestSelection';
import SessionAnalysis from './pages/SessionAnalysis';
import AdminDashboard from './pages/AdminDashboard';
import AdminTests from './pages/AdminTests';
import AdminUsers from './pages/AdminUsers';
import AdminResults from './pages/AdminResults';
import AdminResources from './pages/AdminResources';
import AdminApprovals from './pages/AdminApprovals';
import PendingApproval from './pages/PendingApproval';
import Pricing from './pages/Pricing';
import AdminSubscriptions from './pages/AdminSubscriptions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import ContactUs from './pages/ContactUs';
import About from './pages/About';


const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, user, isApproved, approvalStatus } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" />;

  // If user is an admin, never show the student approval screen.
  if (user?.role === 'admin') return children;

  if (isApproved) return children;
  return <Navigate to="/pending-approval" state={{ approvalStatus }} />;
};



const AdminRoute = ({ children }) => {
  const { isLoggedIn, user } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" />;
  return user?.role === 'admin' ? children : <Navigate to="/dashboard" />;
};



function App() {
  const { loading } = useAuth();

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <Router>
      <Layout>
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/about" element={<About />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/test" element={
              <ProtectedRoute><TestSelection /></ProtectedRoute>
            } />
            <Route path="/test/:testId" element={
              <ProtectedRoute><TestInterface /></ProtectedRoute>
            } />
            <Route path="/results" element={
              <ProtectedRoute><ResultsPage /></ProtectedRoute>
            } />
            <Route path="/analysis/:resultId" element={
              <ProtectedRoute><SessionAnalysis /></ProtectedRoute>
            } />
            <Route path="/solutions-review/:resultId?" element={
              <ProtectedRoute><SolutionsReview /></ProtectedRoute>
            } />
            <Route path="/resources" element={
              <ProtectedRoute><Resources /></ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute><Settings /></ProtectedRoute>
            } />
            <Route path="/pending-approval" element={<PendingApproval />} />


            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <AdminRoute><AdminDashboard /></AdminRoute>
            } />
            <Route path="/admin/tests" element={
              <AdminRoute><AdminTests /></AdminRoute>
            } />
            <Route path="/admin/users" element={
              <AdminRoute><AdminUsers /></AdminRoute>
            } />
            <Route path="/admin/results" element={
              <AdminRoute><AdminResults /></AdminRoute>
            } />
            <Route path="/admin/resources" element={
              <AdminRoute><AdminResources /></AdminRoute>
            } />
            <Route path="/admin/approvals/pending" element={
              <AdminRoute><AdminApprovals /></AdminRoute>
            } />
            <Route path="/admin/subscriptions" element={
              <AdminRoute><AdminSubscriptions /></AdminRoute>
            } />
          </Routes>

        </Layout>
      </Router>
  );
}

function Root() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default Root;
