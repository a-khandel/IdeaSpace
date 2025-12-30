import './index.css'
import React from "react"
import ReactDOM from "react-dom/client"
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom"
import "./index.css"

import Welcome from "./Welcome"
import SignIn from "./SignIn"
import Dashboard from "./Dashboard"
import App from "./App"

// ✅ IMPORTANT: this must exist in your project (you already have useAuth() in SignIn.tsx)
import { AuthProvider, useAuth } from "./auth"

// --- Route Guard ---
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { session, loading } = useAuth()
  const location = useLocation()

  // optional: show a tiny loader while Supabase session initializes
  if (loading) {
    return <div style={{ padding: 20 }}>Loading…</div>
  }

  if (!session) {
    return (
      <Navigate
        to="/signin"
        replace
        state={{ from: location.pathname + location.search }}
      />
    )
  }

  return children
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Welcome />} />
          <Route path="/signin" element={<SignIn />} />

          {/* Protected */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/:canvasId"
            element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
)
