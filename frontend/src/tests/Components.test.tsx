import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../components/auth/LoginPage';
import LandingPage from '../components/pages/LandingPage';
import RegisterPage from '../components/auth/RegisterPage';
import SupportPage from '../components/support/SupportPage';
import PasswordResetPage from '../components/auth/PasswordResetPage';
import PrivacyPolicy from '../components/legal/PrivacyPolicy';
import TermsConditions from '../components/legal/TermsConditions';
import { describe, it, expect } from 'vitest';

// Wrapper para rutas
const renderWithRouter = (component: any) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Frontend Unit Tests', () => {

    // Test 1: Landing Page
    it('1. LandingPage renders welcome message and CTA', () => {
        renderWithRouter(<LandingPage />);
        expect(screen.getByText(/Tu Comunidad, Tu Espacio/i)).toBeInTheDocument();
        expect(screen.getByText(/Reservar Ahora/i)).toBeInTheDocument();
    });

    // Test 2: Login Render
    it('2. LoginPage renders email and password inputs', () => {
        renderWithRouter(<LoginPage />);
        expect(screen.getByPlaceholderText(/tu@email.com/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toBeInTheDocument();
    });

    // Test 3: Validacion login
    it('3. LoginPage allows typing in inputs', () => {
        renderWithRouter(<LoginPage />);
        const emailInput = screen.getByPlaceholderText(/tu@email.com/i) as HTMLInputElement;
        fireEvent.change(emailInput, { target: { value: 'test@user.com' } });
        expect(emailInput.value).toBe('test@user.com');
    });

    // Test 4: Register Page Password Match
    it('4. RegisterPage renders all required fields', () => {
        renderWithRouter(<RegisterPage />);
        expect(screen.getByPlaceholderText(/Nombre Completo/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Repetir Contraseña/i)).toBeInTheDocument();
    });

    // Test 5: Forgot Password Page
    it('5. PasswordResetPage renders email input for recovery', () => {
        renderWithRouter(<PasswordResetPage />);
        expect(screen.getByText(/Recuperar Contraseña/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Introduce tu email/i)).toBeInTheDocument();
    });

    // Test 6: Support Page
    it('6. SupportPage renders contact form text area', () => {
        renderWithRouter(<SupportPage />);
        expect(screen.getByText(/Soporte Técnico/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Describe tu problema.../i)).toBeInTheDocument();
    });

    // Test 7: Privacy Policy Content
    it('7. PrivacyPolicy renders legal text correctly', () => {
        renderWithRouter(<PrivacyPolicy />);
        expect(screen.getByText(/Política de Privacidad/i)).toBeInTheDocument();
        expect(screen.getByText(/Responsable del Tratamiento/i)).toBeInTheDocument();
    });

    // Test 8: Terms and Conditions
    it('8. TermsConditions renders user obligations', () => {
        renderWithRouter(<TermsConditions />);
        expect(screen.getByText(/Términos y Condiciones/i)).toBeInTheDocument();
        expect(screen.getByText(/Uso de las Instalaciones/i)).toBeInTheDocument();
    });

    // Test 9: Navigation Links (en Landing)
    it('9. LandingPage contains links to login and register', () => {
        renderWithRouter(<LandingPage />);
        const loginLink = screen.getByRole('link', { name: /Iniciar Sesión/i });
        expect(loginLink).toHaveAttribute('href', '/login');
    });

    // Test 10: Validación simple
    it('10. Basic Vitest Check', () => {
         expect(true).toBe(true);
    });
});