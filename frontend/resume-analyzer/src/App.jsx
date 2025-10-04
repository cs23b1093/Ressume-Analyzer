import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login.jsx';
import SignUp from './pages/sign-in.jsx'

// Placeholder components - replace with actual components later
const Register = () => <div className="p-6 text-center">Register Page Coming Soon</div>;
const Dashboard = () => <div className="p-6 text-center">Dashboard Page Coming Soon</div>;

function useAuth() {
  // Simple demo auth - you can replace this with real authentication logic
  return { isAuthenticated: false };
}

export default function App() {
  const auth = useAuth();

  // Add debugging to see what's happening
  console.log('App rendering, auth.isAuthenticated:', auth.isAuthenticated);

  return (
    <div className='min-h-screen w-full bg-gray-50' style={{ minHeight: '100vh', width: '100%' }}>
      <Routes>
        <Route 
          path='/' 
          element={
            auth.isAuthenticated ? 
              <Navigate to='/dashboard' replace/> : 
              <Navigate to='/login' replace/>
          }
        />
        <Route path='/login' element={<Login/>}/>
        <Route path='/register' element={<SignUp />}/>
        <Route path='/dashboard' element={<Dashboard/>}/>
        <Route path="*" element={<div className="p-6 min-h-screen flex items-center justify-center">404 — Not found</div>} />
      </Routes>
    </div>
  )
}