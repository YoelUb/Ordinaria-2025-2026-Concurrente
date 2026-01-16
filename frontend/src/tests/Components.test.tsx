import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LandingPage from '../components/pages/LandingPage';
import LoginPage from '../components/auth/LoginPage';
import RegisterPage from '../components/auth/RegisterPage';
import PasswordResetPage from '../components/auth/PasswordResetPage';
import SupportPage from '../components/support/SupportPage';
import PrivacyPolicy from '../components/legal/PrivacyPolicy';
import TermsConditions from '../components/legal/TermsConditions';

// --- MOCKS ---
globalThis.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
    text: () => Promise.resolve("OK"),
  })
) as any;

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const renderWithRouter = (component: any) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Frontend Unit Tests', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // 1. Landing Page
    it('1. LandingPage renders main title and CTA button', () => {
        renderWithRouter(<LandingPage />);
        expect(screen.getByText(/Elegancia/i)).toBeInTheDocument();
        expect(screen.getByText(/Simplicidad/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Comenzar ahora/i })).toBeInTheDocument();
    });

    // 2. Login Page
    it('2. LoginPage renders email input and submit button', () => {
        renderWithRouter(<LoginPage />);
        expect(screen.getByPlaceholderText(/tu@email.com/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Acceder/i })).toBeInTheDocument();
    });

    // 3. Login Interaction
    it('3. LoginPage allows typing in inputs', () => {
        renderWithRouter(<LoginPage />);
        const emailInput = screen.getByPlaceholderText(/tu@email.com/i) as HTMLInputElement;
        fireEvent.change(emailInput, { target: { value: 'test@user.com' } });
        expect(emailInput.value).toBe('test@user.com');
    });

    // 4. Register Page
    it('4. RegisterPage renders all required fields', () => {
        renderWithRouter(<RegisterPage />);
        expect(screen.getByPlaceholderText(/Juan Pérez/i)).toBeInTheDocument();
        expect(screen.getByText(/Correo electrónico/i)).toBeInTheDocument();
    });

    // 5. Password Reset
    it('5. PasswordResetPage renders correct title and email input', () => {
        renderWithRouter(<PasswordResetPage />);
        expect(screen.getByText(/Recuperar/i)).toBeInTheDocument();
        expect(screen.getByText(/Acceso/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/nombre@ejemplo.com/i)).toBeInTheDocument();
    });

   // 6. Support Page (CORREGIDO: Selector específico para el encabezado)
    it('6. SupportPage renders contact form', () => {
        renderWithRouter(<SupportPage />);

        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toHaveTextContent(/Centro de/i);
        expect(heading).toHaveTextContent(/Soporte/i);

        expect(screen.getByPlaceholderText(/¿En qué podemos ayudarte?/i)).toBeInTheDocument();
    });

    // 7. Privacy Policy (CORREGIDO: Selector más robusto)
    it('7. PrivacyPolicy renders main heading correctly', () => {
        renderWithRouter(<PrivacyPolicy />);
        // Usamos getAllByText y verificamos que al menos uno existe, o buscamos por Role heading
        // Tu componente tiene el texto partido en dos líneas dentro del H1.

        // Estrategia: Buscar el H1 que contiene el texto "Política de"
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toHaveTextContent(/Política de/i);
        expect(heading).toHaveTextContent(/Privacidad/i);
    });

    // 8. Terms Conditions (CORREGIDO: Selector más robusto)
    it('8. TermsConditions renders main heading correctly', () => {
        renderWithRouter(<TermsConditions />);

        // Estrategia: Buscar el H1 que contiene "Términos y"
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toHaveTextContent(/Términos y/i);
        expect(heading).toHaveTextContent(/Condiciones/i);
    });

    // 9. Navigation Action
    it('9. Clicking "Acceder" on LandingPage triggers navigation', () => {
        renderWithRouter(<LandingPage />);
        const accessButtons = screen.getAllByText(/Acceder/i);
        // Filtramos para encontrar el que es un botón interactivo si hay varios
        const navButton = accessButtons[0];
        fireEvent.click(navButton);
        expect(mockNavigate).toHaveBeenCalled();
    });

    // 10. Sanity Check
    it('10. Basic Vitest Check', () => {
         expect(true).toBe(true);
    });
});