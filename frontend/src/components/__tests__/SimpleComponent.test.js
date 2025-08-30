import { render, screen } from '@testing-library/react';

// Simple component for testing
const SimpleComponent = () => {
  return (
    <div>
      <h1>Test Component</h1>
      <p>This is a simple test component</p>
    </div>
  );
};

describe('SimpleComponent', () => {
  it('renders without crashing', () => {
    render(<SimpleComponent />);
    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });

  it('displays the correct text', () => {
    render(<SimpleComponent />);
    expect(screen.getByText('This is a simple test component')).toBeInTheDocument();
  });
});