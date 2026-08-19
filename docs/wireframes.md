# UI Wireframes & Workflow Planning

## Pages (implemented)

### 1. Login (`/`)
```
┌───────────────────────────────┐
│           🧵 icon              │
│   Textile Waste Intelligence   │
│   Sign in to access platform   │
│                                 │
│   [ Username/Email          ]  │
│   [ Password                ]  │
│         [   Sign In   ]        │
│                                 │
│   Demo accounts: admin / staff │
│   Register as Viewer →         │
└───────────────────────────────┘
```
Maps to: `auth/login`, `auth/register`

### 2. Dashboard (`/dashboard`)
```
┌──────────┬─────────────────────────────────────────────┐
│ Sidebar  │  Dashboard            [user badge] [Logout]  │
│          │  ┌──────┬──────┬──────┬──────┐                │
│ Dashboard│  │Total │Total │Pend- │Recyc-│  (stat cards)  │
│ Inventory│  │Items │kg    │ing   │led kg│                │
│ Dataset  │  └──────┴──────┴──────┴──────┘                │
│          │  ┌────────────────┬────────────────┐          │
│ (Manage  │  │ By Category    │ By Fabric Type  │ (bars)   │
│  Users — │  └────────────────┴────────────────┘          │
│  admin   │  ┌───────────────────────────────────┐        │
│  only)   │  │ Recent Inventory Activity (table)  │        │
│          │  └───────────────────────────────────┘        │
└──────────┴─────────────────────────────────────────────┘
```
Maps to: `inventory/summary`, `inventory/`

### 3. Inventory (`/inventory`)
```
┌──────────┬─────────────────────────────────────────────┐
│ Sidebar  │  Inventory Management   [user badge][Logout] │
│          │  [Category ▾][Status ▾]      [+ New Item]    │
│          │  ┌─────────────────────────────────────────┐ │
│          │  │ Item │Fabric│Cat│Qty│Cond│Status│Loc│Acts│ │
│          │  │ ...  │ ...  │...│...│... │ ●Pill│...│✏️🗑│ │
│          │  └─────────────────────────────────────────┘ │
└──────────┴─────────────────────────────────────────────┘
        ↓ (+ New Item / ✏️ Edit opens)
┌─────────────────────────┐
│ New/Edit Inventory Item  │
│ Item Name [............] │
│ Fabric    [............] │
│ Category ▾ │ Qty (kg) [.]│
│ Condition▾ │ Status ▾    │
│ Source location [.......] │
│ Notes [.................] │
│        [Cancel] [Save]    │
└─────────────────────────┘
```
Maps to: full CRUD on `inventory/`, RBAC-gated buttons (create/edit:
admin+staff; delete: admin only; view: all roles)

### 4. Dataset & Classifier (`/dataset`)
```
┌──────────┬─────────────────────────────────────────────┐
│ Sidebar  │  Dataset & Classifier    [user badge][Logout]│
│          │  ┌────────┬────────┬────────┐                │
│          │  │Dataset │ Total  │Garment │ (stat cards)    │
│          │  │ name   │ images │classes │                │
│          │  └────────┴────────┴────────┘                │
│          │  Browse Samples   [Class ▾][🔄 New Samples]   │
│          │  ┌───┬───┬───┬───┬───┬───┐                    │
│          │  │img│img│img│img│img│img│  (sample grid)     │
│          │  │lbl│lbl│lbl│lbl│lbl│lbl│                     │
│          │  └───┴───┴───┴───┴───┴───┘                    │
│          │  Classification Demo     [▶ Classify Random]  │
│          │  ┌──────┬──────────────────────────────┐      │
│          │  │ img  │ Predicted: X  ✓/✕             │      │
│          │  │      │ Actual: Y                      │      │
│          │  │      │ Routed waste category: Z       │      │
│          │  └──────┴──────────────────────────────┘      │
└──────────┴─────────────────────────────────────────────┘
```
Maps to: `dataset/info`, `dataset/sample`, `dataset/classify`

## Workflow planning: end-to-end user journeys

**Staff member logs intake waste:**
1. Login → Dashboard (sees current totals)
2. Inventory → "+ New Item" → fills fabric type, quantity, category, condition
3. Item appears with status `Pending`
4. (Future milestone) Staff uploads a photo → classifier suggests fabric_type/category automatically

**Admin reviews and finalizes a recycling decision:**
1. Login → Inventory → filter by status `Pending`
2. Edit item → set `recycling_status` to `In Process` or `Recycled`
3. Dashboard reflects updated totals immediately

**Viewer (e.g. sustainability stakeholder) checks progress:**
1. Registers as a viewer (or is given credentials)
2. Dashboard + Inventory are read-only — no create/edit/delete controls shown
3. Can still see full breakdowns by category/fabric/status

**Anyone explores the dataset/classifier capability:**
1. Dataset & Classifier page → browse sample garment images by class
2. Run the classifier on a random image → see predicted vs actual label
   and which waste category it would route to — demonstrating the
   intended CV-assisted sorting workflow for later milestones.
