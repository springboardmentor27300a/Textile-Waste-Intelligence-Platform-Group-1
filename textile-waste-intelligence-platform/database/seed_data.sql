-- Seed data for AI Textile Waste Intelligence Platform

-- 1. Insert Users (Login Details)
-- Password for admin is '123456789'
-- Password for manufacturer is 'Password123'
INSERT INTO users (id, fullname, email, phone, company, password_hash, role) VALUES
(1, 'System Administrator', 'madhulikagoddumarri@gmail.com', '0000000000', 'TWIP Admin HQ', '$2b$12$Oi9PAgA.Z3/ug.3NZjSVOuZhXplPLUO..dKpHZFS4tCrAxZuvkOdC', 'Administrator'),
(2, 'Eco Manufacturer Node', 'mfg@twip.org', '9999999999', 'Eco Fabrics Ltd', '$2b$12$7eDpTeSmoOs22V/B5RY89uuOeHfVEoclQi8tE0MnOsozq95brY6DS', 'Textile Manufacturer')
ON CONFLICT (email) DO NOTHING;

-- 2. Insert Textile Inventory
INSERT INTO inventory (id, user_id, batch_id, fabric_type, source, quantity, color, condition, collection_date, status, remarks) VALUES
(1, 2, 'B-COT88', 'Cotton', 'Cutting Scraps A', 250.0, 'Emerald Green', 'Reusable', '2026-07-09 10:00:00+00', 'Recycled', 'Seeded batch cotton'),
(2, 2, 'B-DEN45', 'Denim', 'Post-Consumer Returns', 180.0, 'Indigo Blue', 'Recyclable', '2026-07-10 11:30:00+00', 'Collected', 'Seeded batch denim'),
(3, 2, 'B-POL02', 'Polyester', 'Defective Yarn rolls', 120.0, 'Charcoal Black', 'Damaged', '2026-07-11 09:00:00+00', 'Processing', 'Seeded batch polyester'),
(4, 2, 'B-WOO71', 'Wool', 'Spinning Waste B', 90.0, 'Mustard Yellow', 'Reusable', '2026-07-11 10:30:00+00', 'Pending', 'Seeded batch wool')
ON CONFLICT (batch_id) DO NOTHING;

-- Reset table serial ID sequences to avoid conflict on new inserts
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('inventory_id_seq', (SELECT MAX(id) FROM inventory));
