---
description: AI-assisted API integration — scaffold a complete, typed HTTP layer (interfaces, service, interceptors, environment config) from an API spec or endpoint description
---

# Angular API Integration Workflow

This workflow scaffolds a complete, typed API integration layer from an OpenAPI spec, a Swagger URL, or a plain description of endpoints. The output matches your project's existing HTTP patterns and includes models, a typed service, interceptors (where needed), and environment variable wiring.

**Trigger:** `/angular-api-integration` in AI chat
**Required input:** An API spec (OpenAPI JSON/YAML), a Swagger URL, or a written description of the endpoints

---

## Step 1 — Gather the API Spec

Ask the user to provide one of the following:
1. **OpenAPI / Swagger JSON or YAML** — paste directly or provide a file path
2. **Swagger UI URL** — the AI will fetch and parse the spec
3. **Written description** — a list of endpoints with HTTP method, path, request body, and response shape

Also ask:
- **Feature name** — used for naming the service and models (e.g. `products`, `user-profile`, `orders`)
- **Base URL config** — is the base URL already in `environment.ts`? If not, what should the key be named?
- **Auth** — does this API require auth headers? If so, is there already an auth interceptor in the project?

---

## Step 2 — Read Existing HTTP Patterns

Before generating any code, read the project to match its conventions:

```bash
# Find existing services that use HttpClient
grep -rn "HttpClient" src/app --include="*.ts" -l
```

Read 1–2 existing HTTP services and note:
- Whether `inject(HttpClient)` or constructor injection is used
- How base URLs are handled (`environment.apiUrl`, a constant, an interceptor)
- Whether responses are mapped with `.pipe(map(...))` before returning
- Error handling style: `catchError`, `throwError`, or a global error interceptor
- Whether `Observable<T>` or `Promise<T>` is returned

```bash
# Find existing interceptors
find src/app -name "*.interceptor.ts"
```

```bash
# Read environment files
cat src/environments/environment.ts
cat src/environments/environment.prod.ts
```

---

## Step 3 — Generate the Models

For each API resource, create a TypeScript interface file in `src/app/{feature}/models/`:

```typescript
// src/app/products/models/product.model.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  category: string;
  imageUrl: string | null;
}

export interface CreateProductRequest {
  name: string;
  price: number;
  category: string;
}

export interface UpdateProductRequest {
  name?: string;
  price?: number;
  category?: string;
}

export interface ProductsResponse {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
}
```

Rules:
- No `any` — every field must be typed
- Use `| null` for nullable fields, not `| undefined` unless the API truly omits the field
- Separate request DTOs from response DTOs where they differ
- Use `unknown` for fields whose type cannot be determined from the spec

---

## Step 4 — Generate the HTTP Service

Create `src/app/{feature}/services/{feature}.service.ts`, matching the project's injection and error-handling patterns:

```typescript
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductsResponse,
} from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/products`;

  getAll(page = 1, pageSize = 20): Observable<ProductsResponse> {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);
    return this.http.get<ProductsResponse>(this.baseUrl, { params });
  }

  getById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, payload);
  }

  update(id: string, payload: UpdateProductRequest): Observable<Product> {
    return this.http.patch<Product>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
```

Rules:
- Match `inject()` vs constructor injection to the project convention
- Every method has an explicit return type — no implicit `any`
- Use `HttpParams` for query parameters — never string-concatenate URLs with user-supplied values
- Do NOT add `catchError` in the service unless the project's existing services do — defer error handling to interceptors or call sites

---

## Step 5 — Update Environment Files

Add the API base URL to environment files if not already present:

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.your-domain.com'
};
```

> ⚠️ Never hardcode real API keys or credentials in source files. Use environment variables or CI/CD secrets injection for production values.

---

## Step 6 — Generate an Interceptor (if needed)

Only create an interceptor if:
- No auth interceptor already exists AND the API requires auth headers, OR
- The API requires a custom header on all requests

```typescript
// src/app/core/interceptors/auth.interceptor.ts
import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken();
  if (!token) return next(req);
  const authReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`)
  });
  return next(authReq);
};
```

Register in `app.config.ts`:
```typescript
provideHttpClient(withInterceptors([authInterceptor]))
```

---

## Step 7 — Verify

```bash
npx tsc --noEmit
```

Fix any type errors in the generated files before presenting.

```bash
npx ng lint src/app/{feature}/
```

---

## Step 8 — Present Output

Show the user:
1. List of files created (with paths)
2. Summary of endpoints covered and their method signatures
3. Any fields typed as `unknown` due to insufficient spec information (and how to resolve them)
4. Next steps: "Wire the service into a component using `/angular-generate`"

---

## Usage Examples

```
/angular-api-integration
→ OpenAPI spec: [paste JSON or YAML]
→ Feature name: products
→ Base URL key: apiUrl (already in environment.ts)
→ Auth: existing auth interceptor handles it
```

```
/angular-api-integration
→ Endpoints:
→   GET /users/:id → { id, name, email, role }
→   PUT /users/:id → { name?, email? } → updated user
→   DELETE /users/:id → 204
→ Feature name: user-management
→ Auth: Bearer token via existing auth interceptor
```

```
/angular-api-integration
→ Swagger URL: https://petstore.swagger.io/v2/swagger.json
→ Feature name: pets
→ Only scaffold: GET /pets, POST /pets, DELETE /pets/{id}
```
