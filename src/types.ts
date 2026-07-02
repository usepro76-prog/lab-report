export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  mobile?: string;
  doctor: string;
  remarks?: string;
  created_at?: string;
}

export interface Report {
  id: string;
  report_number: string;
  patient_id: string;
  report_date: string;
  technician_name: string;
  status: 'Draft' | 'Final';
  created_at?: string;
}

export interface Test {
  id: string;
  category: string;
  test_name: string;
  description?: string;
}

export interface TestParameter {
  id: string;
  test_id: string;
  parameter_name: string;
  unit: string;
  reference_male: string;
  reference_female: string;
  reference_child: string;
  display_order: number;
}

export interface ReportResult {
  id?: string;
  report_id: string;
  parameter_id: string;
  result: string;
  flag: 'Normal' | 'High' | 'Low';
  created_at?: string;
}

export interface LaboratorySettings {
  id: string;
  lab_name: string;
  address: string;
  phone: string;
  email: string;
  logo_url?: string;
  technician_name: string;
  license_number?: string;
}

// Full report structure used in UI to simplify data passing
export interface FullReportDetail {
  report: Report;
  patient: Patient;
  results: Array<{
    parameter_id: string;
    parameter_name: string;
    unit: string;
    reference_male: string;
    reference_female: string;
    reference_child: string;
    test_id: string;
    test_name: string;
    category: string;
    result: string;
    flag: 'Normal' | 'High' | 'Low';
  }>;
}
