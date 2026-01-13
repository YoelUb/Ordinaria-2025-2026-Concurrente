import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/pages/LandingPage';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import PrivacyPolicy from './components/legal/PrivacyPolicy';
import TermsConditions from './components/legal/TermsConditions';
import SupportPage from './components/support/SupportPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsConditions />} />
        <Route path="/support" element={<SupportPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;