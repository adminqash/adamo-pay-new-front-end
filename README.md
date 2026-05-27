# Documentation

This guide is designed to train new developers on the project's architecture, patterns, and best practices.

## Architecture

- **Domain-Driven Design (DDD)**: Feature-based modules with clear separation between Infrastructure (API) and Domain (Application) layers
- **Service Layer Pattern**: Services as "Black Boxes" that encapsulate API communication
- **Command Pattern**: Decoupling UI from API structure through Command interfaces
- **Data Fetching**: React Query for server state management with global error handling
- **Component Library**: Adamo UI (`@adamosuiteservices/ui`) - 45+ production-ready components (see `node_modules/@adamosuiteservices/ui/llm.txt` for complete list)

## Tech stack

- **Runtime**: Browser (Modern ES6+)
- **Framework**: React 19 + TypeScript
- **Router**: React Router v7
- **State Management**: React Query
- **UI Library**: Adamo UI (`@adamosuiteservices/ui`) - 45+ production-ready components
- **Styling**: TailwindCSS v4
- **Form Handling**: React Hook Form + Zod
- **Validation**: Zod (schemas & environment variables)
- **HTTP Client**: Axios
- **i18n**: i18next + react-i18next (internationalization with English and Spanish support)
- **Build Tool**: Vite
- **Documentation**: TypeDoc (auto-generated API docs)
- **Code Quality**: ESLint + Husky + lint-staged
- **Dev Tools**: React Query Devtools, React Compiler (Babel plugin)

## Infrastructure

- **React Query Global Configuration**: Automatic loading indicators, success/error messages via metadata
- **Global Components**: `GlobalQueryLoader`, `RefetchProgressBar`, `PageLoader`
- **Mappers**: Separation between DTO ↔ Entity layers
- **Service Result Pattern**: Standardized response structure with pagination, error codes, and trace IDs
- **Error Handling**: Centralized error management with `handleAPIError` and `handleAPIResponse` utilities

## Design patterns

- **Service Layer**: Black Box pattern for API communication
- **Command Pattern**: Use case input encapsulation for API requests
- **Mapper Pattern**: DTO to Entity transformations
- **Hook Pattern**: Custom React hooks as primary interface to Services
- **Repository Pattern**: Services abstract data source details

## Best practices

- **Component Library**: ALWAYS check `node_modules/@adamosuiteservices/ui/llm.txt` before creating components
- **Type Safety**: Full TypeScript with strict mode
- **Never call APIs directly**: Always use Hooks, never Services directly in components
- **DTOs stay in Infrastructure**: Use Mappers to convert DTOs to Domain Entities
- **Clean Entity Names**: Domain entities use clean names (`User`, `Document`), not `UserDTO`
- **Services are Black Boxes**: Inputs are Commands, Outputs are Entities
- **Code Splitting**: Lazy loading for routes and heavy components
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Internationalization**: All user-facing text must be translated
- **Text Conventions**: Use lowercase for titles, messages, comments, and documentation (avoid Title Case unless necessary)

## Project structure

```bash
src/
├── features/           # Feature-based modules
│   ├── [feature]/
│   │   ├── api/       # Infrastructure layer (Services, DTOs, Mappers)
│   │   └── application/ # Domain layer (Entities, Hooks, Components, Pages)
│   └── common/        # Shared components and utilities
├── lib/               # Shared libraries (i18n, axios, query client)
├── assets/            # Global static assets
└── router.tsx         # Application routes
```

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Start development server (Vite)
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run lint:fix   # Run ESLint and fix issues
npm run docs       # Generate TypeDoc documentation
npm run docs:serve # Generate and serve TypeDoc documentation
```

## Documentation

⚠️ **CRITICAL**: It is supremely important to keep the following up to date:

- **Technical Documentation** (`documentation/` folder): Update markdown files when architecture, patterns, or infrastructure changes
- **GitHub Copilot Instructions** (`.github/copilot-instructions.md`): Keep AI context synchronized with current codebase patterns and conventions
- **JSDoc Comments**: Maintain JSDoc comments in all TypeScript files for TypeDoc generation

Outdated documentation leads to inconsistent code, misunderstandings, and technical debt. When you change the codebase, update the docs immediately.

### TypeDoc - Auto-Generated API Documentation

**IMPORTANT**: Use TypeDoc (`npm run docs:serve`) to:

- 🔍 **Search existing code**: Find components, hooks, services, types, and interfaces before creating new ones
- 📚 **Discover functionality**: Browse all available features, use cases, and utilities
- ♻️ **Avoid code duplication**: Check if functionality already exists before implementing
- 🧭 **Navigate codebase**: Understand relationships between modules and dependencies
- 📖 **Onboard new developers**: Comprehensive auto-generated reference from JSDoc comments

**Always check TypeDoc before writing new code** to avoid reinventing the wheel.

### Architecture and patterns documentation

- [Project Structure](documentation/project-structure.md) - Feature-based folder layout, file naming conventions, and component organization
- [Service Architecture & Data Fetching](documentation/service-architecture.md) - Black Box Services, Hook implementation, Command pattern, and global error handling
- [Component Library](documentation/component-library.md) - Adamo UI usage guide, conventions, patterns, and best practices
- [Internationalization](documentation/internationalization.md) - i18next configuration, translation file structure, and usage patterns
- [Lazy Loading](documentation/lazy-loading.md) - Code splitting strategies for routes and components

## Quick rules

1. **Check llm.txt first**: ALWAYS consult `node_modules/@adamosuiteservices/ui/llm.txt` before creating components.
2. **Never call APIs directly** in components. Use Hooks.
3. **Never expose DTOs** to components. Use Mappers to convert to Entities.
4. **Domain Entities** should have clean names (`User`), not infrastructure names (`UserDTO`).
5. **Services are Black Boxes**: Inputs are Commands, Outputs are Entities.
6. **Use Adamo UI components**: The library has 45+ components - don't recreate them.
7. **Individual imports only**: Use `@adamosuiteservices/ui/button`, never barrel imports.
8. **Never use `adm:` prefix**: It's internal to the component library.
9. **All text must be translated**: No hardcoded strings in components.
10. **Use TailwindCSS**: Avoid inline styles and CSS modules.
11. **Lazy load routes**: Use React.lazy for page components.
