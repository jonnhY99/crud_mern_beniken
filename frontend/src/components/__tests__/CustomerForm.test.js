import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, mockUser, mockApiResponse } from '../../utils/testUtils';
import CustomerForm from '../CustomerForm';
import * as api from '../../utils/api';

// Mock the API
jest.mock('../../utils/api');
const mockedApi = api;

describe('CustomerForm', () => {
  const mockOnSubmit = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderCustomerForm = (props = {}) => {
    return renderWithProviders(
      <CustomerForm onSubmit={mockOnSubmit} {...props} />
    );
  };

  it('renders all form fields', () => {
    renderCustomerForm();
    
    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dirección/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continuar/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderCustomerForm();
    
    const submitButton = screen.getByRole('button', { name: /continuar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/nombre es requerido/i)).toBeInTheDocument();
      expect(screen.getByText(/email es requerido/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    renderCustomerForm();
    
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    const submitButton = screen.getByRole('button', { name: /continuar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
    });
  });

  it('checks for frequent user when name and email are provided', async () => {
    const mockFrequentUser = mockUser({ isFrequent: true });
    mockedApi.checkFrequentUser.mockResolvedValue(
      mockApiResponse({ isFrequent: true, user: mockFrequentUser })
    );

    renderCustomerForm();
    
    const nameInput = screen.getByLabelText(/nombre completo/i);
    const emailInput = screen.getByLabelText(/email/i);
    
    fireEvent.change(nameInput, { target: { value: 'Frequent Customer' } });
    fireEvent.change(emailInput, { target: { value: 'frequent@test.com' } });

    await waitFor(() => {
      expect(mockedApi.checkFrequentUser).toHaveBeenCalledWith(
        'Frequent Customer',
        'frequent@test.com'
      );
    });

    expect(screen.getByText(/cliente frecuente/i)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    renderCustomerForm();
    
    const nameInput = screen.getByLabelText(/nombre completo/i);
    const emailInput = screen.getByLabelText(/email/i);
    const phoneInput = screen.getByLabelText(/teléfono/i);
    const addressInput = screen.getByLabelText(/dirección/i);
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(phoneInput, { target: { value: '+56912345678' } });
    fireEvent.change(addressInput, { target: { value: '123 Test Street' } });

    const submitButton = screen.getByRole('button', { name: /continuar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+56912345678',
        address: '123 Test Street'
      });
    });
  });

  it('displays loading state during frequent user check', async () => {
    mockedApi.checkFrequentUser.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    renderCustomerForm();
    
    const nameInput = screen.getByLabelText(/nombre completo/i);
    const emailInput = screen.getByLabelText(/email/i);
    
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    expect(screen.getByText(/verificando/i)).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    mockedApi.checkFrequentUser.mockRejectedValue(new Error('API Error'));

    renderCustomerForm();
    
    const nameInput = screen.getByLabelText(/nombre completo/i);
    const emailInput = screen.getByLabelText(/email/i);
    
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    await waitFor(() => {
      expect(screen.queryByText(/cliente frecuente/i)).not.toBeInTheDocument();
    });
  });
});
