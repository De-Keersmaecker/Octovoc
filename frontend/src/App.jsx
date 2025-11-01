import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useState, useEffect, lazy, Suspense } from 'react'
import { getToken, getUser } from './utils/auth'

// Eager load critical components for initial render
import LandingPage from './pages/LandingPage'
import GDPRNotification from './components/common/GDPRNotification'

// Lazy load all other pages for code splitting
const GuestLevelSelect = lazy(() => import('./pages/GuestLevelSelect'))
const OrderPage = lazy(() => import('./pages/OrderPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'))
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'))
const ExercisePage = lazy(() => import('./pages/ExercisePage'))
const FinalRoundPage = lazy(() => import('./pages/FinalRoundPage'))
const DifficultWordsPage = lazy(() => import('./pages/DifficultWordsPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const ArticlePage = lazy(() => import('./pages/ArticlePage'))

// Loading component for Suspense fallback
const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#000',
    color: '#fff',
    fontFamily: '"Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif',
    fontSize: 'clamp(14px, 1.2vw, 16px)',
    letterSpacing: '0.02em'
  }}>
    laden...
  </div>
)

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
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage setUser={setUser} />} />
          <Route path="/register" element={<RegisterPage setUser={setUser} />} />
          <Route path="/verify-email" element={<VerifyEmailPage setUser={setUser} />} />
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
      </Suspense>

      <GDPRNotification />
    </>
  )
}

export default App
