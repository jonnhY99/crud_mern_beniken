# 🧪 Guía Completa de Testing - Beniken Pedidos

## 📋 Resumen del Sistema de Pruebas

Este proyecto implementa un sistema completo de testing con tres niveles:

- **Pruebas Unitarias**: Funciones y componentes individuales
- **Pruebas de Integración**: APIs y flujos completos
- **Pruebas E2E**: Experiencia completa del usuario

## 🛠️ Stack de Testing

### Backend
- **Jest**: Framework de testing
- **Supertest**: Testing de APIs HTTP
- **MongoDB Memory Server**: Base de datos en memoria para tests

### Frontend
- **Jest**: Framework de testing
- **React Testing Library**: Testing de componentes React
- **@testing-library/jest-dom**: Matchers adicionales

### E2E
- **Playwright**: Testing end-to-end cross-browser

## 🚀 Instalación

```bash
# Instalar todas las dependencias
npm run install:all

# Instalar dependencias de testing específicas
cd backend && npm install jest supertest mongodb-memory-server --save-dev
cd frontend && npm install @testing-library/react @testing-library/jest-dom @testing-library/user-event --save-dev
npm install @playwright/test --save-dev
```

## 📝 Comandos de Testing

### Backend
```bash
cd backend

# Ejecutar todas las pruebas
npm test

# Ejecutar en modo watch
npm run test:watch

# Generar reporte de cobertura
npm run test:coverage

# Solo pruebas de integración
npm run test:integration
```

### Frontend
```bash
cd frontend

# Ejecutar todas las pruebas
npm test

# Ejecutar con cobertura
npm test -- --coverage --watchAll=false
```

### E2E
```bash
# Ejecutar pruebas E2E
npm run test:e2e

# Ejecutar en modo UI
npx playwright test --ui

# Generar reporte
npx playwright show-report
```

### Todas las Pruebas
```bash
# Ejecutar todo el suite de pruebas
npm run test:all

# Solo cobertura
npm run test:coverage
```

## 📁 Estructura de Archivos

```
backend/
├── tests/
│   ├── setup.js                    # Configuración global
│   ├── controllers/
│   │   ├── userController.test.js  # Tests de usuarios
│   │   └── orderController.test.js # Tests de pedidos
│   └── integration/
│       └── api.test.js             # Tests de integración
├── jest.config.js                  # Configuración Jest

frontend/
├── src/
│   ├── setupTests.js               # Configuración global
│   ├── utils/
│   │   └── testUtils.js            # Utilidades de testing
│   └── components/
│       └── __tests__/
│           ├── CustomerForm.test.js
│           ├── HeroSection.test.js
│           └── AdminReports.test.js

tests/
└── e2e/
    └── order-flow.spec.js          # Tests end-to-end

playwright.config.js                # Configuración Playwright
```

## 🎯 Tipos de Pruebas Implementadas

### 1. Pruebas Unitarias Backend

**userController.test.js**
- ✅ Registro de usuarios
- ✅ Login con credenciales válidas/inválidas
- ✅ Detección de clientes frecuentes
- ✅ Validación de campos requeridos

**orderController.test.js**
- ✅ Creación de pedidos
- ✅ Actualización de estados
- ✅ Consulta de pedidos
- ✅ Validaciones de datos

### 2. Pruebas de Integración

**api.test.js**
- ✅ Flujo completo de pedidos
- ✅ Autenticación de usuarios
- ✅ CRUD de productos
- ✅ Analytics y reportes

### 3. Pruebas Unitarias Frontend

**CustomerForm.test.js**
- ✅ Renderizado de campos
- ✅ Validación de formularios
- ✅ Detección de clientes frecuentes
- ✅ Manejo de errores

**HeroSection.test.js**
- ✅ Contenido principal
- ✅ Botones de navegación
- ✅ Indicadores de calidad
- ✅ Responsividad

**AdminReports.test.js**
- ✅ Métricas del dashboard
- ✅ Exportación de reportes
- ✅ Modal de inventario
- ✅ Estados de carga

### 4. Pruebas E2E

**order-flow.spec.js**
- ✅ Flujo completo de pedido
- ✅ Validación de formularios
- ✅ Dashboard administrativo
- ✅ Panel del carnicero
- ✅ Responsividad móvil

## 🔧 Configuración Avanzada

### Variables de Entorno para Testing

```bash
# backend/.env.test
NODE_ENV=test
JWT_SECRET=test_secret_key
MONGODB_URI=mongodb://localhost:27017/beniken_test
```

### Configuración Jest Backend

```javascript
// jest.config.js
export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    'routes/**/*.js',
    'middleware/**/*.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Configuración Playwright

```javascript
// playwright.config.js
export default defineConfig({
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } }
  ]
});
```

## 📊 Métricas de Cobertura

### Objetivos de Cobertura
- **Líneas**: 80%
- **Funciones**: 80%
- **Ramas**: 80%
- **Declaraciones**: 80%

### Componentes Críticos (90%+ cobertura)
- Controladores de autenticación
- Lógica de pedidos
- Cálculos de precios
- Validaciones de formularios

## 🚨 Mejores Prácticas

### 1. Naming Conventions
```javascript
// ✅ Bueno
describe('UserController', () => {
  it('should register user with valid data', () => {});
  it('should reject invalid email format', () => {});
});

// ❌ Malo
describe('Tests', () => {
  it('test1', () => {});
});
```

### 2. Arrange-Act-Assert Pattern
```javascript
it('should create order successfully', async () => {
  // Arrange
  const orderData = testUtils.createTestOrder();
  
  // Act
  const response = await request(app)
    .post('/api/orders')
    .send(orderData);
  
  // Assert
  expect(response.status).toBe(201);
  expect(response.body.success).toBe(true);
});
```

### 3. Mock Management
```javascript
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});
```

### 4. Test Data Isolation
```javascript
// Usar factories para datos de prueba
const mockUser = (overrides = {}) => ({
  name: 'Test User',
  email: 'test@example.com',
  ...overrides
});
```

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm run install:all
      - run: npm run test:all
      - run: npm run test:coverage
```

## 🐛 Debugging Tests

### Backend
```bash
# Debug con Node Inspector
node --inspect-brk node_modules/.bin/jest --runInBand

# Logs detallados
DEBUG=* npm test
```

### Frontend
```bash
# Debug en navegador
npm test -- --debug
```

### E2E
```bash
# Modo headed (ver navegador)
npx playwright test --headed

# Debug mode
npx playwright test --debug
```

## 📈 Monitoreo y Reportes

### Cobertura HTML
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

### Reportes Playwright
```bash
npx playwright show-report
```

### Métricas de Performance
- Tiempo de ejecución de tests
- Cobertura de código
- Tests fallidos/exitosos
- Performance de APIs

## 🔧 Troubleshooting

### Problemas Comunes

**1. MongoDB Memory Server no inicia**
```bash
npm install mongodb-memory-server --save-dev
```

**2. Tests de React fallan**
```bash
npm install @testing-library/jest-dom --save-dev
```

**3. Playwright no encuentra navegadores**
```bash
npx playwright install
```

**4. Timeouts en E2E**
```javascript
// Aumentar timeout
test.setTimeout(30000);
```

## 📚 Recursos Adicionales

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

## 🎯 Próximos Pasos

1. **Ejecutar instalación**: `npm run install:all`
2. **Ejecutar pruebas**: `npm run test:all`
3. **Revisar cobertura**: `npm run test:coverage`
4. **Configurar CI/CD**: Implementar en pipeline
5. **Monitorear métricas**: Establecer alertas de calidad
