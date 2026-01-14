import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import LandingPage from './components/pages/LandingPage';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import Dashboard from './components/pages/Dashboard';
import VerificationCodePage from './components/auth/VerificationCodePage';
import PrivacyPolicy from './components/legal/PrivacyPolicy';
import TermsConditions from './components/legal/TermsConditions';
import SupportPage from './components/support/SupportPage';
import PaymentGateway from './components/pages/PaymentGateway';
import AdminDashboard from './components/pages/AdminDashboard';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <Router>
      {/* Componente para mostrar las notificaciones bonitas */}
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerificationCodePage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsConditions />} />
        <Route path="/support" element={<SupportPage />} />

        {/* Rutas Privadas (Dashboard Usuario) */}
        {/* Usamos ProtectedRoute sin requireAdmin */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/payment" element={
          <ProtectedRoute>
            <PaymentGateway />
          </ProtectedRoute>
        } />

        {/* Rutas protegidas de ADMINISTRADOR */}
        {/* Aquí pasamos la prop requireAdmin={true} */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;