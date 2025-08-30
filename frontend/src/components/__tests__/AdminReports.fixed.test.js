import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../utils/testUtils';
import AdminReports from '../AdminReports';

// Mock fetch to return successful data
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
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
  })
);

// Mock localStorage to provide token
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(() => 'mock-auth-token'),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

describe('AdminReports - Fixed Tests', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders title immediately', () => {
    renderWithProviders(<AdminReports />);
    expect(screen.getByText(/dashboard de reportes/i)).toBeInTheDocument();
  });

  it('shows date controls immediately', () => {
    renderWithProviders(<AdminReports />);
    expect(screen.getByText(/desde:/i)).toBeInTheDocument();
    expect(screen.getByText(/hasta:/i)).toBeInTheDocument();
  });

  it('shows export buttons immediately', () => {
    renderWithProviders(<AdminReports />);
    expect(screen.getByText('📄')).toBeInTheDocument();
    expect(screen.getByText('📊')).toBeInTheDocument();
    expect(screen.getByText('📋')).toBeInTheDocument();
  });

  it('loads and displays KPI cards', async () => {
    renderWithProviders(<AdminReports />);
    
    // Wait for API call to complete and data to load
    await waitFor(() => {
      expect(screen.getByText(/total pedidos/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Check other KPI cards are present
    expect(screen.getByText(/ingresos totales/i)).toBeInTheDocument();
    expect(screen.getByText(/ticket promedio/i)).toBeInTheDocument();
    expect(screen.getByText(/stock bajo/i)).toBeInTheDocument();
  });

  it('loads and displays chart titles', async () => {
    renderWithProviders(<AdminReports />);
    
    // Wait for charts to be rendered
    await waitFor(() => {
      expect(screen.getByText(/tendencia de ingresos/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText(/distribución por estado/i)).toBeInTheDocument();
    expect(screen.getByText(/productos más vendidos/i)).toBeInTheDocument();
    expect(screen.getByText(/métodos de pago/i)).toBeInTheDocument();
  });

  it('displays data values from API', async () => {
    renderWithProviders(<AdminReports />);
    
    // Wait for data to load and check specific values
    await waitFor(() => {
      expect(screen.getByText('45')).toBeInTheDocument(); // totalOrders
    }, { timeout: 3000 });
  });
});