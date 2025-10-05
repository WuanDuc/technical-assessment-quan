<h1 align="center">Product Management API with Custom Hashmap</h1>

> NestJS technical assessment project implementing full product CRUD, file attachments with nested folders, and a bespoke hashmap used to cache file metadata.

## Overview

This service exposes a REST API for managing products and their related file attachments. Attachments are stored on disk under product-specific directories and surfaced through a tree endpoint that leverages a custom hashmap implementation purpose-built for caching upload metadata. The project is structured using NestJS modules, TypeORM repositories, and adheres to SOLID design principles.

## Implemented Features

- RESTful product management (`POST/GET/PUT/DELETE /products`)
- File attachments per product with optional nested folders (`POST /products/:id/attachments`)
- Tree view of the upload directory (`GET /products/:id/attachments/tree`)
- Custom linear-probing hashmap built from scratch + factory pattern
- PostgreSQL persistence via TypeORM migrations
- Auto-generated Swagger/OpenAPI documentation
- Jest unit tests and Docker-ready runtime

## Tech Stack

- **Runtime:** Node.js 20, NestJS 11
- **Database:** PostgreSQL 13+ (or Docker container)
- **ORM:** TypeORM 0.3+
- **Validation & Docs:** class-validator, class-transformer, @nestjs/swagger
- **Containerization:** Docker (multi-stage image)

## Project Structure

```
src/
├── common/             # Custom data structures & factories
├── config/             # TypeORM data source
├── entities/           # TypeORM entities (products, folders, attachments)
├── migrations/         # Auto-generated migrations
├── modules/
│   ├── products/       # Product CRUD module
│   └── attachments/    # Upload + tree view + hashmap cache
```

## Prerequisites

- Node.js >= 20
- npm >= 10
- PostgreSQL >= 13 (or Docker Desktop)
- Git

---

## 1. Clone & Install

```powershell
git clone <repo-url>
cd technical-assessment
npm install
```

---

## 2. Environment Configuration

1. Copy the template:

    ```powershell
    Copy-Item .env.example .env
    ```

2. Update the variables to match your local database:

    | Variable | Description | Example |
    | --- | --- | --- |
    | `PORT` | API port | `3001`
    | `DB_HOST` | PostgreSQL host | `localhost`
    | `DB_PORT` | PostgreSQL port | `5432`
    | `DB_USERNAME` | Database user | `postgres`
    | `DB_PASSWORD` | Database password | `super_secret`
    | `DB_NAME` | Database name | `technical_assessment`
    | `DB_TYPE` | TypeORM driver | `postgres`
    | `JWT_SECRET` | JWT secret (future use) | `change_me`
    | `JWT_EXPIRATION` | JWT TTL | `3600s`
    | `NODE_ENV` | Environment | `development`
    | `SWAGGER_ENABLED` | Toggle API docs | `true`
    | `ALLOWED_ORIGINS` | Optional CORS CSV list | `http://localhost:4200`

> **Note:** `SWAGGER_ENABLED=true` exposes docs at `/api` even outside development.

---

## 3. Database & Migrations

### Option A – Run PostgreSQL with Docker

```powershell
docker run --name technical-assessment-db `
  -e POSTGRES_DB=technical_assessment `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=postgres `
  -p 5432:5432 `
  -d postgres:16-alpine
```

Update `.env` to match the credentials you used above.

### Apply Migrations

```powershell
# Run all pending migrations
npm run migration:run

# Inspect migration status
npm run migration:show

# Revert last migration (if needed)
npm run migration:revert

# Generate a new migration from entity changes
npm run migration:generate -- src/migrations/<MigrationName>
```

> Migrations are configured through `src/config/data-source.ts`.

---

## 4. Run Without Docker (Standard Setup)

Run the service directly with Node.js when Docker isn’t available or when you’re developing locally.

```powershell
# Development (watch mode + Swagger at http://localhost:3001/api)
npm run start:dev

# Production build
npm run build
npm run start:prod

# Plain start (no watch)
npm run start
```

The server listens on `PORT` (default `3001`). Make sure your `.env` targets a reachable PostgreSQL instance.

---

## 5. API Documentation (Swagger)

- Swagger UI: `http://localhost:<PORT>/api`
- Controlled by `.env` → `SWAGGER_ENABLED=true`
- Custom tags: `Products`, `Attachments`
- Includes bearer auth placeholder for future JWT integration

---

## 6. Testing & Quality

```powershell
# Lint with ESLint + Prettier
npm run lint

# Unit tests
npm run test

# Watch mode tests
npm run test:watch

# Test coverage report
npm run test:cov
```

---

## 7. Run With Docker (Local Image)

Build and run the service via the provided multi-stage Dockerfile when Docker is available locally:

```powershell
# Build image
docker build -t product-api .

# Run container (make sure DB is reachable)
docker run --name product-api `
  --env-file .env `
  -p 3001:3001 `
  --network host `
  product-api
```

> Adjust networking flags (`--network host`) based on your OS. Alternatively attach to the same Docker network as your PostgreSQL container.

---

## 8. Run With GitHub Actions (Remote Docker Build)

When local Docker isn’t an option (for example, due to WSL or hypervisor issues), use the included GitHub Actions workflow (`.github/workflows/docker-build.yml`) to build the image in the cloud and download the resulting artifact.

```powershell
# Trigger the workflow manually
# GitHub UI → Actions → docker-build → Run workflow

# Or push to main to let the workflow run automatically
git push origin main
```

The workflow performs the following steps:

1. Check out the repository.
2. Set up Docker Buildx.
3. Build the Docker image from `dockerfile` (no registry push).
4. Save the image as `technical-assessment.tar` and upload it as an artifact (retained for 7 days).

After the workflow completes, download the artifact from **Actions → specific run → Artifacts** and load it into any Docker daemon:

```powershell
docker load -i technical-assessment.tar
docker run --rm -p 3001:3001 technical-assessment:ci-test
```

---

## 9. Key Modules

- `ProductsModule`: CRUD endpoints, DTO validation, Swagger docs
- `AttachmentsModule`: file uploads via Multer, tree structure view, file metadata cache
- `CustomHashmap`: linear probing implementation with insert/get/delete, resizing, and factory-driven instantiation (`src/common/data-structures/hashmap.ts`)

---

## 10. Troubleshooting

- **Database connection errors** → ensure `.env` credentials match your running PostgreSQL instance and migrations have executed
- **Swagger not available** → check `SWAGGER_ENABLED` and that `NODE_ENV` isn’t forcing production without the flag
- **File uploads failing** → verify `/uploads` directory permissions (created automatically at runtime)

---

## 11. Next Steps & Enhancements

- Add authentication/authorization around upload endpoints
- Extend search & filtering for products
- Implement pagination for `GET /products`
- Add integration tests for attachments module

---

## Custom Hashmap Usage

- The bespoke `CustomHashmap` lives in [`src/common/data-structures/hashmap.ts`](src/common/data-structures/hashmap.ts) and is instantiated through [`HashmapFactory`](src/common/factories/hashmap-factory.ts).
- [`FileStorageService`](src/modules/attachments/file-storage.service.ts) builds the hashmap once at startup and uses it to cache file metadata (`storeFileMetadata`, `getFileMetadata`, `deleteFileMetadata`, `getHashmapStats`).
- [`AttachmentsService`](src/modules/attachments/attachments.service.ts) writes to the cache after each upload, reads from it for metadata endpoints, and removes entries during deletes—ensuring all attachment workflows rely on the custom structure rather than built-in `Map`.

---

## Not Implemented (and Why)

- **Authentication & Authorization** – Not required for the assessment scope; endpoints are currently open for faster evaluation.
- **Advanced file validation (mime/size policies)** – Deferred to keep the focus on core upload/tree/hashmap requirements.
- **Product search, filtering, and pagination** – Listed as nice-to-have features; omitted due to time constraints but outlined in "Next Steps" above.
- **Rate limiting and RBAC** – Considered future enhancements once the foundational API is approved.

---

Made with NestJS.
