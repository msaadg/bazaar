# Inventory Tracking System

This project is a solution to the Bazaar Technologies Engineering Case Study Challenge, focused on building a scalable Inventory Tracking System. The system evolves from a single-store inventory tracker (v1) to a multi-store platform (v2) and eventually a large-scale distributed system supporting thousands of stores (v3).

## Project Overview

The Inventory Tracking System is designed to manage product inventory and stock movements for a kiryana store, with the goal of scaling to support multiple stores, suppliers, and audits. The system addresses key challenges such as real-time stock visibility, scalability, data integrity, and performance.

The project is implemented in three versions:
- **v1**: A single-store inventory tracker with basic functionality.
- **v2**: Support for 500+ stores with a central product catalog (to be implemented).
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
- **Centralized DB Logic**: All database interactions are centralized in `src/lib/db.ts`, making the code maintainable and reusable for future versions.
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
*To be implemented.*

### Overview
Version 2 will extend the system to support 500+ stores with a central product catalog and store-specific stock. It will introduce REST API endpoints for filtering and reporting, basic authentication, request throttling, and a cloud-hosted relational database (Neon Postgres).

### Tech Stack
- Next.js (TypeScript)
- Prisma with Neon Postgres
- NextAuth.js for authentication
- Vercel for deployment

### Features
- Support for multiple stores
- Filtering and reporting by store and date range
- Basic authentication and request throttling

### Design Decisions
*TBD*

### Assumptions
*TBD*

### API Design
*TBD*

---

## Version 3: Scalable System for Thousands of Stores
*To be implemented.*

### Overview
Version 3 will scale the system to support thousands of stores with concurrent operations, near real-time stock sync, and audit logs. It will introduce horizontal scalability, asynchronous updates, caching, and advanced security features.

### Tech Stack
- Next.js (TypeScript) on Vercel
- Prisma with Neon Postgres (read/write separation)
- Upstash (Redis) for caching
- Kafka (Confluent Cloud) for event-driven updates
- Pusher for real-time dashboard updates

### Features
- Horizontal scalability
- Asynchronous stock updates (event-driven)
- Caching and read/write separation
- Audit logs
- Real-time dashboard updates via WebSockets

### Design Decisions
*TBD*

### Assumptions
*TBD*

### API Design
*TBD*

---

## Evolution Rationale (v1 → v3)

### From v1 to v2
- **Scalability**: v1 is designed for a single store with a local PostgreSQL instance. v2 will scale to 500+ stores by introducing a cloud-hosted relational database (Neon Postgres) and a central product catalog, allowing store-specific stock management.
- **Security**: v1 lacks authentication, as it’s a single-store system. v2 will add basic authentication (using NextAuth.js) and request throttling to handle increased usage.
- **Functionality**: v2 will introduce filtering and reporting by store and date range, addressing the need for better inventory insights across multiple stores.
- **Deployment**: v1 uses Docker for local development. v2 will deploy to Vercel, aligning with Next.js’s ecosystem and Bazaar’s likely deployment strategy.

### From v2 to v3
- **Scalability and Performance**: v2 supports 500+ stores but may struggle with thousands of stores and concurrent operations. v3 will introduce horizontal scalability, read/write separation, and caching (Redis) to handle high transaction volumes.
- **Real-Time Updates**: v3 will add asynchronous updates using Kafka for event-driven stock sync and WebSockets (Pusher) for real-time dashboard updates, ensuring near real-time visibility.
- **Auditability**: v3 will include audit logs to track all stock movements, addressing the need for accountability in a large-scale system.
- **Security and Reliability**: v3 will enhance security with API rate limiting, advanced authentication, and data integrity measures to support high concurrency.

### Overall Evolution
The system evolves from a simple, single-store tracker (v1) to a multi-store platform (v2) and finally to a distributed, scalable system (v3). Each version builds on the previous one, adding features and infrastructure to meet Bazaar’s requirements for scalability, performance, and reliability.

---

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.