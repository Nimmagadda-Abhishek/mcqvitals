import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TestInterface = lazy(() => import('./pages/TestInterface'));
const ResultsPage = lazy(() => import('./pages/ResultsPage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const SolutionsReview = lazy(() => import('./pages/SolutionsReview'));
const Resources = lazy(() => import('./pages/Resources'));
const Settings = lazy(() => import('./pages/Settings'));
const TestSelection = lazy(() => import('./pages/TestSelection'));
const SessionAnalysis = lazy(() => import('./pages/SessionAnalysis'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminTests = lazy(() => import('./pages/AdminTests'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminResults = lazy(() => import('./pages/AdminResults'));
const AdminResources = lazy(() => import('./pages/AdminResources'));
const AdminApprovals = lazy(() => import('./pages/AdminApprovals'));
const PendingApproval = lazy(() => import('./pages/PendingApproval'));
const Pricing = lazy(() => import('./pages/Pricing'));
const AdminSubscriptions = lazy(() => import('./pages/AdminSubscriptions'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const About = lazy(() => import('./pages/About'));

const PageLoading = () => (
  <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <span className="spinner-small" aria-label="Loading page" />
  </div>
);


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
        <Suspense fallback={<PageLoading />}>
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
        </Suspense>

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
