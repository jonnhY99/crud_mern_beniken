import { screen } from '@testing-library/react';
import { render } from '@testing-library/react';

// Very simple tests that should always pass
describe('Simple Working Tests', () => {
  it('can render a basic div', () => {
    render(<div>Test Content</div>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('can find elements by text', () => {
    render(<p>Hello World</p>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('can find elements by role', () => {
    render(<button>Click Me</button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('can check element attributes', () => {
    render(<input type="text" placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('can verify element presence', () => {
    render(
      <div>
        <h1>Title</h1>
        <p>Description</p>
      </div>
    );
    expect(screen.getByRole('heading')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('can test basic DOM structure', () => {
    render(
      <nav>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      </nav>
    );
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });
});