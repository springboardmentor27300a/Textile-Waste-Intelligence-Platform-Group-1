# Reloom — Testing & Validation

## What actually exists and was run

31 automated tests, in `backend/tests/`, genuinely executed before this
was packaged — not written and left unrun. Result at the time of writing:

```
======================= 31 passed, 54 warnings in 3.44s ========================
```

(The warnings are deprecation notices from third-party libraries —
`datetime.utcnow()`, mostly — not failures or bugs in this code.)

## What's covered

| File | Covers |
|---|---|
| `test_auth_rbac.py` | Registration, login, wrong-password rejection, duplicate email rejection, unauthenticated requests blocked, and — the important one — that a sustainability manager's attempt to register a batch is rejected with a 403 by the **server**, not just hidden in the UI |
| `test_inventory.py` | Batch registration, auto-incrementing batch codes, listing/filtering, 404 on a nonexistent batch, status updates, and that only admins can delete a batch |
| `test_vision.py` | Regression tests for the real false-positive bugs found during development — a clean garment with ordinary wrinkles must score 0 contamination, a plain **dark background** must not be mistaken for a stain (this was an actual bug that got fixed), and a genuine stain must still be detected |
| `test_recyclability_sustainability.py` | The recyclability engine's category decisions, the sustainability engine's pathway routing (natural fibres → mechanical recycling, synthetics → chemical recycling), and that hazardous waste correctly gets zero environmental credit |

## Running it yourself

```bash
cd backend
source venv/bin/activate        # venv\Scripts\activate on Windows
pip install -r requirements.txt
pytest tests/ -v
```

Tests run against an isolated SQLite database (`test_reloom.db`, created
and destroyed automatically) — they never touch your real development or
production database.

## What this does NOT cover (said plainly)

- No frontend/UI automated tests (no Cypress/Playwright suite) — the
  frontend was verified manually and via `npm run build` catching
  compile-time errors, not via automated browser tests.
- No load/performance testing — the "Concurrent image processing
  capacity" and "API response time" metrics named in the brief aren't
  measured here; that needs a load-testing tool (e.g. Locust) run against
  a deployed instance, which wasn't set up.
- No CI pipeline (GitHub Actions) wired up to run these tests
  automatically on every push — the tests exist and pass locally, but
  aren't yet gated into a merge process.

If a formal CI setup matters for your submission, GitHub Actions is the
natural next step: a `.github/workflows/test.yml` that installs
`requirements.txt` and runs `pytest` on every push. That's a
straightforward addition on top of what's already here, just not built
in this pass.
