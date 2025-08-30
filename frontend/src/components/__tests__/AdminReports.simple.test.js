import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../utils/testUtils';
import AdminReports from '../AdminReports';

// Mock fetch globally to intercept API calls
global.fetch = jest.fn();

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(() => 'mock-token'),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

beforeEach(() => {
  // Mock successful API response
  fetch.mockResolvedValue({
    ok: true,
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
        ],
        stockLevels: []
      },
      alerts: {
        lowStockProducts: [
          { name: 'Lomo Liso', stock: 2, minStock: 5 },
          { name: 'Asado de Tira', stock: 1, minStock: 3 }
        ]
      }
    })
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('AdminReports - Simple Tests', () => {
  it('renders the main title', () => {
    renderWithProviders(<AdminReports />);
    expect(screen.getByText(/dashboard de reportes/i)).toBeInTheDocument();
  });

  it('displays KPI card labels', async () => {
    renderWithProviders(<AdminReports />);
    
    // Wait for the component to load data and render KPI cards
    await waitFor(() => {
      expect(screen.getByText(/total pedidos/i)).toBeInTheDocument();
    });
    
    expect(screen.getByText(/ingresos totales/i)).toBeInTheDocument();
    expect(screen.getByText(/ticket promedio/i)).toBeInTheDocument();
    expect(screen.getByText(/stock bajo/i)).toBeInTheDocument();
  });

  it('shows date range controls', () => {
    renderWithProviders(<AdminReports />);
    
    expect(screen.getByText(/desde:/i)).toBeInTheDocument();
    expect(screen.getByText(/hasta:/i)).toBeInTheDocument();
  });

  it('displays chart section titles', async () => {
    renderWithProviders(<AdminReports />);
    
    // Wait for charts to load
    await waitFor(() => {
      expect(screen.getByText(/tendencia de ingresos/i)).toBeInTheDocument();
    });
    
    expect(screen.getByText(/distribución por estado/i)).toBeInTheDocument();
    expect(screen.getByText(/productos más vendidos/i)).toBeInTheDocument();
    expect(screen.getByText(/métodos de pago/i)).toBeInTheDocument();
  });

  it('has export buttons with emojis', () => {
    renderWithProviders(<AdminReports />);
    
    // Look for the emoji buttons
    expect(screen.getByText('📄')).toBeInTheDocument();
    expect(screen.getByText('📊')).toBeInTheDocument(); 
    expect(screen.getByText('📋')).toBeInTheDocument();
  });
});