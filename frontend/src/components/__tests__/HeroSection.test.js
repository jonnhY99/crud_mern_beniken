import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../utils/testUtils';
import HeroSection from '../HeroSection';

describe('HeroSection', () => {
  it('renders main heading and content', () => {
    renderWithProviders(<HeroSection />);
    
    expect(screen.getByText(/carne fresca y de/i)).toBeInTheDocument();
    expect(screen.getAllByText(/calidad/i)[0]).toBeInTheDocument(); // Use getAllByText for multiple matches
    expect(screen.getByText(/franklin/i)).toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    renderWithProviders(<HeroSection />);
    
    expect(screen.getByRole('link', { name: /menú de productos/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contactar por whatsapp/i })).toBeInTheDocument();
  });

  it('displays quality indicators', () => {
    renderWithProviders(<HeroSection />);
    
    expect(screen.getByText(/siempre fresco/i)).toBeInTheDocument();
    expect(screen.getAllByText(/primera calidad/i)[0]).toBeInTheDocument(); // Use getAllByText for multiple matches
    expect(screen.getByText(/precios justos/i)).toBeInTheDocument();
  });

  it('renders logo with correct alt text', () => {
    renderWithProviders(<HeroSection />);
    
    const logo = screen.getByAltText(/carnes beniken logo/i);
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', 'image/logo_listo.png');
  });

  it('has responsive design classes', () => {
    renderWithProviders(<HeroSection />);
    
    // Use querySelector directly since the section doesn't have a proper role
    const section = document.querySelector('#inicio');
    expect(section).toHaveClass('min-h-screen');
  });
});
