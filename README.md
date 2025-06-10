# Angular RBAC Application
## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Angular CLI (`npm install -g @angular/cli`)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd angular-rbac-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Running Tests:

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run e2e tests
npm run e2e
```

5. Build and Deployment

```bash
# Development build
ng build

# Production build
ng build --prod

# Serve production build locally
npm install -g http-server
http-server dist/angular-rbac-app
```

## Key Commands

```bash
# Development
ng serve                    # Start dev server
ng generate component name  # Generate component
ng generate service name    # Generate service
ng generate guard name      # Generate guard

# Testing
npm run test               # Run unit tests
npm run test:coverage      # Run with coverage
npm run lint              # Run ESLint
npm run format            # Format code with Prettier

# Build
ng build --prod           # Production build
ng build --analyze        # Build with bundle analyzer
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
