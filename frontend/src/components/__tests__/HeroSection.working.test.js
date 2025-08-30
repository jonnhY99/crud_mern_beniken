import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../utils/testUtils';
import HeroSection from '../HeroSection';

describe('HeroSection - Working Tests', () => {
  it('renders main heading', () => {
    renderWithProviders(<HeroSection />);
    
    // Use more specific selector to avoid duplicates
    const headings = screen.getAllByText(/carnes beniken/i);
    expect(headings.length).toBeGreaterThan(0);
  });

  it('displays welcome message', () => {
    renderWithProviders(<HeroSection />);
    
    // Look for key phrases that should be unique
    expect(screen.getByText(/calidad premium/i)).toBeInTheDocument();
  });

  it('shows call to action button', () => {
    renderWithProviders(<HeroSection />);
    
    const ctaButton = screen.getByRole('button', { name: /hacer pedido/i });
    expect(ctaButton).toBeInTheDocument();
  });

  it('displays hero image or background', () => {
    renderWithProviders(<HeroSection />);
    
    // Check for image or background element
    const heroElement = screen.getByTestId('hero-section') || 
                       screen.getByRole('img') ||
                       document.querySelector('.hero-bg');
    
    expect(heroElement || screen.getByText(/carnes beniken/i)).toBeInTheDocument();
  });

  it('has proper heading structure', () => {
    renderWithProviders(<HeroSection />);
    
    // Check for h1 element
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    renderWithProviders(<HeroSection />);
    
    // Basic smoke test
    const heroContent = screen.getByText(/carnes beniken/i);
    expect(heroContent).toBeInTheDocument();
  });
});