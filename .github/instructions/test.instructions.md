---
applyTo: '**'
---

# Technical Assessment - Product Management API with Custom Hashmap

## Core Requirements

### 1. RESTful Product API
- Implement full CRUD operations for Product management
- Required endpoints:
    - `POST /products` - Create new product
    - `GET /products` - List all products
    - `GET /products/:id` - Get single product
    - `PUT /products/:id` - Update product
    - `DELETE /products/:id` - Delete product
- Product schema must include: name, description, price, stock, category (customizable)

### 2. Custom Hashmap Implementation
- **MUST implement Hashmap from scratch** - NO built-in Map/Dictionary allowed
- Required features:
    - `insert(key, value)` - Add or update entries
    - `get(key)` - Retrieve value by key
    - `delete(key)` - Remove entry
    - Collision handling (use linear probing OR chaining)
- Purpose: Manage file upload metadata (not for database replacement)

### 3. File Attachment System
- `POST /products/:id/attachments` - Upload files for a product
- Store files in local filesystem under `/uploads/<productId>/`
- `GET /products/:id/attachments` - Return tree structure as JSON
- Support nested folder structure (multi-level directories)
- Tree implementation options:
    - Trie data structure
    - Nested Hashmap
    - Node-based Tree class (folder/file nodes)

### 4. Database & Infrastructure
- Use PostgreSQL, MySQL, or lowdb
- **Docker setup highly recommended**
- Use Docker Compose for orchestration

## Technology Stack (Recommended)

- **Framework**: NestJS + TypeScript
- **Database**: PostgreSQL with TypeORM
- **Testing**: Jest
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker + Docker Compose

## Code Quality Standards

### Architecture & Patterns
- Apply Repository pattern for data access
- Use Factory pattern for Hashmap instantiation
- Follow SOLID principles
- Implement proper separation of concerns (Controller → Service → Repository)

### Code Style
- Use TypeScript strict mode
- Follow clean code principles
- Implement proper error handling
- Use dependency injection (NestJS built-in)
- Add proper type annotations

### Testing
- Write unit tests for:
    - Custom Hashmap operations
    - Product CRUD services
    - File upload/tree generation logic
- Aim for >70% code coverage
- Use Jest testing framework

### Documentation
- Generate Swagger documentation for all endpoints
- Include request/response examples
- Document custom Hashmap class methods
- Provide comprehensive README with:
    - Setup instructions
    - Running locally and with Docker
    - API usage examples
    - Known limitations
    - Architecture decisions

## Nice-to-Have Features

- File upload validation (size, type restrictions)
- Permission-based upload access control
- Hashmap caching mechanism
- Pagination for product listing
- Search and filter capabilities
- Rate limiting for upload endpoints

## Project Structure Example
