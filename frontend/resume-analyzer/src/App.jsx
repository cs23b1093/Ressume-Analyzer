import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login.jsx';
import SignUp from './pages/sign-in.jsx'
import NavBar from './pages/nav-bar.jsx';
import Dashboard from './pages/dashboard.jsx';
import useAuth from './utils/user.details.js';
import UserProfile from './pages/user.profile.jsx';
import Pricing from './pages/pricing.jsx';
import About from './pages/about.jsx';
import ChatWithPdf from './pages/chat-with-pdf.jsx';
import Jobs from './pages/jobs.jsx';
import ATSDashboard from './pages/ats_dashboard.jsx';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Layout component for pages with navbar
const LayoutWithNavbar = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

// Layout component for auth pages (login/register) without navbar
const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
};

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen w-full bg-gray-50'>
      <Routes>
        <Route 
          path='/' 
          element={
            isAuthenticated ? 
              <Navigate to='/dashboard' replace/> : 
              <Navigate to='/login' replace/>
          }
        />
        <Route path='/login' element={<AuthLayout><Login/></AuthLayout>}/>
        <Route path='/register' element={<AuthLayout><SignUp /></AuthLayout>}/>
        <Route 
          path='/dashboard' 
          element={
            <ProtectedRoute>
              <LayoutWithNavbar>
                <Dashboard/>
              </LayoutWithNavbar>
            </ProtectedRoute>
          }
        />
        <Route path='/profile' element={<ProtectedRoute><UserProfile/></ProtectedRoute>}/>
        <Route path='/pricing' element={<Pricing/>}/>
        <Route path='/about' element={<About/>}/>
        <Route path='/chat' element={<ChatWithPdf/>}/>
        <Route path='/job' element={<Jobs/>}/>
        <Route path='/ats' element={<ATSDashboard/>}/>
        <Route path="*" element={<div className="p-6 min-h-screen flex items-center justify-center">404 — Not found</div>} />
      </Routes>
    </div>
  )
}