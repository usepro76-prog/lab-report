import { createClient } from '@supabase/supabase-js';
import { Patient, Report, Test, TestParameter, ReportResult, LaboratorySettings, FullReportDetail } from '../types';

// Check if Supabase keys are configured
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

const isSupabaseConfigured = supabaseUrl.trim() !== '' && supabaseAnonKey.trim() !== '';

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// ==========================================
// SEED DATA FOR LOCAL FALLBACK
// ==========================================

const INITIAL_LABORATORY_SETTINGS: LaboratorySettings = {
  id: 'default-lab',
  lab_name: 'Metro Diagnostic Laboratory',
  address: '456 Medical Center Blvd, Suite 102, Metro City',
  phone: '+1 (555) 019-2834',
  email: 'reports@metrolab.com',
  technician_name: 'Alex Rivera, MT',
  license_number: 'LIC-77492-TX',
  logo_url: '' // Will use a default generated visual or clean typography
};

const INITIAL_TESTS: Test[] = [
  { id: 't-cbc', category: 'Hematology', test_name: 'Complete Blood Count (CBC)', description: 'Full screen for anemia, infection, and general hematology indices' },
  { id: 't-lipid', category: 'Lipid Profile', test_name: 'Lipid Profile', description: 'Evaluates cardiovascular risk and cholesterol distribution' },
  { id: 't-lft', category: 'Liver Function', test_name: 'Liver Function Test (LFT)', description: 'Measures key hepatic enzymes and proteins' },
  { id: 't-kft', category: 'Kidney Function', test_name: 'Kidney Function Test (KFT)', description: 'Assesses renal filtration and electrolyte indicators' },
  { id: 't-sugar', category: 'Blood Sugar', test_name: 'Diabetic Screen', description: 'Assesses serum glucose states and long-term glycemic control' },
  { id: 't-hormones', category: 'Hormones', test_name: 'Thyroid Panel', description: 'Checks key metabolic thyroid hormone indicators' },
  { id: 't-urine', category: 'Urine', test_name: 'Urinalysis', description: 'Urinary pH, chemistry, and microscopic assessment' }
];

const INITIAL_PARAMETERS: TestParameter[] = [
  // CBC Parameters
  { id: 'p-cbc-hb', test_id: 't-cbc', parameter_name: 'Hemoglobin', unit: 'g/dL', reference_male: '13.0 - 17.0', reference_female: '12.0 - 15.0', reference_child: '11.0 - 14.5', display_order: 1 },
  { id: 'p-cbc-wbc', test_id: 't-cbc', parameter_name: 'WBC (Total Leucocyte Count)', unit: 'cells/µL', reference_male: '4000 - 11000', reference_female: '4000 - 11000', reference_child: '5000 - 14500', display_order: 2 },
  { id: 'p-cbc-rbc', test_id: 't-cbc', parameter_name: 'RBC (Red Blood Cell Count)', unit: 'million/µL', reference_male: '4.5 - 5.5', reference_female: '3.8 - 4.8', reference_child: '4.0 - 5.2', display_order: 3 },
  { id: 'p-cbc-plt', test_id: 't-cbc', parameter_name: 'Platelets Count', unit: 'cells/µL', reference_male: '150000 - 450000', reference_female: '150000 - 450000', reference_child: '150000 - 450000', display_order: 4 },
  { id: 'p-cbc-pcv', test_id: 't-cbc', parameter_name: 'PCV (Packed Cell Volume)', unit: '%', reference_male: '40.0 - 50.0', reference_female: '36.0 - 46.0', reference_child: '35.0 - 43.0', display_order: 5 },
  { id: 'p-cbc-mcv', test_id: 't-cbc', parameter_name: 'MCV', unit: 'fL', reference_male: '80.0 - 100.0', reference_female: '80.0 - 100.0', reference_child: '76.0 - 90.0', display_order: 6 },
  { id: 'p-cbc-mch', test_id: 't-cbc', parameter_name: 'MCH', unit: 'pg', reference_male: '27.0 - 32.0', reference_female: '27.0 - 32.0', reference_child: '25.0 - 31.0', display_order: 7 },
  { id: 'p-cbc-mchc', test_id: 't-cbc', parameter_name: 'MCHC', unit: 'g/dL', reference_male: '32.0 - 36.0', reference_female: '32.0 - 36.0', reference_child: '32.0 - 36.0', display_order: 8 },

  // Lipid Profile Parameters
  { id: 'p-lip-chol', test_id: 't-lipid', parameter_name: 'Total Cholesterol', unit: 'mg/dL', reference_male: '125 - 200', reference_female: '125 - 200', reference_child: '100 - 170', display_order: 1 },
  { id: 'p-lip-trig', test_id: 't-lipid', parameter_name: 'Triglycerides', unit: 'mg/dL', reference_male: '40 - 150', reference_female: '40 - 150', reference_child: '30 - 130', display_order: 2 },
  { id: 'p-lip-hdl', test_id: 't-lipid', parameter_name: 'HDL Cholesterol', unit: 'mg/dL', reference_male: '40 - 60', reference_female: '50 - 60', reference_child: '40 - 60', display_order: 3 },
  { id: 'p-lip-ldl', test_id: 't-lipid', parameter_name: 'LDL Cholesterol (Calculated)', unit: 'mg/dL', reference_male: '50 - 100', reference_female: '50 - 100', reference_child: '50 - 110', display_order: 4 },

  // LFT Parameters
  { id: 'p-lft-bil-tot', test_id: 't-lft', parameter_name: 'Bilirubin Total', unit: 'mg/dL', reference_male: '0.2 - 1.2', reference_female: '0.2 - 1.2', reference_child: '0.2 - 1.0', display_order: 1 },
  { id: 'p-lft-bil-dir', test_id: 't-lft', parameter_name: 'Bilirubin Direct', unit: 'mg/dL', reference_male: '0.0 - 0.3', reference_female: '0.0 - 0.3', reference_child: '0.0 - 0.3', display_order: 2 },
  { id: 'p-lft-alt', test_id: 't-lft', parameter_name: 'SGPT (ALT)', unit: 'U/L', reference_male: '7 - 56', reference_female: '7 - 45', reference_child: '5 - 45', display_order: 3 },
  { id: 'p-lft-ast', test_id: 't-lft', parameter_name: 'SGOT (AST)', unit: 'U/L', reference_male: '10 - 40', reference_female: '10 - 35', reference_child: '15 - 40', display_order: 4 },
  { id: 'p-lft-alk', test_id: 't-lft', parameter_name: 'Alkaline Phosphatase (ALP)', unit: 'U/L', reference_male: '44 - 147', reference_female: '44 - 147', reference_child: '100 - 350', display_order: 5 },
  { id: 'p-lft-prot', test_id: 't-lft', parameter_name: 'Total Protein', unit: 'g/dL', reference_male: '6.0 - 8.3', reference_female: '6.0 - 8.3', reference_child: '6.0 - 8.0', display_order: 6 },
  { id: 'p-lft-alb', test_id: 't-lft', parameter_name: 'Albumin', unit: 'g/dL', reference_male: '3.5 - 5.0', reference_female: '3.5 - 5.0', reference_child: '3.4 - 4.8', display_order: 7 },

  // KFT Parameters
  { id: 'p-kft-creat', test_id: 't-kft', parameter_name: 'Serum Creatinine', unit: 'mg/dL', reference_male: '0.7 - 1.3', reference_female: '0.6 - 1.1', reference_child: '0.3 - 0.7', display_order: 1 },
  { id: 'p-kft-urea', test_id: 't-kft', parameter_name: 'Blood Urea', unit: 'mg/dL', reference_male: '15 - 45', reference_female: '15 - 45', reference_child: '10 - 40', display_order: 2 },
  { id: 'p-kft-uric', test_id: 't-kft', parameter_name: 'Uric Acid', unit: 'mg/dL', reference_male: '3.5 - 7.2', reference_female: '2.6 - 6.0', reference_child: '2.0 - 5.5', display_order: 3 },

  // Blood Sugar Parameters
  { id: 'p-sug-fbs', test_id: 't-sugar', parameter_name: 'Fasting Blood Sugar (FBS)', unit: 'mg/dL', reference_male: '70 - 100', reference_female: '70 - 100', reference_child: '70 - 100', display_order: 1 },
  { id: 'p-sug-pp', test_id: 't-sugar', parameter_name: 'Post Prandial Blood Sugar (PPBS)', unit: 'mg/dL', reference_male: '100 - 140', reference_female: '100 - 140', reference_child: '100 - 140', display_order: 2 },
  { id: 'p-sug-hba1c', test_id: 't-sugar', parameter_name: 'HbA1c (Glycated Hemoglobin)', unit: '%', reference_male: '4.0 - 5.6', reference_female: '4.0 - 5.6', reference_child: '4.0 - 5.6', display_order: 3 },

  // Hormone Parameters
  { id: 'p-hor-t3', test_id: 't-hormones', parameter_name: 'Total T3 (Triiodothyronine)', unit: 'ng/dL', reference_male: '80 - 200', reference_female: '80 - 200', reference_child: '80 - 200', display_order: 1 },
  { id: 'p-hor-t4', test_id: 't-hormones', parameter_name: 'Total T4 (Thyroxine)', unit: 'µg/dL', reference_male: '5.4 - 11.5', reference_female: '5.4 - 11.5', reference_child: '6.4 - 13.3', display_order: 2 },
  { id: 'p-hor-tsh', test_id: 't-hormones', parameter_name: 'TSH (Thyroid Stimulating Hormone)', unit: 'µIU/mL', reference_male: '0.4 - 4.5', reference_female: '0.4 - 4.5', reference_child: '0.5 - 6.0', display_order: 3 },

  // Urine Parameters
  { id: 'p-uri-sg', test_id: 't-urine', parameter_name: 'Specific Gravity', unit: '', reference_male: '1.005 - 1.030', reference_female: '1.005 - 1.030', reference_child: '1.005 - 1.030', display_order: 1 },
  { id: 'p-uri-ph', test_id: 't-urine', parameter_name: 'pH', unit: '', reference_male: '5.0 - 8.0', reference_female: '5.0 - 8.0', reference_child: '5.0 - 8.0', display_order: 2 },
  { id: 'p-uri-prot', test_id: 't-urine', parameter_name: 'Urinary Protein', unit: '', reference_male: 'Negative', reference_female: 'Negative', reference_child: 'Negative', display_order: 3 },
  { id: 'p-uri-glu', test_id: 't-urine', parameter_name: 'Urinary Glucose', unit: '', reference_male: 'Negative', reference_female: 'Negative', reference_child: 'Negative', display_order: 4 },
  { id: 'p-uri-pus', test_id: 't-urine', parameter_name: 'Pus Cells', unit: '/HPF', reference_male: '0 - 5', reference_female: '0 - 5', reference_child: '0 - 5', display_order: 5 }
];

const INITIAL_PATIENTS: Patient[] = [
  { id: 'pat-1', name: 'John Doe', age: 45, gender: 'Male', mobile: '+1 (555) 123-4567', doctor: 'Dr. Sarah Jenkins', remarks: 'Routine health checkup', created_at: '2026-06-30T10:00:00.000Z' },
  { id: 'pat-2', name: 'Emily Watson', age: 32, gender: 'Female', mobile: '+1 (555) 987-6543', doctor: 'Dr. Michael Cho', remarks: 'Monitoring lipid control', created_at: '2026-07-01T08:30:00.000Z' },
  { id: 'pat-3', name: 'Tommy Smith', age: 8, gender: 'Male', mobile: '+1 (555) 444-5555', doctor: 'Dr. Maria Lopez', remarks: 'Fever diagnostic workup', created_at: '2026-07-02T09:15:00.000Z' }
];

const INITIAL_REPORTS: Report[] = [
  { id: 'rep-1', report_number: 'LAB-2026-000001', patient_id: 'pat-1', report_date: '2026-06-30', technician_name: 'Alex Rivera, MT', status: 'Final', created_at: '2026-06-30T10:15:00.000Z' },
  { id: 'rep-2', report_number: 'LAB-2026-000002', patient_id: 'pat-2', report_date: '2026-07-01', technician_name: 'Alex Rivera, MT', status: 'Final', created_at: '2026-07-01T09:00:00.000Z' }
];

const INITIAL_RESULTS: ReportResult[] = [
  // rep-1 results (CBC)
  { report_id: 'rep-1', parameter_id: 'p-cbc-hb', result: '14.2', flag: 'Normal' },
  { report_id: 'rep-1', parameter_id: 'p-cbc-wbc', result: '7200', flag: 'Normal' },
  { report_id: 'rep-1', parameter_id: 'p-cbc-rbc', result: '4.8', flag: 'Normal' },
  { report_id: 'rep-1', parameter_id: 'p-cbc-plt', result: '240000', flag: 'Normal' },
  { report_id: 'rep-1', parameter_id: 'p-cbc-pcv', result: '43.2', flag: 'Normal' },
  { report_id: 'rep-1', parameter_id: 'p-cbc-mcv', result: '90.0', flag: 'Normal' },
  { report_id: 'rep-1', parameter_id: 'p-cbc-mch', result: '29.5', flag: 'Normal' },
  { report_id: 'rep-1', parameter_id: 'p-cbc-mchc', result: '32.8', flag: 'Normal' },

  // rep-2 results (Lipid)
  { report_id: 'rep-2', parameter_id: 'p-lip-chol', result: '235', flag: 'High' }, // > 200 is high
  { report_id: 'rep-2', parameter_id: 'p-lip-trig', result: '185', flag: 'High' }, // > 150 is high
  { report_id: 'rep-2', parameter_id: 'p-lip-hdl', result: '42', flag: 'Normal' }, // female 50-60, so actually low but let's test
  { report_id: 'rep-2', parameter_id: 'p-lip-ldl', result: '156', flag: 'High' }  // > 100 is high
];

// Helper to check and parse ranges for flags
export function calculateFlag(
  valueStr: string,
  gender: 'Male' | 'Female' | 'Other',
  age: number,
  parameter: TestParameter
): 'Normal' | 'High' | 'Low' {
  const normalizedValue = valueStr.trim();
  if (!normalizedValue) return 'Normal';

  // Get correct reference range string based on age and gender
  let refRangeStr = parameter.reference_male;
  if (age < 12) {
    refRangeStr = parameter.reference_child;
  } else if (gender === 'Female') {
    refRangeStr = parameter.reference_female;
  }

  // Handle categorical reference ranges like 'Negative'
  if (refRangeStr.toLowerCase() === 'negative') {
    const valLower = normalizedValue.toLowerCase();
    if (valLower === 'negative' || valLower === 'nil' || valLower === 'normal' || valLower === '0' || valLower === '-') {
      return 'Normal';
    }
    return 'High'; // Anything else counts as abnormal/high positivity
  }

  // Parse numeric ranges: format "MIN - MAX" (e.g. "13.0 - 17.0" or "4000 - 11000")
  const numericValue = parseFloat(normalizedValue);
  if (isNaN(numericValue)) return 'Normal';

  // Format "MIN - MAX"
  const dashMatch = refRangeStr.match(/^([\d.]+)\s*-\s*([\d.]+)$/);
  if (dashMatch) {
    const min = parseFloat(dashMatch[1]);
    const max = parseFloat(dashMatch[2]);
    if (numericValue < min) return 'Low';
    if (numericValue > max) return 'High';
    return 'Normal';
  }

  // Format "< MAX"
  const ltMatch = refRangeStr.match(/^<\s*([\d.]+)$/);
  if (ltMatch) {
    const max = parseFloat(ltMatch[1]);
    if (numericValue >= max) return 'High';
    return 'Normal';
  }

  // Format "> MIN"
  const gtMatch = refRangeStr.match(/^>\s*([\d.]+)$/);
  if (gtMatch) {
    const min = parseFloat(gtMatch[1]);
    if (numericValue <= min) return 'Low';
    return 'Normal';
  }

  return 'Normal';
}

// ==========================================
// LOCAL STORAGE DATABASE API
// ==========================================

function getLocalStorage<T>(key: string, initialValue: T): T {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(initialValue));
    return initialValue;
  }
  try {
    return JSON.parse(data) as T;
  } catch {
    return initialValue;
  }
}

function setLocalStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Ensure local tables exist
export function initLocalDB() {
  getLocalStorage('lab_settings', INITIAL_LABORATORY_SETTINGS);
  getLocalStorage('lab_tests', INITIAL_TESTS);
  getLocalStorage('lab_parameters', INITIAL_PARAMETERS);
  getLocalStorage('lab_patients', INITIAL_PATIENTS);
  getLocalStorage('lab_reports', INITIAL_REPORTS);
  getLocalStorage('lab_results', INITIAL_RESULTS);
  
  // Set mock active technician
  const currentTech = localStorage.getItem('lab_current_user');
  if (!currentTech) {
    localStorage.setItem('lab_current_user', 'Alex Rivera, MT');
  }
}

// Call initially
initLocalDB();

// Unified DB Manager exports
export const dbManager = {
  isSupabase() {
    return isSupabaseConfigured;
  },

  // 1. AUTHENTICATION & TECH LOGOUT
  async login(password: string): Promise<boolean> {
    // There is only 1 user role (Technician). In mock mode, password is any non-empty string or 'admin' / '123456'
    if (isSupabaseConfigured && supabase) {
      // In a real application, we can use Supabase Auth or email/pass.
      // We will also accept 'demo' logging for the sandbox bypass
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'technician@labsystem.com',
          password: password
        });
        if (!error && data?.user) {
          localStorage.setItem('lab_current_user', data.user.email || 'Technician');
          return true;
        }
      } catch (e) {
        console.error('Supabase authentication failed, trying fallback log', e);
      }
    }

    // Default Tech Auth bypass
    if (password.length >= 4) {
      localStorage.setItem('lab_current_user', 'Alex Rivera, MT');
      return true;
    }
    return false;
  },

  getCurrentUser(): string {
    return localStorage.getItem('lab_current_user') || 'Alex Rivera, MT';
  },

  logout() {
    localStorage.removeItem('lab_current_user');
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut().catch(console.error);
    }
  },

  // 2. LABORATORY SETTINGS
  async getLaboratorySettings(): Promise<LaboratorySettings> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('laboratory').select('*');
        if (!error && data && data.length > 0) {
          return data[0] as LaboratorySettings;
        }
        if (!error && data && data.length === 0) {
          await supabase.from('laboratory').insert(INITIAL_LABORATORY_SETTINGS);
          return INITIAL_LABORATORY_SETTINGS;
        }
      } catch (err) {
        console.error('Failed to get laboratory settings from Supabase', err);
      }
    }
    return getLocalStorage('lab_settings', INITIAL_LABORATORY_SETTINGS);
  },

  async updateLaboratorySettings(settings: LaboratorySettings): Promise<LaboratorySettings> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('laboratory').upsert(settings).select().single();
        if (!error && data) return data as LaboratorySettings;
      } catch (err) {
        console.error('Failed to update laboratory settings', err);
      }
    }
    setLocalStorage('lab_settings', settings);
    return settings;
  },

  // 3. TESTS & TEST PARAMETERS
  async getTests(): Promise<Test[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('tests').select('*').order('category');
        if (!error && data && data.length > 0) {
          return data as Test[];
        }
        if (!error && data && data.length === 0) {
          console.log('Seeding initial diagnostic tests and parameters to Supabase...');
          const { error: seedTestErr } = await supabase.from('tests').insert(INITIAL_TESTS);
          if (!seedTestErr) {
            await supabase.from('test_parameters').insert(INITIAL_PARAMETERS);
            // Also seed laboratory if empty
            const { data: labData } = await supabase.from('laboratory').select('*');
            if (labData && labData.length === 0) {
              await supabase.from('laboratory').insert(INITIAL_LABORATORY_SETTINGS);
            }
            return INITIAL_TESTS;
          } else {
            console.error('Failed to seed tests:', seedTestErr);
          }
        }
      } catch (err) {
        console.error('Error during getTests query:', err);
      }
    }
    return getLocalStorage('lab_tests', INITIAL_TESTS);
  },

  async getParametersByTestId(testId: string): Promise<TestParameter[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('test_parameters')
          .select('*')
          .eq('test_id', testId)
          .order('display_order');
        if (!error && data && data.length > 0) return data as TestParameter[];
      } catch (err) {
        console.error('Error getting parameters by test_id', err);
      }
    }
    const allParams = getLocalStorage('lab_parameters', INITIAL_PARAMETERS);
    return allParams
      .filter(p => p.test_id === testId)
      .sort((a, b) => a.display_order - b.display_order);
  },

  async getParametersByTestIds(testIds: string[]): Promise<TestParameter[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('test_parameters')
          .select('*')
          .in('test_id', testIds)
          .order('display_order');
        if (!error && data && data.length > 0) return data as TestParameter[];
      } catch (err) {
        console.error('Error getting parameters by test_ids', err);
      }
    }
    const allParams = getLocalStorage('lab_parameters', INITIAL_PARAMETERS);
    return allParams
      .filter(p => testIds.includes(p.test_id))
      .sort((a, b) => a.display_order - b.display_order);
  },

  // 4. REPORT NUMBER GENERATION (LAB-YYYY-000001)
  async generateNextReportNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    let count = 0;

    if (isSupabaseConfigured && supabase) {
      try {
        const { count: dbCount, error } = await supabase
          .from('reports')
          .select('*', { count: 'exact', head: true });
        if (!error && dbCount !== null) {
          count = dbCount;
        } else {
          const reports = getLocalStorage('lab_reports', INITIAL_REPORTS);
          count = reports.length;
        }
      } catch (err) {
        console.error('Error counting reports from Supabase', err);
        const reports = getLocalStorage('lab_reports', INITIAL_REPORTS);
        count = reports.length;
      }
    } else {
      const reports = getLocalStorage('lab_reports', INITIAL_REPORTS);
      count = reports.length;
    }

    const nextNumber = String(count + 1).padStart(6, '0');
    return `LAB-${currentYear}-${nextNumber}`;
  },

  // 5. GET ALL REPORTS
  async getReportsList(): Promise<FullReportDetail[]> {
    let reports: Report[] = [];
    let patients: Patient[] = [];
    let results: ReportResult[] = [];
    let parameters: TestParameter[] = [];
    let tests: Test[] = [];

    if (isSupabaseConfigured && supabase) {
      const { data: repData } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
      const { data: patData } = await supabase.from('patients').select('*');
      const { data: resData } = await supabase.from('report_results').select('*');
      const { data: paramData } = await supabase.from('test_parameters').select('*');
      const { data: testData } = await supabase.from('tests').select('*');

      reports = (repData || []) as Report[];
      patients = (patData || []) as Patient[];
      results = (resData || []) as ReportResult[];
      parameters = (paramData || []) as TestParameter[];
      tests = (testData || []) as Test[];
    } else {
      reports = getLocalStorage('lab_reports', INITIAL_REPORTS);
      patients = getLocalStorage('lab_patients', INITIAL_PATIENTS);
      results = getLocalStorage('lab_results', INITIAL_RESULTS);
      parameters = getLocalStorage('lab_parameters', INITIAL_PARAMETERS);
      tests = getLocalStorage('lab_tests', INITIAL_TESTS);
    }

    // Sort reports by created_at desc (newest first)
    const sortedReports = [...reports].sort((a, b) => {
      const dateA = new Date(a.created_at || a.report_date).getTime();
      const dateB = new Date(b.created_at || b.report_date).getTime();
      return dateB - dateA;
    });

    return sortedReports.map(report => {
      const patient = patients.find(p => p.id === report.patient_id) || {
        id: report.patient_id,
        name: 'Unknown Patient',
        age: 0,
        gender: 'Male' as const,
        doctor: 'Unknown Doctor'
      };

      const reportResults = results.filter(r => r.report_id === report.id);
      
      const fullResults = reportResults.map(r => {
        const param = parameters.find(p => p.id === r.parameter_id);
        const test = param ? tests.find(t => t.id === param.test_id) : undefined;
        
        return {
          parameter_id: r.parameter_id,
          parameter_name: param?.parameter_name || 'Unknown Parameter',
          unit: param?.unit || '',
          reference_male: param?.reference_male || '',
          reference_female: param?.reference_female || '',
          reference_child: param?.reference_child || '',
          test_id: param?.test_id || '',
          test_name: test?.test_name || '',
          category: test?.category || '',
          result: r.result,
          flag: r.flag
        };
      });

      return {
        report,
        patient,
        results: fullResults
      };
    });
  },

  // 6. SAVE OR UPDATE A COMPLETE REPORT
  async saveReport(
    patientData: Omit<Patient, 'id'> & { id?: string },
    reportData: Omit<Report, 'id' | 'patient_id'> & { id?: string },
    resultsData: Array<{ parameter_id: string; result: string; flag: 'Normal' | 'High' | 'Low' }>
  ): Promise<string> {
    const isEditing = !!reportData.id;
    const patientId = patientData.id || `pat-${Date.now()}`;
    const reportId = reportData.id || `rep-${Date.now()}`;
    
    const nowIso = new Date().toISOString();

    const finalPatient: Patient = {
      id: patientId,
      name: patientData.name,
      age: patientData.age,
      gender: patientData.gender,
      mobile: patientData.mobile || '',
      doctor: patientData.doctor,
      remarks: patientData.remarks || '',
      created_at: patientData.created_at || nowIso
    };

    const finalReport: Report = {
      id: reportId,
      report_number: reportData.report_number,
      patient_id: patientId,
      report_date: reportData.report_date,
      technician_name: reportData.technician_name,
      status: reportData.status,
      created_at: reportData.created_at || nowIso
    };

    const finalResults: ReportResult[] = resultsData.map(res => ({
      report_id: reportId,
      parameter_id: res.parameter_id,
      result: res.result,
      flag: res.flag,
      created_at: nowIso
    }));

    if (isSupabaseConfigured && supabase) {
      // 1. Patient upsert
      const { error: patErr } = await supabase.from('patients').upsert(finalPatient);
      if (patErr) throw new Error(`Failed to save patient: ${patErr.message}`);

      // 2. Report upsert
      const { error: repErr } = await supabase.from('reports').upsert(finalReport);
      if (repErr) throw new Error(`Failed to save report: ${repErr.message}`);

      // 3. Clear existing results for this report (useful when editing)
      if (isEditing) {
        await supabase.from('report_results').delete().eq('report_id', reportId);
      }

      // 4. Insert new results
      const { error: resErr } = await supabase.from('report_results').insert(finalResults);
      if (resErr) throw new Error(`Failed to save results: ${resErr.message}`);

      return reportId;
    }

    // LOCAL STORAGE WRITE
    // Update Patients
    const localPatients = getLocalStorage<Patient[]>('lab_patients', INITIAL_PATIENTS);
    const patIndex = localPatients.findIndex(p => p.id === patientId);
    if (patIndex >= 0) {
      localPatients[patIndex] = finalPatient;
    } else {
      localPatients.push(finalPatient);
    }
    setLocalStorage('lab_patients', localPatients);

    // Update Reports
    const localReports = getLocalStorage<Report[]>('lab_reports', INITIAL_REPORTS);
    const repIndex = localReports.findIndex(r => r.id === reportId);
    if (repIndex >= 0) {
      localReports[repIndex] = finalReport;
    } else {
      localReports.push(finalReport);
    }
    setLocalStorage('lab_reports', localReports);

    // Update Results
    let localResults = getLocalStorage<ReportResult[]>('lab_results', INITIAL_RESULTS);
    if (isEditing) {
      localResults = localResults.filter(r => r.report_id !== reportId);
    }
    localResults.push(...finalResults);
    setLocalStorage('lab_results', localResults);

    return reportId;
  },

  // 7. DELETE A REPORT & ASSOCIATED RESULTS (patient stays to keep record, or is cleaned if orphaned)
  async deleteReport(reportId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error: resErr } = await supabase.from('report_results').delete().eq('report_id', reportId);
      if (resErr) return false;
      const { error: repErr } = await supabase.from('reports').delete().eq('id', reportId);
      return !repErr;
    }

    // Local Storage delete
    const reports = getLocalStorage<Report[]>('lab_reports', INITIAL_REPORTS);
    const filteredReports = reports.filter(r => r.id !== reportId);
    setLocalStorage('lab_reports', filteredReports);

    const results = getLocalStorage<ReportResult[]>('lab_results', INITIAL_RESULTS);
    const filteredResults = results.filter(r => r.report_id !== reportId);
    setLocalStorage('lab_results', filteredResults);

    return true;
  }
};
