# 🚀 Quick Start - Sistema de Testing Beniken

## **Instalación Rápida**

```bash
# 1. Instalar todas las dependencias
npm run install:all

# 2. Instalar dependencias de testing
cd backend
npm install jest supertest mongodb-memory-server --save-dev

cd ../frontend  
npm install @testing-library/react @testing-library/jest-dom @testing-library/user-event --save-dev

cd ..
npm install @playwright/test --save-dev

# 3. Instalar navegadores para Playwright
npx playwright install
```

## **Ejecutar Pruebas**

### Backend (Jest + Supertest)
```bash
cd backend
npm test                    # Ejecutar todas las pruebas
npm run test:coverage       # Con reporte de cobertura
npm run test:watch          # Modo watch
```

### Frontend (React Testing Library)
```bash
cd frontend
npm test                    # Ejecutar pruebas React
npm test -- --coverage     # Con cobertura
```

### E2E (Playwright)
```bash
npm run test:e2e           # Pruebas end-to-end
npx playwright test --ui   # Modo UI interactivo
```

### Todo el Suite
```bash
npm run test:all           # Ejecutar todas las pruebas
npm run test:coverage      # Reporte completo de cobertura
```

## **Estructura de Pruebas**

```
backend/tests/
├── setup.js                    # Configuración global
├── controllers/
│   ├── userController.test.js  # Tests de usuarios
│   └── orderController.test.js # Tests de pedidos
└── integration/
    └── api.test.js             # Tests de integración

frontend/src/components/__tests__/
├── CustomerForm.test.js        # Formulario de clientes
├── HeroSection.test.js         # Sección principal
└── AdminReports.test.js        # Dashboard admin

tests/e2e/
└── order-flow.spec.js          # Flujo completo E2E
```

## **Comandos Útiles**

```bash
# Debugging
npx playwright test --debug          # Debug E2E
npm test -- --verbose               # Backend verbose
npm test -- --watch                 # Frontend watch

# Reportes
npx playwright show-report          # Ver reporte E2E
open coverage/lcov-report/index.html # Ver cobertura HTML

# CI/CD
npm run test:ci                     # Para integración continua
```

## **Configuración Completada**

✅ **Backend**: Jest + Supertest + MongoDB Memory Server  
✅ **Frontend**: React Testing Library + Jest DOM  
✅ **E2E**: Playwright cross-browser  
✅ **CI/CD**: GitHub Actions pipeline  
✅ **Cobertura**: Reportes HTML y LCOV  

## **Próximos Pasos**

1. **Ejecutar**: `npm run test:all`
2. **Revisar cobertura**: `npm run test:coverage`
3. **Ver reportes**: Abrir archivos HTML generados
4. **Integrar CI/CD**: Push a GitHub para activar pipeline

---

**¡El sistema de testing está listo para producción!** 🎉
