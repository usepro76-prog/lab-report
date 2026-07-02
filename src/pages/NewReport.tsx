import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  User, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  FileText, 
  Activity, 
  Plus, 
  AlertCircle,
  Clock, 
  Printer, 
  Download,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { dbManager, calculateFlag } from '../db/dbManager';
import { Patient, Report, Test, TestParameter, LaboratorySettings, FullReportDetail } from '../types';
import LabReportPDF from '../components/LabReportPDF';

// Standard Doctor names for quick prefill or typing
const SAMPLE_DOCTORS = [
  'Dr. Sarah Jenkins, MD (Internal Medicine)',
  'Dr. Michael Cho, MD (Cardiologist)',
  'Dr. Maria Lopez, MD (Pediatrician)',
  'Dr. Helena Vance, MD (Chief Pathologist)',
  'Dr. David Vance, MD (Endocrinologist)',
  'Self Referral'
];

export default function NewReport() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Checking if we are in Edit Mode
  const reportIdParam = searchParams.get('reportId');
  const initialStepParam = searchParams.get('step');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // DB static records
  const [availableTests, setAvailableTests] = useState<Test[]>([]);
  const [labSettings, setLabSettings] = useState<LaboratorySettings | null>(null);

  // STEP 1 STATE: Patient Vitals
  const [patientId, setPatientId] = useState('');
  const [reportNumber, setReportNumber] = useState('');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState<number | ''>('');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [patientMobile, setPatientMobile] = useState('');
  const [patientDoctor, setPatientDoctor] = useState(SAMPLE_DOCTORS[0]);
  const [patientRemarks, setPatientRemarks] = useState('');

  // STEP 2 STATE: Selected Tests
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);
  const [testParameters, setTestParameters] = useState<TestParameter[]>([]);

  // STEP 3 STATE: Result values
  // Dictionary mapping: { [parameter_id]: resultValueAsString }
  const [resultValues, setResultValues] = useState<{ [key: string]: string }>({});

  // STEP 5 STATE: Final saved report details for preview
  const [savedReportDetail, setSavedReportDetail] = useState<FullReportDetail | null>(null);

  // Initialize and check mode
  useEffect(() => {
    async function initWizard() {
      try {
        setLoading(true);
        // Load tests and settings
        const tests = await dbManager.getTests();
        setAvailableTests(tests);
        
        const settings = await dbManager.getLaboratorySettings();
        setLabSettings(settings);

        if (reportIdParam) {
          // Editing mode: Fetch existing report details
          const list = await dbManager.getReportsList();
          const found = list.find(r => r.report.id === reportIdParam);
          if (found) {
            // Patient details
            setPatientId(found.patient.id);
            setPatientName(found.patient.name);
            setPatientAge(found.patient.age);
            setPatientGender(found.patient.gender);
            setPatientMobile(found.patient.mobile || '');
            setPatientDoctor(found.patient.doctor);
            setPatientRemarks(found.patient.remarks || '');

            // Report details
            setReportNumber(found.report.report_number);
            setReportDate(found.report.report_date);

            // Selected test ids (derive from parameters)
            const testIds = Array.from(new Set(found.results.map(r => r.test_id)));
            setSelectedTestIds(testIds);

            // Load parameters for those tests
            const params = await dbManager.getParametersByTestIds(testIds);
            setTestParameters(params);

            // Populate results
            const resultsMap: { [key: string]: string } = {};
            found.results.forEach(res => {
              resultsMap[res.parameter_id] = res.result;
            });
            setResultValues(resultsMap);

            // If explicitly loaded on step 5 (Print Preview)
            if (initialStepParam) {
              const stepNum = parseInt(initialStepParam, 10);
              setCurrentStep(stepNum);
              if (stepNum === 5) {
                setSavedReportDetail(found);
              }
            }
          } else {
            setError('Report not found in laboratory records.');
          }
        } else {
          // New Report Mode: Auto generate number
          const num = await dbManager.generateNextReportNumber();
          setReportNumber(num);
        }
      } catch (err) {
        console.error('Failed to initialize report wizard', err);
        setError('Failed to fetch required catalog parameters.');
      } finally {
        setLoading(false);
      }
    }
    initWizard();
  }, [reportIdParam, initialStepParam]);

  // Load parameters whenever selectedTestIds change (only in creation mode)
  useEffect(() => {
    if (selectedTestIds.length === 0) {
      setTestParameters([]);
      return;
    }

    async function loadParams() {
      try {
        const params = await dbManager.getParametersByTestIds(selectedTestIds);
        setTestParameters(params);
        
        // Retain existing results but initialize new ones as empty
        setResultValues(prev => {
          const updated = { ...prev };
          params.forEach(p => {
            if (updated[p.id] === undefined) {
              updated[p.id] = '';
            }
          });
          return updated;
        });
      } catch (err) {
        console.error('Failed to load test parameters', err);
      }
    }
    
    // Prevent overriding loaded values during edit setup
    if (!loading || availableTests.length > 0) {
      loadParams();
    }
  }, [selectedTestIds]);

  // AUTO-SAVE DRAFT STATE (Local storage backup)
  useEffect(() => {
    if (currentStep > 1 && currentStep < 4 && !reportIdParam) {
      const draftState = {
        patientName,
        patientAge,
        patientGender,
        patientMobile,
        patientDoctor,
        patientRemarks,
        selectedTestIds,
        resultValues
      };
      localStorage.setItem('lab_report_draft', JSON.stringify(draftState));
    }
  }, [currentStep, patientName, patientAge, patientGender, patientMobile, patientDoctor, patientRemarks, selectedTestIds, resultValues]);

  // Restore draft helper
  const handleRestoreDraft = () => {
    const backup = localStorage.getItem('lab_report_draft');
    if (backup) {
      try {
        const data = JSON.parse(backup);
        setPatientName(data.patientName || '');
        setPatientAge(data.patientAge || '');
        setPatientGender(data.patientGender || 'Male');
        setPatientMobile(data.patientMobile || '');
        setPatientDoctor(data.patientDoctor || SAMPLE_DOCTORS[0]);
        setPatientRemarks(data.patientRemarks || '');
        setSelectedTestIds(data.selectedTestIds || []);
        setResultValues(data.resultValues || {});
        localStorage.removeItem('lab_report_draft');
        alert('Draft restored successfully.');
      } catch (e) {
        console.error('Failed to restore draft', e);
      }
    }
  };

  const hasDraftAvailable = !reportIdParam && !!localStorage.getItem('lab_report_draft');

  // STEP NAVIGATION & VALIDATIONS
  const handleNextStep = () => {
    setError('');

    if (currentStep === 1) {
      if (!patientName.trim()) {
        setError('Patient name is required.');
        return;
      }
      if (patientAge === '' || patientAge <= 0) {
        setError('Valid patient age is required.');
        return;
      }
      if (!patientDoctor.trim()) {
        setError('Referring doctor field is required.');
        return;
      }
      setCurrentStep(2);
    } 
    else if (currentStep === 2) {
      if (selectedTestIds.length === 0) {
        setError('At least one laboratory test profile is required.');
        return;
      }
      setCurrentStep(3);
    } 
    else if (currentStep === 3) {
      // Validate that results are filled
      const emptyParams = testParameters.filter(p => !resultValues[p.id]?.trim());
      if (emptyParams.length > 0) {
        setError(`Please enter result values for all loaded parameters. Empty: ${emptyParams.map(p => p.parameter_name).join(', ')}`);
        return;
      }
      setCurrentStep(4);
    }
  };

  const handlePrevStep = () => {
    setError('');
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleToggleTest = (testId: string) => {
    setSelectedTestIds(prev => 
      prev.includes(testId) ? prev.filter(id => id !== testId) : [...prev, testId]
    );
  };

  const handleResultChange = (paramId: string, val: string) => {
    setResultValues(prev => ({
      ...prev,
      [paramId]: val
    }));
  };

  // STEP 4: Persist the Report
  const handleSaveReport = async (status: 'Draft' | 'Final') => {
    try {
      setLoading(true);
      setError('');

      // Prepare results payload with calculated flags
      const finalResults = testParameters.map(p => {
        const value = resultValues[p.id] || '';
        const flag = calculateFlag(value, patientGender, Number(patientAge), p);
        return {
          parameter_id: p.id,
          result: value,
          flag
        };
      });

      // Prepare patient details
      const patientData = {
        id: patientId || undefined, // undefined triggers new id
        name: patientName,
        age: Number(patientAge),
        gender: patientGender,
        mobile: patientMobile,
        doctor: patientDoctor,
        remarks: patientRemarks
      };

      // Prepare report details
      const reportData = {
        id: reportIdParam || undefined,
        report_number: reportNumber,
        report_date: reportDate,
        technician_name: dbManager.getCurrentUser(),
        status
      };

      const finalId = await dbManager.saveReport(patientData, reportData, finalResults);
      
      // Load details for printable container
      const updatedList = await dbManager.getReportsList();
      const updatedDetail = updatedList.find(r => r.report.id === finalId);
      if (updatedDetail) {
        setSavedReportDetail(updatedDetail);
      }

      setSuccess(true);
      // Clean draft backup upon final save
      localStorage.removeItem('lab_report_draft');
      setCurrentStep(5);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Database transaction failed.');
    } finally {
      setLoading(false);
    }
  };

  // Printing & PDF controls
  const handlePrint = () => {
    window.print();
  };

  const activeStepClass = "flex items-center justify-center md:justify-start gap-1 md:gap-2 text-xs md:text-sm font-bold text-blue-600 border-b-2 border-blue-600 pb-3";
  const completedStepClass = "flex items-center justify-center md:justify-start gap-1 md:gap-2 text-xs md:text-sm font-semibold text-emerald-600 border-b-2 border-emerald-500 pb-3";
  const inactiveStepClass = "flex items-center justify-center md:justify-start gap-1 md:gap-2 text-xs md:text-sm font-semibold text-gray-400 pb-3";

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Step horizontal progress header - Hidden during browser print */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-black text-gray-900 tracking-tight">
              {reportIdParam ? `Edit Report #${reportNumber}` : 'New Clinical Diagnostics Intake'}
            </h1>
            <p className="text-xs text-gray-400 font-medium">Follow step indicators to process records swiftly</p>
          </div>

          {hasDraftAvailable && currentStep === 1 && (
            <button
              onClick={handleRestoreDraft}
              className="px-3.5 py-1.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg border border-amber-100 hover:bg-amber-100 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Restore Draft Progress
            </button>
          )}
        </div>

        {/* Steps navigation header bar */}
        <div className="grid grid-cols-5 gap-2 mt-8 border-b border-gray-100">
          <div className={currentStep === 1 ? activeStepClass : currentStep > 1 ? completedStepClass : inactiveStepClass}>
            <span className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-current">1</span>
            <span className="hidden md:inline">Patient</span>
          </div>

          <div className={currentStep === 2 ? activeStepClass : currentStep > 2 ? completedStepClass : inactiveStepClass}>
            <span className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-current">2</span>
            <span className="hidden md:inline">Select Tests</span>
          </div>

          <div className={currentStep === 3 ? activeStepClass : currentStep > 3 ? completedStepClass : inactiveStepClass}>
            <span className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-current">3</span>
            <span className="hidden md:inline">Enter Results</span>
          </div>

          <div className={currentStep === 4 ? activeStepClass : currentStep > 4 ? completedStepClass : inactiveStepClass}>
            <span className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-current">4</span>
            <span className="hidden md:inline">Save Registry</span>
          </div>

          <div className={currentStep === 5 ? activeStepClass : inactiveStepClass}>
            <span className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-current">5</span>
            <span className="hidden md:inline">Print & PDF</span>
          </div>
        </div>
      </div>

      {/* Global Wizard Error Alert Box */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-xs text-rose-700 font-semibold no-print">
          <AlertCircle className="h-4.5 w-4.5 text-rose-600 mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* ==========================================
          STEP 1: PATIENT DETAILS
          ========================================== */}
      {currentStep === 1 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm no-print space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Patient Bio Registration</h3>
              <p className="text-[11px] text-gray-400">Specify core identifiers. Mobile & Remarks remain optional.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Auto Generated Report Number */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Report Number</label>
              <input
                type="text"
                readOnly
                value={reportNumber}
                className="w-full bg-slate-50 border border-gray-200 text-gray-400 font-mono font-bold rounded-xl py-3 px-4 focus:outline-none"
              />
            </div>

            {/* Current Date */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Registration Date</label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
              />
            </div>

            {/* Patient Name */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Patient Full Name *</label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Douglas Miller"
                className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 font-bold text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
              />
            </div>

            {/* Age & Gender side-by-side */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Patient Age *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="120"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 36"
                  className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 font-bold text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Biological Gender *</label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value as any)}
                  className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Referring Doctor */}
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Referring Doctor *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={patientDoctor}
                  onChange={(e) => setPatientDoctor(e.target.value)}
                  placeholder="Type doctor's name or choose below"
                  className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 font-semibold text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                />
                <div className="mt-2 flex flex-wrap gap-1">
                  {SAMPLE_DOCTORS.map(doc => (
                    <button
                      key={doc}
                      type="button"
                      onClick={() => setPatientDoctor(doc)}
                      className="px-2 py-1 bg-gray-50 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded text-[10px] font-semibold border border-gray-100 cursor-pointer"
                    >
                      {doc.split(' (')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Contact */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Mobile Contact Number (Optional)</label>
              <input
                type="tel"
                value={patientMobile}
                onChange={(e) => setPatientMobile(e.target.value)}
                placeholder="e.g. +1 (555) 019-9988"
                className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 font-semibold text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Remarks */}
          <div className="text-xs">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Clinical Indication / Diagnosis Remarks (Optional)</label>
            <textarea
              value={patientRemarks}
              onChange={(e) => setPatientRemarks(e.target.value)}
              placeholder="e.g. Patient presents with fatigue. Checking hematology indices."
              rows={3}
              className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 font-medium text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
            />
          </div>

          {/* Footer Controls */}
          <div className="flex justify-between items-center border-t border-gray-50 pt-6">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-5 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-500 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-100 flex items-center gap-2 cursor-pointer"
            >
              Proceed to Test Profile
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          STEP 2: TEST PROFILES
          ========================================== */}
      {currentStep === 2 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm no-print space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Select Diagnostic Panels</h3>
              <p className="text-[11px] text-gray-400">Click to assign test panels to Douglas Miller's intake profile</p>
            </div>
          </div>

          {/* List of categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableTests.map(test => {
              const isSelected = selectedTestIds.includes(test.id);

              return (
                <div
                  key={test.id}
                  onClick={() => handleToggleTest(test.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                    isSelected 
                      ? 'bg-blue-50 border-blue-200 shadow-sm' 
                      : 'bg-white border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className={`mt-0.5 h-5 w-5 rounded-lg flex items-center justify-center border transition-colors ${
                    isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-gray-200'
                  }`}>
                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold uppercase tracking-wide">
                        {test.category}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-800 text-xs mb-1">
                      {test.test_name}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                      {test.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pre-selection warnings */}
          {selectedTestIds.length > 0 && (
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/30 text-[11px] text-blue-800 leading-normal flex items-start gap-2.5">
              <Clock className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold block mb-0.5">Parameters Auto-Loaded:</span>
                <p className="text-blue-600 font-medium">
                  {testParameters.length} total biochemical indices mapped. Technician never manually structures reporting lines.
                </p>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex justify-between items-center border-t border-gray-50 pt-6">
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-5 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-500 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              Patient Bio
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-100 flex items-center gap-2 cursor-pointer"
            >
              Configure Results
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          STEP 3: RESULTS ENTRY GRID
          ========================================== */}
      {currentStep === 3 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm no-print space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Biochemical Result Parameters</h3>
                <p className="text-[11px] text-gray-400">Fill in observed values. The platform evaluates and flags reference ranges instantly.</p>
              </div>
            </div>
            
            {/* Context indicator */}
            <div className="bg-slate-50 border border-slate-100 px-3.5 py-1.5 rounded-xl text-[11px] font-semibold text-gray-600">
              Evaluative Profile: <span className="text-blue-600 font-bold">{patientGender}</span>, Age <span className="text-blue-600 font-bold">{patientAge} Yrs</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600 border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase text-[9px] tracking-wider pb-3">
                  <th className="py-2.5">Diagnostic Profile & Parameter</th>
                  <th className="py-2.5 text-center hidden sm:table-cell">Reference Range</th>
                  <th className="py-2.5 text-center hidden sm:table-cell">Unit</th>
                  <th className="py-2.5 text-center w-28 sm:w-40">Observed Result</th>
                  <th className="py-2.5 text-right w-24 sm:w-28">Status Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {testParameters.map(p => {
                  const val = resultValues[p.id] || '';
                  const flag = calculateFlag(val, patientGender, Number(patientAge), p);

                  // Get patient reference string
                  let rangeStr = p.reference_male;
                  if (Number(patientAge) < 12) {
                    rangeStr = p.reference_child;
                  } else if (patientGender === 'Female') {
                    rangeStr = p.reference_female;
                  }

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3">
                        <span className="text-[9px] font-extrabold text-blue-500 uppercase tracking-wide block mb-0.5">
                          {availableTests.find(t => t.id === p.test_id)?.test_name}
                        </span>
                        <span className="font-bold text-gray-800 text-xs">
                          {p.parameter_name}
                        </span>
                        <div className="sm:hidden text-[10px] text-gray-400 mt-1 font-semibold">
                          Ref: {rangeStr || '—'} • Unit: {p.unit || '—'}
                        </div>
                      </td>
                      <td className="py-3 text-center hidden sm:table-cell text-gray-400 font-mono font-semibold">
                        {rangeStr || '—'}
                      </td>
                      <td className="py-3 text-center hidden sm:table-cell text-gray-400 font-medium">
                        {p.unit || '—'}
                      </td>
                      <td className="py-3 text-center">
                        <input
                          type="text"
                          required
                          value={val}
                          onChange={(e) => handleResultChange(p.id, e.target.value)}
                          placeholder="Result"
                          className="w-full bg-slate-50 border border-gray-200 rounded-lg py-1.5 px-2 text-center font-mono font-bold text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 text-xs"
                        />
                      </td>
                      <td className="py-3 text-right">
                        {val ? (
                          flag === 'High' ? (
                            <span className="inline-flex items-center px-2 py-0.5 bg-rose-50 border border-rose-100 text-rose-700 rounded font-bold text-[10px] uppercase font-mono tracking-wider animate-pulse">
                              ▲ High
                            </span>
                          ) : flag === 'Low' ? (
                            <span className="inline-flex items-center px-2 py-0.5 bg-sky-50 border border-sky-100 text-sky-700 rounded font-bold text-[10px] uppercase font-mono tracking-wider animate-pulse">
                              ▼ Low
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded font-bold text-[10px] uppercase font-mono tracking-wider">
                              Normal
                            </span>
                          )
                        ) : (
                          <span className="text-[10px] font-semibold text-gray-300 uppercase tracking-wider italic">Required</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Controls */}
          <div className="flex justify-between items-center border-t border-gray-50 pt-6">
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-5 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-500 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              Diagnostic Panels
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-100 flex items-center gap-2 cursor-pointer"
            >
              Review Intake
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          STEP 4: SAVING STATE CONTROLLER
          ========================================== */}
      {currentStep === 4 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm no-print text-center space-y-6 max-w-lg mx-auto">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-blue-50">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div>
            <h3 className="font-extrabold text-gray-900 text-lg">Commit to Diagnostics Registry</h3>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Verify values are correct. Once finalized, indices are locked and prepared for official physician signature.
            </p>
          </div>

          {/* Verification mini board */}
          <div className="border border-slate-100 rounded-2xl p-5 text-left text-xs bg-slate-50 space-y-3">
            <div className="flex justify-between border-b border-gray-200/50 pb-2">
              <span className="text-gray-400 font-semibold">Patient Name</span>
              <span className="font-bold text-gray-800">{patientName}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200/50 pb-2">
              <span className="text-gray-400 font-semibold">Intake Number</span>
              <span className="font-mono font-bold text-blue-600">{reportNumber}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200/50 pb-2">
              <span className="text-gray-400 font-semibold">Active Tests Mapped</span>
              <span className="font-bold text-gray-800">{selectedTestIds.length} Panels</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-semibold">Total reporting line entries</span>
              <span className="font-bold text-gray-800">{testParameters.length} Mapped</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3.5 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleSaveReport('Draft')}
                disabled={loading}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl text-xs transition-all cursor-pointer"
              >
                Save as Pending Draft
              </button>

              <button
                type="button"
                onClick={() => handleSaveReport('Final')}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-lg shadow-blue-100 transition-all cursor-pointer"
              >
                {loading ? 'Saving...' : 'Finalize & Sign Report'}
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrevStep}
              disabled={loading}
              className="text-xs font-bold text-gray-400 hover:text-gray-600 hover:underline transition-all cursor-pointer"
            >
              Back to Results entry
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          STEP 5: PRINT PREVIEW AND DOWNLOAD
          ========================================== */}
      {currentStep === 5 && savedReportDetail && labSettings && (
        <div className="space-y-6">
          {/* Action Header - Hidden during standard Print trigger */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase rounded-full">
                  Database Synced Successfully
                </span>
              </div>
              <h2 className="text-base font-black text-gray-900 tracking-tight">Diagnostic Record Live Preview</h2>
              <p className="text-xs text-gray-400 font-medium">Verify visual layout on mock A4 paper before issuing physical printout</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3.5">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-gray-500 text-xs font-bold rounded-xl border border-gray-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                Go to Dashboard
              </button>

              <button
                onClick={() => navigate('/reports')}
                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-gray-500 text-xs font-bold rounded-xl border border-gray-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                All Records
              </button>

              <button
                onClick={handlePrint}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-100 flex items-center gap-2 cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                Print / Save PDF
              </button>
            </div>
          </div>

          {/* Full fidelity template view */}
          <LabReportPDF 
            report={savedReportDetail.report}
            patient={savedReportDetail.patient}
            results={savedReportDetail.results}
            settings={labSettings}
          />
        </div>
      )}
    </div>
  );
}
