import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../utils/testUtils';
import CustomerForm from '../CustomerForm';

// Mock the checkFrequentUser API call
global.fetch = jest.fn();

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

describe('CustomerForm - Working Tests', () => {
  beforeEach(() => {
    fetch.mockClear();
    // Mock successful API response for checkFrequentUser
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ isFrequent: false })
    });
  });

  it('renders form title', () => {
    renderWithProviders(<CustomerForm />);
    expect(screen.getByText(/información del cliente/i)).toBeInTheDocument();
  });

  it('displays all required form fields', () => {
    renderWithProviders(<CustomerForm />);
    
    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
  });

  it('shows validation messages for empty fields', async () => {
    renderWithProviders(<CustomerForm />);
    
    const submitButton = screen.getByRole('button', { name: /continuar/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/nombre es requerido/i)).toBeInTheDocument();
    });
  });

  it('accepts valid input in form fields', () => {
    renderWithProviders(<CustomerForm />);
    
    const nameInput = screen.getByLabelText(/nombre completo/i);
    const emailInput = screen.getByLabelText(/email/i);
    const phoneInput = screen.getByLabelText(/teléfono/i);
    
    fireEvent.change(nameInput, { target: { value: 'Juan Pérez' } });
    fireEvent.change(emailInput, { target: { value: 'juan@example.com' } });
    fireEvent.change(phoneInput, { target: { value: '+56912345678' } });
    
    expect(nameInput.value).toBe('Juan Pérez');
    expect(emailInput.value).toBe('juan@example.com');
    expect(phoneInput.value).toBe('+56912345678');
  });

  it('has continue button', () => {
    renderWithProviders(<CustomerForm />);
    expect(screen.getByRole('button', { name: /continuar/i })).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    renderWithProviders(<CustomerForm />);
    expect(screen.getByText(/información del cliente/i)).toBeInTheDocument();
  });
});