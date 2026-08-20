# System Architecture Document

This document outlines the architecture, database schema, role-based permissions, and data flows of the **AI Textile Waste Intelligence Platform**.

---

## Technology Stack
- **Frontend**: React (Vite), TailwindCSS, React Router, Axios, Recharts (Chart.js wrapper).
- **Backend**: FastAPI, SQLAlchemy (ORM), JWT authentication (HS256).
- **Database**: PostgreSQL (production), SQLite (local fallback/development).

---

## Database Schema

```mermaid
erDiagram
    users {
        int id PK
        string fullname
        string email UK
        string phone UK
        string company
        string password_hash
        string role
        datetime created_at
        datetime updated_at
    }
    inventory {
        int id PK
        int user_id FK
        string batch_id UK
        string fabric_type
        string source
        float quantity
        string color
        string condition
        datetime collection_date
        string status
        text remarks
        text image_url
        datetime created_at
        datetime updated_at
    }
    users ||--o{ inventory : "registers"
```

---

## Role-Based Access Control (RBAC)

1. **Administrator**:
   - **Access**: Admin Dashboard, User Management, Global Inventory.
   - **Operations**: Create, read, edit, suspend/delete user profiles; delete any inventory record.
2. **Textile Manufacturer**:
   - **Access**: User Dashboard, My Inventory.
   - **Operations**: Create, edit, and delete own inventory batches.
3. **Recycling Facility Operator**:
   - **Access**: User Dashboard, My Inventory.
   - **Operations**: Read-only access to details; can ONLY update the `status` (`processingStatus`) of assigned batches to track recycling progress.
4. **Sustainability Manager**:
   - **Access**: Read-only global statistics and inventory listings.
   - **Operations**: Strictly view-only. No CRUD allowed.
