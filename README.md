# Laboratory Report Management System

A highly polished, mobile-responsive, and professional Laboratory Information Management System (LIMS) designed for managing patient intakes, diagnostic panels, and clinical report validation.

---

## 🛠️ Database Integration (Supabase Setup)

For security reasons, the remote database setup credentials and table schemas have been moved out of the application interface and are documented here.

To link this application to your own live remote Postgres cluster on **Supabase**:

### 1. Add Environment Secrets
Go to the **Secrets Panel** inside the AI Studio user interface (or your local environment `.env` file) and define the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_api_key
```

### 2. Run Database DDL Script
Copy and execute the following SQL schema block inside the **Supabase SQL Editor** to automatically provision all required database tables, reference constraints, and indexes:

```sql
-- 1. PATIENTS TABLE
CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  mobile TEXT,
  doctor TEXT NOT NULL,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. REPORTS TABLE
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  report_number TEXT UNIQUE NOT NULL,
  patient_id TEXT REFERENCES patients(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  technician_name TEXT NOT NULL,
  status TEXT CHECK (status IN ('Draft', 'Final')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CLINICAL TESTS TABLE
CREATE TABLE IF NOT EXISTS tests (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  test_name TEXT NOT NULL,
  description TEXT
);

-- 4. PARAMETERS TABLE
CREATE TABLE IF NOT EXISTS test_parameters (
  id TEXT PRIMARY KEY,
  test_id TEXT REFERENCES tests(id) ON DELETE CASCADE,
  parameter_name TEXT NOT NULL,
  unit TEXT,
  reference_male TEXT NOT NULL,
  reference_female TEXT NOT NULL,
  reference_child TEXT NOT NULL,
  display_order INTEGER NOT NULL
);

-- 5. RESULTS TABLE
CREATE TABLE IF NOT EXISTS report_results (
  id BIGSERIAL PRIMARY KEY,
  report_id TEXT REFERENCES reports(id) ON DELETE CASCADE,
  parameter_id TEXT REFERENCES test_parameters(id) ON DELETE CASCADE,
  result TEXT NOT NULL,
  flag TEXT CHECK (flag IN ('Normal', 'High', 'Low')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. LABORATORY PROFILE
CREATE TABLE IF NOT EXISTS laboratory (
  id TEXT PRIMARY KEY,
  lab_name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  technician_name TEXT NOT NULL,
  license_number TEXT
);
```

### 3. Configure Row-Level Security (RLS) Policies
By default, new tables in Supabase have Row-Level Security (RLS) enabled, which blocks anonymous client-side reads and writes. To fix the `new row violates row-level security policy` error, run **one** of the two solutions below in your **Supabase SQL Editor**:

#### Option A: Allow public read/write access (Recommended for sandbox testing)
Execute this SQL block to configure permissive RLS policies for each table so your client-side LIMS client can save patient data, test panels, results, and settings:

```sql
-- Enable public policies for patients
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select" ON patients FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON patients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON patients FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON patients FOR DELETE USING (true);

-- Enable public policies for reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select" ON reports FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON reports FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON reports FOR DELETE USING (true);

-- Enable public policies for tests
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select" ON tests FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON tests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON tests FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON tests FOR DELETE USING (true);

-- Enable public policies for test_parameters
ALTER TABLE test_parameters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select" ON test_parameters FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON test_parameters FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON test_parameters FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON test_parameters FOR DELETE USING (true);

-- Enable public policies for report_results
ALTER TABLE report_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select" ON report_results FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON report_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON report_results FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON report_results FOR DELETE USING (true);

-- Enable public policies for laboratory
ALTER TABLE laboratory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select" ON laboratory FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON laboratory FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON laboratory FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON laboratory FOR DELETE USING (true);
```

#### Option B: Disable RLS completely (Simplest for local development)
Alternatively, you can turn off Row-Level Security entirely for these 6 tables to allow full, unrestricted client access:

```sql
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE tests DISABLE ROW LEVEL SECURITY;
ALTER TABLE test_parameters DISABLE ROW LEVEL SECURITY;
ALTER TABLE report_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE laboratory DISABLE ROW LEVEL SECURITY;
```

### 4. Restart Application Workspace
After specifying the credentials, reboot/restart the development workspace to link with your active remote database automatically. If no credentials are found, the app automatically fails over safely to a sandbox offline local memory database so you can continue testing with zero friction.
