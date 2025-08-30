import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../utils/testUtils';
import AdminReports from '../AdminReports';

describe('AdminReports - Working Tests', () => {
  it('renders the main dashboard title', () => {
    renderWithProviders(<AdminReports />);
    expect(screen.getByText(/dashboard de reportes/i)).toBeInTheDocument();
  });

  it('displays date range controls', () => {
    renderWithProviders(<AdminReports />);
    expect(screen.getByText(/desde:/i)).toBeInTheDocument();
    expect(screen.getByText(/hasta:/i)).toBeInTheDocument();
  });

  it('shows all export buttons', () => {
    renderWithProviders(<AdminReports />);
    
    // Check for emoji buttons (these are always visible)
    expect(screen.getByText('📄')).toBeInTheDocument(); // PDF
    expect(screen.getByText('📊')).toBeInTheDocument(); // Excel  
    expect(screen.getByText('📋')).toBeInTheDocument(); // CSV
  });

  it('has proper button labels for larger screens', () => {
    renderWithProviders(<AdminReports />);
    
    // These spans are always in the DOM, just hidden on small screens
    expect(screen.getByText('📄 PDF')).toBeInTheDocument();
    expect(screen.getByText('📊 Excel')).toBeInTheDocument();
    expect(screen.getByText('📋 CSV')).toBeInTheDocument();
  });

  it('displays create test data button when no data', () => {
    renderWithProviders(<AdminReports />);
    
    // This button appears when totalOrders === 0
    expect(screen.getByText(/crear datos de prueba/i)).toBeInTheDocument();
  });

  it('has date input fields', () => {
    renderWithProviders(<AdminReports />);
    
    // Check for date inputs
    const dateInputs = screen.getAllByDisplayValue('');
    expect(dateInputs.length).toBeGreaterThanOrEqual(2);
  });

  it('renders without crashing and shows basic structure', () => {
    renderWithProviders(<AdminReports />);
    
    // Verify the component renders the basic structure
    expect(screen.getByText(/dashboard de reportes/i)).toBeInTheDocument();
    expect(screen.getByText(/desde:/i)).toBeInTheDocument();
    expect(screen.getByText(/hasta:/i)).toBeInTheDocument();
    
    // Verify buttons are present
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});