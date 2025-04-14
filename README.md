# Inventory Tracking System

This project is a solution to the Bazaar Technologies Engineering Case Study Challenge, focused on building a scalable Inventory Tracking System. The system evolves from a single-store inventory tracker (v1) to a multi-store platform (v2) and eventually a large-scale distributed system supporting thousands of stores (v3).

## Project Overview

The Inventory Tracking System is designed to manage product inventory and stock movements for a kiryana store, with the goal of scaling to support multiple stores, suppliers, and audits. The system addresses key challenges such as real-time stock visibility, scalability, data integrity, and performance.

The project is implemented in three versions:
- **v1**: A single-store inventory tracker with basic functionality.
- **v2**: Support for 500+ stores with a central product catalog and store-specific stock.
- **v3**: A horizontally scalable system for thousands of stores with advanced features (to be implemented).

---

## Version 1: Single Store Inventory Tracker

### Overview
Version 1 focuses on building a simple inventory tracking module for a single kiryana store. It allows users to add products, record sales, and manually remove stock. The system includes a basic frontend dashboard for interacting with the inventory.

### Tech Stack
- **Framework**: Next.js (TypeScript) with API routes for the backend and a simple frontend.
- **ORM**: Prisma for database interactions.
- **Database**: PostgreSQL (local instance running in Docker).
- **Deployment**: Docker for containerization (PostgreSQL and Next.js app).
- **Styling**: Tailwind CSS for the frontend.

### Features
- **Core Functionality**:
  - Add a product or increase stock (stock-in).
  - Record a sale (reduce stock).
  - Manually remove stock.
  - View all products and their current quantities.
- **Standout Features**:
  - **Low Stock Alerts**: Logs a warning in the server console when a product’s stock falls below 10 units after a sale or manual removal.
  - **Basic Dashboard**: A simple frontend interface to view products and interact with the inventory (add products, record sales, remove stock).

### Frontend Screenshot
Below is a screenshot of the v1 dashboard, showing the product list and forms for adding products, recording sales, and manual removals.

![v1 Dashboard Screenshot](docs/screenshot-v1.png)

### Design Decisions
- **Next.js**: Chosen because Bazaar uses Next.js, ensuring alignment with their tech stack. Next.js supports full-stack development with API routes for the backend and a simple frontend for the dashboard.
- **Prisma**: Used as the ORM for type-safe database interactions, simplifying schema management and migrations. It also supports scaling to a cloud-hosted database like Neon Postgres in future versions.
- **PostgreSQL over SQLite**: While the case study allowed for local storage like SQLite, I opted for PostgreSQL to align with the relational database requirements of v2 and v3, ensuring a smoother transition in future iterations.
- **Docker for Database and App**:
  Initially, I considered using Docker solely for managing the PostgreSQL database locally, as it provides a consistent environment for development and testing. However, I realized that packaging the entire application (both the database and the Next.js app) in Docker would offer additional benefits. By containerizing the whole app, I ensured that the entire system could be easily set up and run with a single command (`docker-compose up -d`), reducing environment-related issues and making the setup process more reliable for deployment and collaboration. This decision also prepares the project for future deployment scenarios in v2 and v3, where containerization will be valuable for scaling.
- **Tailwind CSS**: Used for quick, responsive styling of the frontend dashboard, keeping the UI simple and functional.
- **Centralized DB Logic**: All database interactions are centralized in `app/lib/db.ts`, making the code maintainable and reusable for future versions.
- **ES Modules**: The project uses ES modules (`"type": "module"` in `package.json`) for modern JavaScript compatibility and consistency with Next.js.

### Assumptions
- A single store does not require authentication in v1, as the focus is on core functionality. Authentication will be added in v2.
- The store handles approximately 100 transactions per day in v1, so performance optimization is not a priority yet.
- Product IDs are provided manually by the user (e.g., `prod1`, `prod2`) for simplicity in v1. In future versions, this could be auto-generated.
- Low stock alerts are logged to the console in v1, but in future versions, they could be integrated into the UI or sent as notifications.

### API Design
The v1 backend exposes the following REST API endpoints:

| Method | Endpoint              | Description                          | Request Body                              | Response                                   |
|--------|-----------------------|--------------------------------------|-------------------------------------------|--------------------------------------------|
| POST   | `/api/stock-in`       | Add a product or increase stock     | `{ "productId": "string", "name": "string", "quantity": number }` | `{ "message": "string", "product": Product }` |
| POST   | `/api/sale`           | Record a sale (reduce stock)        | `{ "productId": "string", "quantity": number }` | `{ "message": "string", "product": Product }` |
| POST   | `/api/manual-removal` | Manually remove stock               | `{ "productId": "string", "quantity": number }` | `{ "message": "string", "product": Product }` |
| GET    | `/api/products`       | Fetch all products and quantities   | None                                      | `Product[]`                                |

**Product Schema**:
- `id`: string (e.g., `prod1`)
- `name`: string (e.g., `Rice`)
- `currentQuantity`: number (e.g., `50`)

**StockMovement Schema**:
- `id`: string (auto-generated UUID)
- `productId`: string (references Product)
- `type`: string (`STOCK_IN`, `SALE`, `MANUAL_REMOVAL`)
- `quantity`: number
- `timestamp`: string (ISO date)

### Setup and Running
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/msaadg/bazaar.git
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file in the root directory:
   ```
   DATABASE_URL="postgresql://admin:password@localhost:5432/inventory?schema=public"
   ```

4. **Run PostgreSQL and the App in Docker**:
   ```bash
   docker-compose up -d
   ```
   - This starts the PostgreSQL database (`inventory-postgres`) and the Next.js app (`inventory-app`).

5. **Apply Database Migrations**:
   ```bash
   npx prisma migrate dev --name init
   ```

6. **Access the App**:
   - Open `http://localhost:3000` to view the dashboard.
   - Use the forms to add products, record sales, and manually remove stock.

---

## Version 2: 500+ Stores with Central Product Catalog

### Overview
Version 2 builds upon the foundation of v1 to support 500+ stores with a central product catalog and store-specific stock management. I carried out the development of v2 from v1, introducing user authentication, store management, enhanced reporting, and performance optimizations to handle increased scale. The system now supports multiple stores per user, allowing each store to have its own product catalog and stock movements, while providing filtering and reporting capabilities.

### Tech Stack
- **Framework**: Next.js (TypeScript) with API routes for the backend and a responsive frontend.
- **ORM**: Prisma with Prisma Accelerate for optimized database queries.
- **Database**: Neon Postgres (cloud-hosted PostgreSQL).
- **Authentication**: NextAuth.js with Google and GitHub OAuth.
- **Styling**: Tailwind CSS for the frontend.
- **Deployment**: The app has been deployed to a production environment.

### Features
- **Core Functionality**:
  - Support for multiple stores per user.
  - Add a product or increase stock (stock-in) for a specific store.
  - Record a sale (reduce stock) for a specific store.
  - Manually remove stock from a specific store.
  - View all products and their current quantities for a selected store.
  - Create a new store via the dashboard.
- **Standout Features**:
  - **Authentication**: Added user authentication with Google and GitHub OAuth using NextAuth.js.
  - **Store-Specific Management**: Users can manage multiple stores, with each store having its own product catalog and stock movements.
  - **Filtering and Reporting**: Added a reporting section to filter stock movements by store and date range.
  - **Request Throttling**: Implemented middleware to limit API requests to 100 per minute per user, ensuring fair usage.
  - **Low Stock Alerts**: Retained from v1, with alerts logged to the server console when a product’s stock falls below 10 units.
  - **Performance Optimization**: Integrated Prisma Accelerate with a max connection pool size of 10 for optimized database queries.

### Repository Structure
- **`app/lib/types.ts`**: Centralized TypeScript interfaces (e.g., `Product`, `Store`, `StockMovement`) for type safety and reusability across the app.
- **`app/lib/db.ts`**: Centralized database logic, encapsulating all Prisma interactions for maintainability and scalability.
- **`app/api/`**: Contains all API routes (e.g., `stock-in`, `sale`, `manual-removal`, `products`, `stores`, `reports/stock-movements`).
- **`app//`**: Frontend pages, with `index.tsx` as the main dashboard and `login/page.tsx` for authentication.
- **`prisma/schema.prisma`**: Prisma schema defining the database structure, including `User`, `Store`, `Product`, and `StockMovement` models.

### Frontend Screenshot
Below is a screenshot of the v2 dashboard, showing the updated interface with store selection, product management, and stock movement reporting.

![v2 Dashboard Screenshot](docs/screenshot-v2.png)

### Design Decisions
- **Next.js and TypeScript**: Retained from v1 for full-stack development and type safety. TypeScript interfaces are centralized in `app/lib/types.ts` for better code organization.
- **Prisma with Neon Postgres and Accelerate**:
  - Transitioned from a local PostgreSQL instance to Neon Postgres, a cloud-hosted database, to support the scale of 500+ stores.
  - Integrated Prisma Accelerate with a max connection pool size of 10 to optimize database query performance, especially for filtering and reporting.
  - Prisma schema updated to include `User` and `Store` models, enabling multi-store support with store-specific product catalogs.
- **Authentication with NextAuth.js**:
  - Added user authentication using NextAuth.js, supporting Google and GitHub OAuth for secure and seamless login.
  - Simplified the login page to include only Google and GitHub sign-in options, removing manual signup/login.
- **Request Throttling**: Implemented middleware using `rate-limiter-flexible` to limit API requests to 100 per minute per user, preventing abuse and ensuring fair usage.
- **Centralized DB Logic**: Retained from v1, with all database interactions in `app/lib/db.ts`, now extended to support store-specific operations and filtering.
- **Tailwind CSS**: Continued using Tailwind CSS for responsive and consistent styling across the dashboard and login page.
- **Deployment**: Deployed the app to a production environment, ensuring the system is accessible and performant for real-world usage.

### Setup Prisma with Accelerate
This project uses Prisma with the Accelerate extension for optimized database queries, configured with a maximum connection pool size of 10.

#### Prerequisites
- Use Prisma version 5.2.0 or higher for optimal results.

#### Installation
1. Install Prisma, Prisma Client, and the Accelerate extension:
   ```bash
   npm install prisma @prisma/client@latest @prisma/extension-accelerate
   ```
2. Generate the Prisma Client for Accelerate:
   ```bash
   npx prisma generate --no-engine
   ```
3. Extend your Prisma Client instance with Accelerate in `app/lib/db.ts`:
   ```typescript
   import { PrismaClient } from '@prisma/client/edge';
   import { withAccelerate } from '@prisma/extension-accelerate';

   const prisma = new PrismaClient().$extends(withAccelerate());
   ```
4. Add caching to your Accelerate queries (example):
   ```typescript
   await prisma.product.findMany({
     where: { storeId: 'some-store-id' },
     cacheStrategy: { ttl: 60 },
   });
   ```
5. View project usage in the Prisma Accelerate insights tab. For more details, refer to the [Prisma Accelerate documentation](https://www.prisma.io/docs/accelerate).

#### Configuration
- **Max Connection Pool Size**: Set to 10 to optimize performance for this application.

### Assumptions
- Each user can manage multiple stores, and each store has its own product catalog and stock movements.
- The system handles approximately 500 stores, with moderate transaction volumes (e.g., 100 transactions per store per day).
- Product IDs are still manually provided by the user for simplicity, but they are now scoped to a specific store.
- Low stock alerts remain console-based in v2, with potential UI integration in v3.
- Date range filtering for stock movements assumes ISO date strings for simplicity.

### API Design
The v2 backend extends the v1 API with additional endpoints and parameters to support multi-store functionality and reporting:

| Method | Endpoint                       | Description                          | Request Body/Params                          | Response                                   |
|--------|--------------------------------|--------------------------------------|----------------------------------------------|--------------------------------------------|
| POST   | `/api/stock-in`               | Add a product or increase stock     | `{ "productId": "string", "name": "string", "quantity": number, "storeId": "string" }` | `{ "message": "string", "product": Product }` |
| POST   | `/api/sale`                   | Record a sale (reduce stock)        | `{ "productId": "string", "quantity": number, "storeId": "string" }` | `{ "message": "string", "product": Product }` |
| POST   | `/api/manual-removal`         | Manually remove stock               | `{ "productId": "string", "quantity": number, "storeId": "string" }` | `{ "message": "string", "product": Product }` |
| GET    | `/api/products?storeId`       | Fetch products for a store          | Query: `storeId` (string)                    | `Product[]`                                |
| GET    | `/api/stores`                 | Fetch all stores for a user         | None                                         | `Store[]`                                  |
| POST   | `/api/stores`                 | Create a new store                  | `{ "name": "string" }`                       | `{ "message": "string", "store": Store }`  |
| GET    | `/api/reports/stock-movements`| Fetch stock movements with filters  | Query: `storeId` (string), `startDate` (ISO string, optional), `endDate` (ISO string, optional) | `StockMovement[]`                   |

**Updated Product Schema**:
- `id`: string (e.g., `prod1`)
- `name`: string (e.g., `Rice`)
- `currentQuantity`: number (e.g., `50`)
- `storeId`: string (references Store)

**Updated StockMovement Schema**:
- `id`: string (auto-generated UUID)
- `productId`: string (references Product)
- `storeId`: string (references Store)
- `type`: string (`STOCK_IN`, `SALE`, `MANUAL_REMOVAL`)
- `quantity`: number
- `timestamp`: string (ISO date)

**Store Schema**:
- `id`: string (auto-generated UUID)
- `name`: string (e.g., `Main Store`)
- `userId`: string (references User)

**User Schema**:
- `id`: string (auto-generated UUID)
- `email`: string (unique)
- `name`: string (optional)
- `oauthProvider`: string (e.g., `google`, `github`)
- `oauthId`: string (provider-specific ID)

### Setup and Running
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/msaadg/bazaar.git
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file in the root directory:
   ```
   DATABASE_URL="postgresql://<user>:<password>@<neon-host>/inventory?schema=public"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"
   ```

4. **Apply Database Migrations**:
   ```bash
   npx prisma migrate dev --name update_users_and_stores
   ```

5. **Run the App Locally**:
   ```bash
   npm run dev
   ```
   - Open `http://localhost:3000` to view the app.
   - Sign in with Google or GitHub, add a store, and manage inventory for each store.

---

## Version 3: Scalable System for Thousands of Stores

*Proposed Architecture, Not Implemented

### Overview
Version 3 extends the system to support thousands of stores with concurrent operations, near real-time stock synchronization, and audit logs. I propose a theoretical architecture to handle the scale of thousands of users and stores, focusing on horizontal scalability, asynchronous updates, and advanced performance optimizations. This version builds on v2 by introducing a distributed system design to ensure reliability, scalability, and real-time visibility.

### Tech Stack
- **Framework**: Next.js (TypeScript) with microservices architecture on Kubernetes.
- **ORM**: Prisma with Neon Postgres (read/write separation).
- **Caching**: Upstash (Redis) for caching frequently accessed data.
- **Event-Driven Updates**: Kafka (Confluent Cloud) for asynchronous stock updates.
- **Real-Time Updates**: Pusher for WebSocket-based dashboard updates.
- **Deployment**: Kubernetes for horizontal scaling and autoscaling.

### Features
- **Core Functionality**:
  - Support for thousands of stores with concurrent operations.
  - Near real-time stock synchronization across all stores.
  - Comprehensive audit logs for all stock movements.
- **Standout Features**:
  - **Horizontal Scalability**: Deployed on Kubernetes with autoscaling to handle traffic spikes.
  - **Asynchronous Updates**: Event-driven stock updates using Kafka for eventual consistency.
  - **Caching and Read/Write Separation**: Redis caching and Neon Postgres read replicas for performance.
  - **Real-Time Dashboard**: WebSocket updates via Pusher for live stock visibility.
  - **Advanced Rate Limiting**: API rate limits with Redis-backed quotas per user.

### Design Decisions
- **Microservices Architecture on Kubernetes**:
  - Transition from a monolithic Next.js app to a microservices architecture, splitting services (e.g., authentication, inventory, reporting) for better scalability.
  - Kubernetes enables horizontal scaling and autoscaling, ensuring the system can handle thousands of stores and concurrent users.
  - Trade-off: Increased complexity in managing microservices, but necessary for scalability and fault tolerance.
- **Event-Driven Updates with Kafka**:
  - Use Kafka to handle asynchronous stock updates, ensuring eventual consistency across stores.
  - Producers publish stock events (e.g., stock-in, sale) to Kafka topics, and consumers update the database and cache.
  - Trade-off: Eventual consistency may lead to temporary discrepancies, but it ensures high throughput and scalability.
- **Caching and Read/Write Separation**:
  - Implement Redis (Upstash) caching for frequently accessed data (e.g., product lists, stock levels) to reduce database load.
  - Use Neon Postgres with read replicas for read-heavy operations (e.g., reporting, dashboard queries) and a primary instance for writes.
  - Trade-off: Adds complexity with cache invalidation, but significantly improves read performance for thousands of users.
- **Real-Time Updates with Pusher**:
  - Integrate Pusher for WebSocket-based updates, enabling near real-time stock visibility on the dashboard.
  - Trade-off: WebSockets increase server resource usage, but they are essential for real-time user experience.
- **Audit Logs and Rate Limiting**:
  - Add an `AuditLog` model in the Prisma schema to capture all stock movements, including user, action, and timestamp.
  - Implement advanced API rate limiting using Redis to enforce per-user quotas (e.g., 500 requests/minute), building on v2’s throttling.
  - Trade-off: Audit logs increase storage requirements, but they are critical for accountability in a large-scale system.

### Assumptions
- The system handles thousands of stores, with high transaction volumes (e.g., 1,000 transactions per store per day).
- Users expect near real-time stock updates, but eventual consistency is acceptable for stock synchronization.
- Audit logs are stored indefinitely, with potential archival strategies (e.g., offloading to S3) for cost efficiency.
- Network latency and occasional failures are mitigated by Kubernetes’ self-healing and Kafka’s fault tolerance.

### API Design
The v3 backend extends the v2 API with additional endpoints and optimizations for scalability:

| Method | Endpoint                       | Description                          | Request Body/Params                          | Response                                   |
|--------|--------------------------------|--------------------------------------|----------------------------------------------|--------------------------------------------|
| GET    | `/api/audit-logs`             | Fetch audit logs with filters       | Query: `storeId` (string), `startDate` (ISO string), `endDate` (ISO string) | `AuditLog[]`                              |
| GET    | `/api/stock-sync`             | Fetch real-time stock levels        | Query: `storeId` (string), `productId` (string) | `{ "productId": "string", "quantity": number }` |
| POST   | `/api/stock-in`               | Add stock (async via Kafka)         | `{ "productId": "string", "name": "string", "quantity": number, "storeId": "string" }` | `{ "message": "Stock update queued" }` |
| POST   | `/api/sale`                   | Record a sale (async via Kafka)     | `{ "productId": "string", "quantity": number, "storeId": "string" }` | `{ "message": "Sale update queued" }` |

**AuditLog Schema** (Proposed):
- `id`: string (auto-generated UUID)
- `userId`: string (references User)
- `storeId`: string (references Store)
- `action`: string (e.g., `STOCK_IN`, `SALE`)
- `details`: JSON (e.g., `{ "productId": "prod1", "quantity": 10 }`)
- `timestamp`: string (ISO date)

### Setup and Running (Theoretical)
1. **Deploy Infrastructure**:
   - Set up Kubernetes cluster with autoscaling enabled.
   - Configure Neon Postgres with read replicas and Prisma Accelerate.
   - Deploy Kafka cluster (Confluent Cloud) and Redis (Upstash).
2. **Environment Variables**:
   ```
   DATABASE_URL="postgresql://<user>:<password>@<neon-host>/inventory?schema=public"
   KAFKA_BROKERS="broker1:9092,broker2:9092"
   REDIS_URL="redis://<user>:<password>@<upstash-host>:6379"
   PUSHER_APP_ID="your-pusher-app-id"
   PUSHER_KEY="your-pusher-key"
   PUSHER_SECRET="your-pusher-secret"
   ```
3. **Run Microservices**:
   - Deploy each microservice (e.g., inventory, reporting) on Kubernetes.
   - Use Helm charts for streamlined deployment and management.
4. **Monitor and Scale**:
   - Use Kubernetes Horizontal Pod Autoscaler (HPA) to scale based on CPU/memory usage.
   - Monitor Kafka consumer lag and Redis cache hit rate for performance tuning.

---

## Evolution Rationale (v1 → v3)

### From v1 to v2
- **Scalability**: v1 is designed for a single store with a local PostgreSQL instance. v2 scales to 500+ stores by introducing a cloud-hosted relational database (Neon Postgres) and a central product catalog with store-specific stock management, supported by Prisma Accelerate for performance.
- **Security**: v1 lacks authentication, as it’s a single-store system. v2 adds authentication with Google and GitHub OAuth using NextAuth.js, along with request throttling (100 requests per minute per user) to handle increased usage.
- **Functionality**: v2 introduces store management, allowing users to create and manage multiple stores, and adds filtering and reporting by store and date range for better inventory insights.
- **Deployment**: v1 uses Docker for local development. v2 deploys to a production environment, aligning with Next.js’s ecosystem and Bazaar’s likely deployment strategy.
- **Code Organization**: v2 improves maintainability by centralizing types in `app/lib/types.ts` and database logic in `app/lib/db.ts`, preparing the codebase for further scaling in v3.

### From v2 to v3
- **Scalability and Performance**: v2 supports 500+ stores but may struggle with thousands of stores and concurrent operations. v3 introduces a microservices architecture on Kubernetes, read/write separation with Neon Postgres, and Redis caching to handle high transaction volumes.
- **Real-Time Updates**: v3 adds asynchronous updates using Kafka for event-driven stock sync and WebSockets (Pusher) for real-time dashboard updates, ensuring near real-time visibility across thousands of stores.
- **Auditability**: v3 includes audit logs via a new `AuditLog` model, capturing all stock movements for accountability and compliance.
- **Security and Reliability**: v3 enhances security with advanced API rate limiting (Redis-backed), improved authentication, and Kubernetes’ self-healing for high availability.
- **Architecture**: v2’s monolithic design evolves into a microservices architecture in v3, enabling independent scaling of services like inventory and reporting.

### Overall Evolution
The system evolves from a simple, single-store tracker (v1) to a multi-store platform (v2) and finally to a distributed, scalable system (v3). Each version builds on the previous one, adding features and infrastructure to meet Bazaar’s requirements for scalability, performance, and reliability.

---

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.