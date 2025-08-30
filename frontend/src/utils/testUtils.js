import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';

// Custom render function with providers
export const renderWithProviders = (ui, options = {}) => {
  const { initialEntries = ['/'], ...renderOptions } = options;

  const Wrapper = ({ children }) => (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Mock data generators
export const mockUser = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439011',
  name: 'Test User',
  email: 'test@example.com',
  role: 'customer',
  isFrequent: false,
  ...overrides
});

export const mockProduct = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439012',
  name: 'Test Product',
  price: 5000,
  category: 'vacuno',
  stock: 10,
  description: 'Test product description',
  image: 'test-image.jpg',
  ...overrides
});

export const mockOrder = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439013',
  customerName: 'Test Customer',
  customerEmail: 'customer@test.com',
  customerPhone: '+56912345678',
  products: [
    {
      productId: '507f1f77bcf86cd799439012',
      name: 'Test Product',
      quantity: 2,
      price: 5000
    }
  ],
  totalAmount: 10000,
  status: 'pending',
  createdAt: new Date().toISOString(),
  ...overrides
});

// API response mocks
export const mockApiResponse = (data, success = true) => ({
  success,
  data,
  message: success ? 'Success' : 'Error occurred'
});

// Mock API functions that tests expect
export const mockApiMethods = {
  getDashboardData: jest.fn(),
  getStockInventory: jest.fn(),
  checkFrequentUser: jest.fn(),
  getUsers: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  getOrders: jest.fn(),
  createOrder: jest.fn(),
  updateOrderStatus: jest.fn(),
  deleteOrder: jest.fn()
};

// Event helpers
export const createMockEvent = (overrides = {}) => ({
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  target: { value: '' },
  ...overrides
});

// Async utilities
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0));
