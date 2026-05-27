# Project structure and architecture

This project follows a Domain-Driven Design (DDD) inspired structure, organized by **Features**. Each feature is self-contained and split into two main layers: **API** (Infrastructure) and **Application** (Domain/UI).

## Directory layout

The `src` directory is the root of the source code.

```text
src/
├── features/            # Feature-based modules
│   ├── [feature-name]/
│   │   ├── api/         # Infrastructure layer (API communication, DTOs)
│   │   └── application/ # Application layer (Components, Hooks, Entities, Pages)
├── lib/                 # Shared libraries and configurations (i18n, axios, query client)
└── assets/              # Global static assets
```

## Feature structure

Each feature folder (e.g., `features/documents/`) is divided into:

### 1. API folder (infrastructure)

Contains everything related to external service communication. Access to this layer should be restricted to the feature's own application layer hooks or services.

- **`services/`**: The "Black Box" that communicates with the outside world. Implementations of REST API calls.
- **`dtos/`**: Data Transfer Objects. Types that strictly match the API response format (e.g., `DocumentDTO`, `UserDTO`).
- **`mappers/`**: Classes with static methods to transform DTOs into Domain Entities (e.g., `DocumentMapper.toDomain`).
- **`maps/`**: Utilities for mapping specific fields if necessary.

### 2. Application folder (domain and presentation)

Contains the code that drives the application logic and UI. This layer should be decoupled from the raw API structure.

- **`entities/`**: Domain models used within the application (e.g., `Document`, `User`). These should **not** depend on API structures.
- **`hooks/`**: Custom React hooks. These are the primary consumers of Services. Components should use these hooks, not services directly.
- **`components/`**: React components scoped to this feature.
  - Can be segmented by sub-feature (e.g., `create/`, `edit/`, `settings/`).
- **`contexts/`**: React contexts specific to the feature.
- **`commands/`**: Functions or objects defining actions/mutations for services (optional, can be part of hooks).
- **`pages/`**: Route components (Page views) for the feature.

## Naming conventions

### Files

Files should use **kebab-case** with a suffix indicating their type.

- `user-profile.component.tsx`
- `documents.service.ts`
- `create-document.dto.ts`
- `use-auth.hook.ts` (optional suffix for hooks, standard is `use-feature.ts`)
- `home.page.tsx`

### Classes and types

- **Infrastructure**: Use suffixes like `DTO` (e.g., `UserDTO`, `UserRecord`).
- **Domain**: Use clean names (e.g., `User`, `Document`). **Do not** use generic names like `UserData` for domain entities.

## Review

### Components and styling

- **Structure**: Components should be small, focused, and reusable.
- **Component library**: Always prefer **Adamo UI** components over custom implementations.
- **Location**:
  - Global/Shared components go in `features/common/components`.
  - Feature-specific components go in `features/[feature]/application/components`.
- **Segmentation**: If a feature has many components, segment them by function:
  - `components/create/`
  - `components/edit/`
  - `components/settings/`

### Styling

- Use **Adamo UI** components from `@adamosuiteservices/ui` (see [Component Library Guide](component-library.md)).
- Use **TailwindCSS** for custom styling and layouts.
- **Never use `adm:` prefix** - it's internal to the component library.
- Avoid inline styles.
- Ensure designs are modern, premium, and responsive.

### General rules (quality assurance)

- **Strict types**: Avoid `any`. Use properly defined interfaces for Props and Entities.
- **Validation**: Use Zod for schema validation (forms, environment variables, etc).
- **Linting**: Ensure code passes ESLint and Prettier checks before committing.

## Example: documents feature

```text
features/documents/
├── api/
│   ├── services/       # documents.service.ts
│   ├── dtos/           # document.dto.ts, create-document.dto.ts
│   ├── mappers/        # document.mapper.ts
│   └── maps/           # document-status.map.ts
└── application/
    ├── entities/       # document.entity.ts
    ├── hooks/          # use-documents.ts, use-create-document.ts
    ├── commands/       # create-document.command.ts
    ├── components/     # document-list.tsx
    └── pages/          # documents.page.tsx
```
