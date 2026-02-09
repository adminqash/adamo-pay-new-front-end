# Service architecture & data fetching

## Overview

This document explains the core architecture for data fetching, the service layer, and how the application achieves decoupling between the UI and the API.

## Core concepts

### 1. Services are "black boxes"

Services act as the boundary between the application and the outside world.

- **Input**: They receive specific arguments or **Command Objects**.
- **Output**: They return **Domain Entities** (not DTOs).
- **Responsibility**: They handle HTTP requests, error catching, and data mapping.

### 2. Decoupling

- **React Components** should **never** call API endpoints directly.
- **DTOs (Data Transfer Objects)** should **never** leak into components. They stop at the service layer.
- **Entities** are the only data shape known to components.

### 3. Command pattern for requests

To avoid coupling services to specific API parameters (like `?q=` or `&limit=`), we use **Command Objects**.

- **Command**: A plain interface defining _what_ the operation is (e.g., `CreateDocumentCommand`).
- **Service**: Transforms the Command into the specific API payload or query parameters.

If the API changes (e.g., field `user_name` becomes `username`), only the Service and mapper change. The Component using `CreateDocumentCommand` remains untouched.

## Architecture layers

```text
┌─────────────────────────────────────────────────┐
│            UI Components                        │
│         (React Components/Pages)                │
└────────────────┬────────────────────────────────┘
                 │ uses
                 ▼
┌─────────────────────────────────────────────────┐
│              React Query Hooks                  │
│      (useDocuments, useCreateDocument)          │
│  - Manages loading/error states                 │
│  - Caching & refetching                         │
│  - onSuccess/onError callbacks                  │
└────────────────┬────────────────────────────────┘
                 │ calls
                 ▼
┌─────────────────────────────────────────────────┐
│              Service Layer                      │
│         (DocumentsService, etc.)                │
│  - Business logic                               │
│  - Transforms Commands -> DTOs                  │
│  - API calls                                    │
│  - Maps DTOs -> Entities                        │
└────────────────┬────────────────────────────────┘
                 │ uses
                 ▼
┌─────────────────────────────────────────────────┐
│            API Utilities                        │
│    (handleAPIResponse, handleAPIError)          │
│  - Response transformation                      │
│  - Error normalization                          │
│  - Pagination mapping                           │
└────────────────┬────────────────────────────────┘
                 │ calls
                 ▼
┌─────────────────────────────────────────────────┐
│              Backend API                        │
│         (REST endpoints)                        │
└─────────────────────────────────────────────────┘
```

## Decoupling requests with commands

**The problem:**
Services often require specific parameters (query strings, body payloads). Passing these directly from components couples the UI to the API structure.

**The solution:**
Use Command Interfaces in the `application/commands` folder.

```typescript
// features/documents/application/commands/create-document.command.ts
export interface CreateDocumentCommand {
  title: string;
  description?: string;
  authorId: string;
}
```

The Service consumes this command:

```typescript
// features/documents/api/services/documentService.ts
static async create(command: CreateDocumentCommand): Promise<ServiceResult<Document>> {
  // Transform Command -> DTO (infrastructure detail)
  const payload: CreateDocumentDTO = {
    doc_title: command.title,
    doc_desc: command.description,
    author_uid: command.authorId,
  };
  // ... call API
}
```

## Request flow

### 1. Successful request (query to fetch data)

**Flow:**

```typescript
// 1. UI Component uses the hook
const documents = useDocuments();

// 2. Hook invokes the service
DocumentsService.getAll()

// 3. Service makes HTTP request
const response = await api.get("/documents");
// Response: { success: true, data: [{...}, {...}], pagination: {...}, ... }

// 4. handleAPIResponse transforms to ServiceResult
return ServiceResult<Document[]> {
  success: true,
  data: [Document { id, name, ... }, Document { id, name, ... }],
  pagination: { total: 100, pages: 10, page: 1 },
  message: "Documents retrieved successfully",
  code: null,
  timestamp: "...",
  traceId: "trace-123"
}

// 5. Hook returns the result and React Query caches it
documents.data // ServiceResult<Document[]>
documents.isLoading // false
documents.error // null
```

**Example service (GET):**

```typescript
export class DocumentsService {
  public static GET_DOCUMENTS_KEY = "get_documents_key";

  public static async getAll(): Promise<ServiceResult<Document[]>> {
    try {
      const response = await api.get<APIResponse<DocumentDTO[]>>("/documents");

      // Maps array of DTOs to array of domain entities
      return handleAPIResponse(response, DocumentMapper.toDomainList);
    } catch (error) {
      handleAPIError(error);
    }
  }
}
```

**Example hook (query):**

```typescript
export function useDocuments() {
  const { t } = useTranslation(["documents"]);

  return useQuery({
    queryKey: [DocumentsService.GET_DOCUMENTS_KEY],
    queryFn: DocumentsService.getAll,
    meta: {
      successMessage: t("documents:documents.success_message"),
      errorMessage: t("documents:documents.error_message"),
    },
  });
}
```

**Component usage:**

```typescript
export function DocumentsPage() {
  const documents = useDocuments();

  if (!documents.data) return null;

  return (
    <div>
      {documents.data.data.map((doc) => (
        <div key={doc.id}>{doc.name}</div>
      ))}
    </div>
  );
}
```

### 2. Successful request (mutation to create/edit)

**Flow:**

```typescript
// 1. UI Component calls the hook (passing Command Data)
const { mutate } = useCreateDocument();
mutate({ title: "My Document", authorId: "123" }); // Command

// 2. Hook invokes the service
DocumentsService.create(command)

// 3. Service makes HTTP request
const response = await api.post("/documents", dto);

// 4. handleAPIResponse transforms to ServiceResult
return ServiceResult<Document> { ... }

// 5. React Query onSuccess callback
```

**Example service (POST):**

```typescript
export class DocumentsService {
  public static CREATE_DOCUMENT_KEY = "create_document_key";

  public static async create(
    command: CreateDocumentCommand,
  ): Promise<ServiceResult<Document>> {
    try {
      const dto: CreateDocumentDTO = { name: command.title }; // Mapping Command -> DTO
      const response = await api.post<APIResponse<DocumentDTO>>(
        "/documents",
        dto,
      );

      // Automatically handles success/error and maps data
      return handleAPIResponse(response, DocumentMapper.toDomain);
    } catch (error) {
      handleAPIError(error);
    }
  }
}
```

### 3. Failed request (backend returns error)

**Flow:**

```typescript
// 1. UI Component calls the hook
mutate({ name: "Duplicate Name" });

// 2. Service makes HTTP request
// Response: { success: false, data: null, code: "document_name_exists", ... }

// 3. handleAPIResponse detects success: false and THROWS ServiceResult
throw ServiceResult<DocumentDTO> {
  success: false,
  code: "document_name_exists",
  message: "Document name already exists",
  ...
}

// 4. Service catch block re-throws via handleAPIError
catch (error) {
  handleAPIError(error); // Recognizes ServiceResult, re-throws it
}

// 5. React Query onError callback receives the ServiceResult
onError: (error: ServiceResult<DocumentDTO>) => {
  console.log(error.code);    // "document_name_exists"
}
```

## Error handling best practices

### Using error codes for specific handling

```typescript
export function useCreateDocument() {
  const { t } = useTranslation(["documents", "errors"]);

  return useMutation({
    mutationFn: DocumentsService.create,
    onError: (error: ServiceResult<DocumentDTO>) => {
      // 1. Check for specific error codes
      switch (error.code) {
        case "document_name_exists":
          ToastManager.show({
            variant: "destructive",
            message: t("errors.document_name_exists"),
          });
          break;

        case "network_error":
          ToastManager.show({
            variant: "destructive",
            message: t("errors.network_error"),
          });
          break;

        default:
          ToastManager.show({
            variant: "destructive",
            message: t("errors.generic"),
          });
      }
    },
  });
}
```

## React Query global configuration

The application uses React Query's global configuration to automatically handle loading indicators, success messages, and error messages through **metadata**.

**Global components:**

- **GlobalQueryLoader**: Handles blocking loader for queries.
- **RefetchProgressBar**: Handles background fetch indicator.

**Logic (client.config.ts):**

- **Queries**: Loader shows if `showLoader` is true. Success message only on first load. Error message always.
- **Mutations**: Loader shows on mutate. Success/Error messages always show.

```typescript
// Example usage with metadata
useQuery({
  queryKey: ["key"],
  queryFn: fn,
  meta: {
    successMessage: "Loaded!",
    errorMessage: "Failed!",
    showLoader: false, // disable loader
  },
});
```

## Working with pagination

Services automatically map pagination data from the API to `ServiceResult.pagination`.

```typescript
if (documents.data) {
  const { data, pagination } = documents.data;
  // pagination: { total, pages, page, next, ... }
}
```

## Summary

- **Services** are black boxes using Commands and returning Entities.
- **Hooks** are the only way to access Services.
- **Components** are decoupled from API structure.
- **Global error handling** standardizes user feedback via `ServiceResult` and React Query metadata.
