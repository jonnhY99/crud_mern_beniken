import { screen, waitFor, act } from '@testing-library/react';
import { renderWithProviders } from '../../utils/testUtils';
import AdminReports from '../AdminReports';

// Mock environment variables
process.env.REACT_APP_API_URL = 'http://localhost:5000';

// Create a more robust fetch mock
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock localStorage with proper token
const mockLocalStorage = {
  getItem: jest.fn((key) => {
    if (key === 'authToken') return 'mock-auth-token-123';
    return null;
  }),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('AdminReports - Final Tests', () => {
  beforeEach(() => {
    // Reset all mocks
    mockFetch.mockClear();
    mockLocalStorage.getItem.mockClear();
    
    // Setup successful API response
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        summary: {
          totalOrders: 45,
          totalRevenue: 150000,
          totalPaidRevenue: 120000,
          avgOrderValue: 3333,
          pendingOrders: 8,
          lowStockCount: 2
        },
        charts: {
          statusDistribution: { completed: 37, pending: 8 },
          paymentMethods: { efectivo: 25, transferencia: 20 },
          dailyRevenue: [
            { date: '2024-01-01', revenue: 5000 },
            { date: '2024-01-02', revenue: 7500 }
          ],
          topProducts: [
            { name: 'Lomo Liso', quantity: 25, revenue: 50000 },
            { name: 'Asado de Tira', quantity: 20, revenue: 40000 }
          ]
        },
        alerts: {
          lowStockProducts: [
            { name: 'Lomo Liso', stock: 2, minStock: 5 }
          ]
        }
      })
    });
  });

  it('renders title immediately', () => {
    renderWithProviders(<AdminReports />);
    expect(screen.getByText(/dashboard de reportes/i)).toBeInTheDocument();
  });

  it('shows basic UI elements', () => {
    renderWithProviders(<AdminReports />);
    
    // Date controls
    expect(screen.getByText(/desde:/i)).toBeInTheDocument();
    expect(screen.getByText(/hasta:/i)).toBeInTheDocument();
    
    // Export buttons
    expect(screen.getByText('📄')).toBeInTheDocument();
    expect(screen.getByText('📊')).toBeInTheDocument();
    expect(screen.getByText('📋')).toBeInTheDocument();
  });

  it('loads and displays KPI cards after API call', async () => {
    await act(async () => {
      renderWithProviders(<AdminReports />);
    });
    
    // Wait for API call to complete and KPI cards to appear
    await waitFor(() => {
      expect(screen.getByText(/total pedidos/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    // Verify other KPI cards
    expect(screen.getByText(/ingresos totales/i)).toBeInTheDocument();
    expect(screen.getByText(/ticket promedio/i)).toBeInTheDocument();
    expect(screen.getByText(/stock bajo/i)).toBeInTheDocument();
  });

  it('loads and displays chart sections', async () => {
    await act(async () => {
      renderWithProviders(<AdminReports />);
    });
    
    // Wait for charts to load
    await waitFor(() => {
      expect(screen.getByText(/tendencia de ingresos/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    expect(screen.getByText(/distribución por estado/i)).toBeInTheDocument();
    expect(screen.getByText(/productos más vendidos/i)).toBeInTheDocument();
    expect(screen.getByText(/métodos de pago/i)).toBeInTheDocument();
  });

  it('makes API call with correct parameters', async () => {
    await act(async () => {
      renderWithProviders(<AdminReports />);
    });
    
    // Wait for API call
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    }, { timeout: 3000 });

    // Verify API call was made correctly
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/analytics/dashboard'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer mock-auth-token-123',
          'Content-Type': 'application/json'
        })
      })
    );
  });

  it('displays data values from successful API response', async () => {
    await act(async () => {
      renderWithProviders(<AdminReports />);
    });
    
    // Wait for data to load and check for specific values
    await waitFor(() => {
      // Look for the number 45 (totalOrders) anywhere in the document
      const elements = screen.getAllByText('45');
      expect(elements.length).toBeGreaterThan(0);
    }, { timeout: 5000 });
  });
});