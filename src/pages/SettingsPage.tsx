import { useState, useEffect, FormEvent } from 'react';
import { Settings, Shield, Key, FileText, Check, Save, Activity, Info } from 'lucide-react';
import { dbManager } from '../db/dbManager';
import { LaboratorySettings } from '../types';

export default function SettingsPage() {
  const [labName, setLabName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [technicianName, setTechnicianName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      const data = await dbManager.getLaboratorySettings();
      setLabName(data.lab_name);
      setAddress(data.address);
      setPhone(data.phone);
      setEmail(data.email);
      setTechnicianName(data.technician_name);
      setLicenseNumber(data.license_number || '');
    }
    fetchSettings();
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const updated: LaboratorySettings = {
        id: 'default-lab',
        lab_name: labName,
        address,
        phone,
        email,
        technician_name: technicianName,
        license_number: licenseNumber
      };

      await dbManager.updateLaboratorySettings(updated);
      
      // Update global current user as well
      localStorage.setItem('lab_current_user', technicianName);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const sqlSetupScript = `-- 1. PATIENTS TABLE
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
);`;

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Editable settings form */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">Laboratory Profile Config</h2>
              <p className="text-[11px] text-gray-400">Modify print header branding, contacts, and license details</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5 text-xs">
            {/* Success Prompt */}
            {success && (
              <p className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl font-bold flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" />
                Laboratory configurations updated successfully.
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Laboratory Name</label>
                <input
                  type="text"
                  required
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 px-3.5 font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Clinical License Number</label>
                <input
                  type="text"
                  required
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="e.g. LIC-49921-TX"
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 px-3.5 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Contact Telephone</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 px-3.5 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Official Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 px-3.5 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Laboratory Street Address</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 px-3.5 font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
              />
            </div>

            <div className="border-t border-gray-100 pt-5">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Signed Active Technician</label>
              <input
                type="text"
                required
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                placeholder="e.g. Alex Rivera, MT"
                className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2.5 px-3.5 font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
              />
              <span className="text-[10px] text-gray-400 block mt-1.5 leading-relaxed font-medium">
                This identity gets stamped on PDF report verify-blocks automatically.
              </span>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-100 flex items-center gap-2 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </form>
        </div>

        {/* Right Column: Connection & integration guidelines */}
        <div className="space-y-6">
          {/* Supabase status block */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              Database Integration
            </h3>

            <div className="space-y-4 text-xs font-medium">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${dbManager.isSupabase() ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                <span className="text-gray-700">
                  Status: {dbManager.isSupabase() ? (
                    <span className="text-emerald-600 font-bold">Connected to Supabase</span>
                  ) : (
                    <span className="text-gray-400">Offline Sandbox Fallback</span>
                  )}
                </span>
              </div>

              <p className="text-gray-400 leading-relaxed text-[11px]">
                To bind this app to your own live remote Postgres cluster:
              </p>
              
              <ol className="list-decimal list-inside space-y-2 text-[11px] text-gray-500">
                <li>Go to the <span className="font-bold text-gray-700">Secrets Panel</span> inside the AI Studio UI.</li>
                <li>Add <span className="font-mono text-blue-600">VITE_SUPABASE_URL</span></li>
                <li>Add <span className="font-mono text-blue-600">VITE_SUPABASE_ANON_KEY</span></li>
                <li>Reboot the development workspace to link.</li>
              </ol>
            </div>
          </div>

          {/* Guidelines info */}
          <div className="bg-blue-50/50 border border-blue-100/50 rounded-2xl p-6 shadow-sm">
            <h4 className="text-xs font-extrabold text-blue-900 uppercase tracking-wide mb-2 flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-600" />
              Predefined Test Catalog
            </h4>
            <p className="text-[11px] text-blue-800/80 leading-normal">
              Clinical tests (e.g., Complete Blood Count, Liver panels, Lipid groups, Hormones) are managed dynamically in database tables. The technician never manual-types reporting cells.
            </p>
          </div>
        </div>
      </div>

      {/* 3. SQL SETUP DDL BLOCK (FULL width) */}
      <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
          <FileText className="h-5 w-5 text-gray-400" />
          <h3 className="font-bold text-gray-800 text-sm">Supabase Table Schema (SQL Editor DDL)</h3>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Copy-paste and run this SQL block inside the <span className="font-bold text-gray-700">Supabase SQL Editor</span> to provision the required tables in your remote database cluster immediately.
        </p>
        
        <div className="relative">
          <pre className="bg-slate-900 text-slate-100 p-5 rounded-2xl text-[10px] font-mono leading-relaxed overflow-x-auto max-h-96">
            <code>{sqlSetupScript}</code>
          </pre>
        </div>
      </div>

    </div>
  );
}
