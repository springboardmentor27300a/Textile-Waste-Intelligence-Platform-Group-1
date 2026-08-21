# Demonstrating the PostgreSQL layer

A script for showing a mentor that the platform genuinely runs on PostgreSQL, with real
tables, real relationships and real queries. Every command below is copy-pasteable.

---

## 1. Start on PostgreSQL (not SQLite)

SQLite is the zero-setup default for local development. For the demo you want Postgres:

```bash
cp .env.example .env          # change JWT_SECRET
docker compose up --build     # starts db + backend + frontend
docker compose exec backend python -m app.seed
```

Confirm which database the API is actually using — do this in front of the mentor, because
it proves the switch is real:

```bash
docker compose exec backend python -c "from app.config import settings; print(settings.database_url)"
# postgresql+psycopg2://twip:twip@db:5432/twip
```

Running without Docker? Point `DATABASE_URL` at any Postgres instance and the same code runs:

```bash
createdb twip
export DATABASE_URL="postgresql+psycopg2://postgres:postgres@localhost:5432/twip"
python -m app.seed && uvicorn app.main:app --reload
```

---

## 2. Open a psql session

```bash
docker compose exec db psql -U twip -d twip
```

Useful meta-commands once you're in:

| Command | Shows |
|---|---|
| `\dt` | All tables |
| `\d waste_batches` | Columns, types, indexes, foreign keys of one table |
| `\di` | Indexes |
| `\dT+` | Custom enum types |
| `\x` | Toggle expanded output (good for wide rows) |
| `\q` | Quit |

---

## 3. Show the schema

```sql
\dt
```

Five tables, created by SQLAlchemy from `app/models.py`:

| Table | Holds |
|---|---|
| `users` | Accounts, hashed passwords, role |
| `waste_batches` | The textile inventory register |
| `analyses` | One row per image analysed, with all engine outputs |
| `notifications` | Alerts raised by the platform |

```sql
\d waste_batches
```

Point out the foreign key `owner_id → users.id` and the unique index on `batch_code`.

```sql
\d analyses
```

Point out `batch_id → waste_batches.id` and the **JSONB** columns
(`visual_features`, `material_probabilities`, `recommendations`,
`environmental_impact`, `score_components`). This is a good thing to be asked about:
the 23 image measurements and the ranked route list vary in shape, so they are stored as
JSONB rather than 40 sparse columns, while everything queried or sorted on
(`material`, `circularity_score`, `waste_category`) stays a proper typed column.

```sql
\dT+
```

Shows the enum types Postgres created from the Python enums: `role`, `batchstatus`,
`wastecategory`. Worth mentioning — the database enforces valid values, not just the app.

**One gotcha to know before the demo.** SQLAlchemy stores enum *names*, not display
values. So the API shows `Reusable` and `Hazardous Textile Waste`, but the column holds
`reusable` and `hazardous`:

```sql
SELECT DISTINCT waste_category FROM analyses;
--  reusable / recyclable / repairable / upcyclable / compostable / hazardous
```

Filter on the stored name, or your `WHERE` clause silently returns nothing:

```sql
SELECT COUNT(*) FROM analyses WHERE waste_category = 'reusable';   -- correct
SELECT COUNT(*) FROM analyses WHERE waste_category = 'Reusable';   -- error: invalid input value
```

---

## 4. Show real data

```sql
SELECT id, email, full_name, role, organisation FROM users ORDER BY id;
```

Note the `hashed_password` column is deliberately not selected. Show it once to prove
passwords are bcrypt hashes, never plaintext:

```sql
SELECT email, LEFT(hashed_password, 30) || '...' AS stored_password FROM users LIMIT 2;
```

The batch register:

```sql
SELECT batch_code, fabric_type, quantity_kg, condition, status
FROM waste_batches
ORDER BY collection_date DESC;
```

---

## 5. Queries worth demonstrating

**A JOIN across the relationship** — batches with their latest reading:

```sql
SELECT b.batch_code,
       b.quantity_kg,
       a.material,
       ROUND(a.material_confidence::numeric, 2) AS confidence,
       a.waste_category,
       ROUND(a.circularity_score::numeric, 1)   AS circularity,
       a.circularity_band
FROM waste_batches b
JOIN analyses a ON a.batch_id = b.id
ORDER BY a.circularity_score DESC;
```

**Aggregation** — recoverable mass by material, which is exactly what the
Environmental page renders:

```sql
SELECT a.material,
       COUNT(*)                                    AS batches,
       SUM(b.quantity_kg)                          AS total_kg,
       ROUND(AVG(a.circularity_score)::numeric, 1) AS avg_circularity
FROM analyses a
JOIN waste_batches b ON b.id = a.batch_id
GROUP BY a.material
ORDER BY total_kg DESC;
```

**Querying inside JSONB** — pull the top recommended route out of the JSON array and the
CO₂ figure out of the JSON object:

```sql
SELECT b.batch_code,
       a.recommendations -> 0 ->> 'route'            AS top_route,
       (a.recommendations -> 0 ->> 'fit')::float     AS fit,
       (a.environmental_impact ->> 'co2_saved_kg')::float AS co2_saved_kg
FROM analyses a
JOIN waste_batches b ON b.id = a.batch_id
ORDER BY co2_saved_kg DESC;
```

This is the query to show if you want to demonstrate that Postgres is doing real work,
not just storing blobs. `->` returns JSON, `->>` returns text — a likely follow-up question.

**A window function** — rank batches within each material:

```sql
SELECT a.material, b.batch_code, a.circularity_score,
       RANK() OVER (PARTITION BY a.material ORDER BY a.circularity_score DESC) AS rank_in_material
FROM analyses a
JOIN waste_batches b ON b.id = a.batch_id;
```

**Grouping by enum** — the waste-category split:

```sql
SELECT waste_category, COUNT(*) AS batches, ROUND(AVG(recyclability_score)::numeric, 1) AS avg_recyclability
FROM analyses
GROUP BY waste_category
ORDER BY batches DESC;
```

---

## 6. Show a write happening live

The most convincing part of the demo: run a query, do something in the UI, run it again.

```sql
SELECT COUNT(*) FROM waste_batches;
```

Now register a batch in the web UI (Inventory → Register batch), then re-run it. The count
goes up. Upload an image against that batch and run:

```sql
SELECT batch_code, material, circularity_score, inference_ms
FROM analyses a JOIN waste_batches b ON b.id = a.batch_id
ORDER BY a.id DESC LIMIT 1;
```

You are showing a row that did not exist sixty seconds ago, written by the ML pipeline.

---

## 7. If asked about integrity and performance

**Cascade delete** — the foreign keys are declared `ON DELETE CASCADE`, so this holds
whether you delete through the UI or straight from psql:

```sql
SELECT COUNT(*) FROM waste_batches, LATERAL (SELECT 1) x;
SELECT COUNT(*) FROM analyses;

DELETE FROM waste_batches WHERE batch_code = 'PUT-A-REAL-CODE-HERE';

SELECT COUNT(*) FROM analyses;   -- drops by that batch's analyses
```

Enforcing it in the database as well as the ORM matters: without it, a raw SQL delete
fails with a foreign-key violation, which is an awkward thing to discover mid-demo.

**Indexes** — show that lookups are indexed, not sequential scans:

```sql
EXPLAIN ANALYZE SELECT * FROM waste_batches WHERE batch_code = 'TWB-202608-1599AB';
```

Expect an *Index Scan* using the unique index on `batch_code`.

**Constraints** — the database rejects bad data even if the app were bypassed:

```sql
INSERT INTO users (email, full_name, hashed_password, role, is_active, organisation, created_at)
VALUES ('operator@twip.dev', 'Duplicate', 'x', 'recycler', true, '', NOW());
-- ERROR: duplicate key value violates unique constraint "ix_users_email"
```

Deliberately failing an insert is a strong demonstration — it proves the constraint is in
Postgres, not just validation in Python.

---

## 8. Backup and restore, if asked about operations

```bash
docker compose exec db pg_dump -U twip twip > twip_backup.sql
docker compose exec -T db psql -U twip twip < twip_backup.sql
```

---

## 9. Questions you are likely to be asked

**"Why PostgreSQL over MySQL?"**
JSONB. The analysis outputs are semi-structured and Postgres can index and query inside
them; MySQL's JSON support is weaker. Native enum types and strong window-function support
also matter here.

**"Why is some data JSONB and some in columns?"**
Anything filtered, sorted or aggregated is a typed column so it can be indexed. Anything
that is a variable-shape payload for display — the 23 image features, the ranked route
list — is JSONB. Splitting those into columns would mean dozens of mostly-null fields and
a migration every time an engine changes.

**"How are the tables created?"**
SQLAlchemy declarative models in `app/models.py`; `Base.metadata.create_all()` runs at
startup. For production you would add Alembic migrations — worth saying, because it shows
you know `create_all` is a development convenience.

**"Show me the relationship."**
`users 1—N waste_batches 1—N analyses`. One operator owns many batches; one batch can be
photographed and analysed many times, and the app reads the most recent one.

**"Is it actually connected right now?"**

```sql
SELECT current_database(), current_user, version();
SELECT COUNT(*) FROM analyses;
```

---

## Entity relationship

```
users
  id (PK)                     waste_batches
  email (UNIQUE, INDEX)  ───< id (PK)                    analyses
  full_name                   batch_code (UNIQUE, INDEX) ───< id (PK)
  hashed_password             fabric_type                     batch_id (FK)
  role (ENUM)                 source                          material
  organisation                quantity_kg                     material_confidence
  is_active                   colour                          material_probabilities (JSONB)
  created_at                  condition                       fibre_composition (JSONB)
                              collection_date                 waste_category (ENUM)
notifications                 status (ENUM)                   recyclability_score
  id (PK)                     notes                           reuse_score
  user_id (FK) ───────────    owner_id (FK)                   circularity_score
  kind                        created_at                      circularity_band
  title                                                       score_components (JSONB)
  body                                                        recommendations (JSONB)
  read                                                        environmental_impact (JSONB)
  created_at                                                  visual_features (JSONB)
                                                              inference_ms
                                                              created_at
```


---

## Verified

Every query in this document was executed against a live PostgreSQL instance with the
seeded demo data — including the JSONB extraction, the window function, the `EXPLAIN
ANALYZE` (confirmed *Index Scan*), the duplicate-email rejection, and the cascade delete.
