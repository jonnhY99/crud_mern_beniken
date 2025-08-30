import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, mockApiResponse } from '../../utils/testUtils';
import AdminReports from '../AdminReports';
import * as api from '../../utils/api';

jest.mock('../../utils/api');
const mockedApi = api;

describe('AdminReports', () => {
  const mockDashboardData = {
    totalRevenue: 150000,
    totalOrders: 45,
    pendingOrders: 8,
    completedOrders: 37,
    averageOrderValue: 3333,
    revenueGrowth: 12.5,
    alerts: {
      lowStockProducts: [
        { name: 'Lomo Liso', stock: 2 },
        { name: 'Asado de Tira', stock: 1 }
      ]
    },
    revenueData: [
      { date: '2024-01-01', revenue: 5000 },
      { date: '2024-01-02', revenue: 7500 }
    ],
    orderStatusData: [
      { name: 'Completadas', value: 37 },
      { name: 'Pendientes', value: 8 }
    ],
    topProducts: [
      { name: 'Lomo Liso', sales: 25 },
      { name: 'Asado de Tira', sales: 20 }
    ],
    paymentMethods: [
      { name: 'Efectivo', value: 60 },
      { name: 'Transferencia', value: 40 }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedApi.getDashboardData.mockResolvedValue(
      mockApiResponse(mockDashboardData)
    );
    mockedApi.getStockInventory.mockResolvedValue(
      mockApiResponse([
        { name: 'Lomo Liso', stock: 2, price: 8000, status: 'Bajo' },
        { name: 'Asado de Tira', stock: 15, price: 6000, status: 'Medio' }
      ])
    );
  });

  it('renders dashboard title', async () => {
    renderWithProviders(<AdminReports />);
    
    expect(screen.getByText(/dashboard de reportes/i)).toBeInTheDocument();
  });

  it('displays basic KPI cards', async () => {
    renderWithProviders(<AdminReports />);
    
    // Check for KPI card labels (these should always be present)
    expect(screen.getByText(/total pedidos/i)).toBeInTheDocument();
    expect(screen.getByText(/ingresos totales/i)).toBeInTheDocument();
    expect(screen.getByText(/ticket promedio/i)).toBeInTheDocument();
    expect(screen.getByText(/stock bajo/i)).toBeInTheDocument();
  });

  it('shows export buttons', async () => {
    renderWithProviders(<AdminReports />);
    
    // Look for button text that's actually in the component
    expect(screen.getByText('📄')).toBeInTheDocument(); // PDF button
    expect(screen.getByText('📊')).toBeInTheDocument(); // Excel button
    expect(screen.getByText('📋')).toBeInTheDocument(); // CSV button
  });

  it('displays chart containers', async () => {
    renderWithProviders(<AdminReports />);
    
    // Check for chart titles that should be present
    expect(screen.getByText(/tendencia de ingresos/i)).toBeInTheDocument();
    expect(screen.getByText(/distribución por estado/i)).toBeInTheDocument();
    expect(screen.getByText(/productos más vendidos/i)).toBeInTheDocument();
    expect(screen.getByText(/métodos de pago/i)).toBeInTheDocument();
  });

  it('has date range inputs', async () => {
    renderWithProviders(<AdminReports />);
    
    expect(screen.getByText(/desde:/i)).toBeInTheDocument();
    expect(screen.getByText(/hasta:/i)).toBeInTheDocument();
    
    // Check for date inputs
    const dateInputs = screen.getAllByDisplayValue('');
    expect(dateInputs.length).toBeGreaterThanOrEqual(2);
  });

  it('renders without crashing', () => {
    renderWithProviders(<AdminReports />);
    
    // Basic smoke test - component renders without throwing
    expect(screen.getByText(/dashboard de reportes/i)).toBeInTheDocument();
  });
});
