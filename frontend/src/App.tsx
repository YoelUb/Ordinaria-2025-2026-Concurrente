import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/pages/LandingPage';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import VerificationCodePage from './components/auth/VerificationCodePage'; //
import PrivacyPolicy from './components/legal/PrivacyPolicy';
import TermsConditions from './components/legal/TermsConditions';
import SupportPage from './components/support/SupportPage';
import Dashboard from './components/pages/Dashboard';
import PaymentGateway from './components/pages/PaymentGateway';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerificationCodePage />} /> {/* <--- NUEVA RUTA */}

        {/* Rutas privadas/funcionales */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/payment" element={<PaymentGateway />} />

        {/* Legales */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsConditions />} />
        <Route path="/support" element={<SupportPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;