import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import LandingPage from './pages/LandingPage'
import GuestLevelSelect from './pages/GuestLevelSelect'
import OrderPage from './pages/OrderPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import StudentDashboard from './pages/StudentDashboard'
import ExercisePage from './pages/ExercisePage'
import FinalRoundPage from './pages/FinalRoundPage'
import DifficultWordsPage from './pages/DifficultWordsPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import TeacherDashboard from './pages/TeacherDashboard'
import AdminDashboard from './pages/AdminDashboard'
import PrivacyPage from './pages/PrivacyPage'
import ArticlePage from './pages/ArticlePage'
import GDPRNotification from './components/common/GDPRNotification'
import Footer from './components/common/Footer'
import { getToken, getUser } from './utils/auth'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    const token = getToken()
    const savedUser = getUser()

    if (token && savedUser) {
      setUser(savedUser)
    }

    setLoading(false)
  }, [])

  const PrivateRoute = ({ children, allowedRoles }) => {
    if (loading) {
      return <div className="loading">Laden...</div>
    }

    if (!user) {
      // For student dashboard, allow access without login
      if (allowedRoles && allowedRoles.includes('student')) {
        return children
      }
      return <Navigate to="/" />
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/" />
    }

    return children
  }

  if (loading) {
    return <div className="loading">Laden...</div>
  }

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage setUser={setUser} />} />
        <Route path="/register" element={<RegisterPage setUser={setUser} />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/guest-level-select" element={<GuestLevelSelect />} />
        <Route path="/bestellen" element={<OrderPage />} />
        <Route path="/methodologie" element={<ArticlePage />} />

        {/* Landing page or redirect to dashboard based on login status */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/dashboard" />
            ) : sessionStorage.getItem('userType') === 'guest' ? (
              <Navigate to="/dashboard" />
            ) : (
              <LandingPage />
            )
          }
        />

        {/* Dashboard route - redirects based on user type */}
        <Route
          path="/dashboard"
          element={
            user?.role === 'teacher' ? (
              <PrivateRoute>
                <TeacherDashboard user={user} />
              </PrivateRoute>
            ) : user?.role === 'admin' ? (
              <PrivateRoute>
                <AdminDashboard user={user} />
              </PrivateRoute>
            ) : (
              <StudentDashboard user={user} setUser={setUser} />
            )
          }
        />

        <Route
          path="/exercise/:moduleId"
          element={<ExercisePage user={user} />}
        />

        <Route
          path="/final-round/:moduleId"
          element={<FinalRoundPage user={user} />}
        />

        <Route
          path="/difficult-words"
          element={
            <PrivateRoute allowedRoles={['student']}>
              <DifficultWordsPage user={user} />
            </PrivateRoute>
          }
        />

        <Route
          path="/teacher/*"
          element={
            <PrivateRoute allowedRoles={['teacher']}>
              <TeacherDashboard user={user} />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/*"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminDashboard user={user} />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <GDPRNotification />

      {/* Don't show footer on exercise pages */}
      {!location.pathname.startsWith('/exercise') &&
       !location.pathname.startsWith('/final-round') &&
       !location.pathname.startsWith('/difficult-words') &&
       <Footer />}
    </>
  )
}

export default App
