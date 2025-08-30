import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';

// Simple test component
const TestComponent = () => {
  return (
    <div>
      <h1>Test Component Works</h1>
      <p>This is a basic test</p>
    </div>
  );
};

// Wrapper for providers
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

describe('Basic Render Test', () => {
  it('renders a simple component', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );
    
    expect(screen.getByText('Test Component Works')).toBeInTheDocument();
    expect(screen.getByText('This is a basic test')).toBeInTheDocument();
  });

  it('can find elements by role', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );
    
    expect(screen.getByRole('heading', { name: /test component works/i })).toBeInTheDocument();
  });

  it('basic DOM queries work', () => {
    render(
      <TestWrapper>
        <div data-testid="test-div">Test Content</div>
      </TestWrapper>
    );
    
    expect(screen.getByTestId('test-div')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});