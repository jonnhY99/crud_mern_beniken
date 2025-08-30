// Basic test to verify Jest setup
describe('Basic Tests', () => {
  test('should pass basic arithmetic', () => {
    expect(2 + 2).toBe(4);
  });

  test('should handle promises', async () => {
    const result = await Promise.resolve('success');
    expect(result).toBe('success');
  });

  test('should work with objects', () => {
    const obj = { name: 'test', value: 123 };
    expect(obj).toHaveProperty('name', 'test');
    expect(obj.value).toBe(123);
  });
});