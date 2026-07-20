import { Patient, Report, LaboratorySettings } from '../types';
import { calculateFlag } from '../db/dbManager';

interface LabReportPDFProps {
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
  settings: LaboratorySettings;
}

export default function LabReportPDF({ report, patient, results, settings }: LabReportPDFProps) {
  // Group results by test_id
  const testGroups: { [testId: string]: typeof results } = {};
  results.forEach(res => {
    if (!testGroups[res.test_id]) {
      testGroups[res.test_id] = [];
    }
    testGroups[res.test_id].push(res);
  });

  const testEntries = Object.entries(testGroups);
  const totalPages = testEntries.length;

  const getPatientSpecificReference = (res: typeof results[0]) => {
    if (patient.age < 12) return res.reference_child;
    if (patient.gender === 'Female') return res.reference_female;
    return res.reference_male;
  };

  const getFlagBadge = (flag: 'Normal' | 'High' | 'Low') => {
    if (flag === 'High') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-50 border border-rose-100 text-rose-700 font-mono">
          HIGH ▲
        </span>
      );
    }
    if (flag === 'Low') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-50 border border-sky-100 text-sky-700 font-mono">
          LOW ▼
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 border border-emerald-100 text-emerald-700 font-mono">
        Normal
      </span>
    );
  };

  return (
    <div id={`report-print-${report.id}`} className="print-area space-y-12 no-print-space-y">
      {testEntries.map(([testId, testResults], index) => {
        const testName = testResults[0]?.test_name || 'Diagnostic Panel';
        const testCategory = testResults[0]?.category || 'Clinical Chemistry';
        const pageNum = index + 1;

        return (
          <div 
            key={testId} 
            className="print-page bg-white text-gray-800 p-8 sm:p-12 border border-gray-100 rounded-2xl shadow-sm max-w-[800px] mx-auto flex flex-col justify-between min-h-[1050px]"
            style={{ pageBreakAfter: pageNum < totalPages ? 'always' : 'avoid' }}
          >
            <div>
              {/* 1. CLINICAL LETTERHEAD */}
              <div className="flex flex-col sm:flex-row items-start justify-between border-b-2 border-blue-600 pb-5 mb-5">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl font-black shadow-md shadow-blue-100 uppercase">
                    {settings.lab_name.charAt(0)}
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-gray-900 leading-tight tracking-tight uppercase">
                      {settings.lab_name}
                    </h1>
                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-0.5">
                      Accredited Clinical Reference Laboratory
                    </p>
                    <p className="text-[10px] text-gray-400 font-semibold">
                      License #: {settings.license_number || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="text-right mt-3 sm:mt-0 text-[11px] text-gray-500 font-medium space-y-0.5">
                  <p className="font-bold text-gray-800 text-xs">{settings.address}</p>
                  <p>Phone: {settings.phone}</p>
                  <p>Email: {settings.email}</p>
                </div>
              </div>

              {/* 2. REPEATED PATIENT BIO INFORMATION */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-3.5 gap-x-5 bg-slate-50 border border-slate-100 rounded-xl p-4 mb-5 text-[11px]">
                <div>
                  <span className="text-gray-400 block font-bold uppercase text-[8px] tracking-wider mb-0.5">Patient Name</span>
                  <p className="font-bold text-gray-900 text-xs">{patient.name}</p>
                </div>
                <div>
                  <span className="text-gray-400 block font-bold uppercase text-[8px] tracking-wider mb-0.5">Age / Gender</span>
                  <p className="font-bold text-gray-900">{patient.age} Yrs / {patient.gender}</p>
                </div>
                <div>
                  <span className="text-gray-400 block font-bold uppercase text-[8px] tracking-wider mb-0.5">Report Number</span>
                  <p className="font-mono font-bold text-blue-600">{report.report_number}</p>
                </div>
                <div>
                  <span className="text-gray-400 block font-bold uppercase text-[8px] tracking-wider mb-0.5">Report Date</span>
                  <p className="font-semibold text-gray-900">{report.report_date}</p>
                </div>

                <div>
                  <span className="text-gray-400 block font-bold uppercase text-[8px] tracking-wider mb-0.5">Referring Physician</span>
                  <p className="font-bold text-gray-800">{patient.doctor || 'Self Referral'}</p>
                </div>
                <div>
                  <span className="text-gray-400 block font-bold uppercase text-[8px] tracking-wider mb-0.5">Mobile Contact</span>
                  <p className="font-medium text-gray-800">{patient.mobile || '—'}</p>
                </div>
                <div>
                  <span className="text-gray-400 block font-bold uppercase text-[8px] tracking-wider mb-0.5">Sample Collection</span>
                  <p className="font-medium text-gray-800">{report.report_date} (Diagnostic)</p>
                </div>
                <div>
                  <span className="text-gray-400 block font-bold uppercase text-[8px] tracking-wider mb-0.5">Report Status</span>
                  <p className="font-bold text-emerald-600 uppercase text-[10px] flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block"></span>
                    {report.status}
                  </p>
                </div>
              </div>

              {/* 3. TEST PROFILE HEADING */}
              <div className="bg-blue-50/60 border-l-4 border-blue-600 px-4 py-2 mb-4 rounded-r-lg flex items-center justify-between">
                <div>
                  <span className="text-[8px] font-extrabold text-blue-500 uppercase tracking-wider block">
                    {testCategory}
                  </span>
                  <h3 className="font-black text-blue-900 text-xs tracking-wide uppercase">
                    {testName}
                  </h3>
                </div>
                <span className="text-[10px] text-blue-600 font-bold uppercase font-mono">
                  Page {pageNum} of {totalPages}
                </span>
              </div>

              {/* 4. CLINICAL BIOCHEMICAL RESULTS TABLE */}
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase text-[8px] tracking-wider">
                      <th className="py-2 w-6/12">Investigation / Parameter</th>
                      <th className="py-2 text-center w-2/12">Observed Value</th>
                      <th className="py-2 text-center w-2/12">Unit</th>
                      <th className="py-2 text-center w-2/12">Reference Interval</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {testResults.map(res => {
                      // Live evaluation of flag to prevent mismatch
                      const computedFlag = calculateFlag(res.result, patient.gender, Number(patient.age), {
                        reference_male: res.reference_male,
                        reference_female: res.reference_female,
                        reference_child: res.reference_child
                      } as any);

                      return (
                        <tr key={res.parameter_id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-2 font-semibold text-gray-800">
                            {res.parameter_name}
                          </td>
                          <td className={`py-2 text-center font-mono font-bold text-xs ${
                            computedFlag === 'High' ? 'text-rose-600' : computedFlag === 'Low' ? 'text-sky-600' : 'text-gray-900'
                          }`}>
                            {res.result || '—'}
                          </td>
                          <td className="py-2 text-center text-gray-400 font-medium">
                            {res.unit || '—'}
                          </td>
                          <td className="py-2 text-center text-gray-500 font-mono font-medium">
                            {getPatientSpecificReference(res) || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom items kept aligned at page bottom */}
            <div>
              {/* 5. CLINICAL REMARKS (Only if remarks are added for patient) */}
              {patient.remarks && (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-6 text-[10px]">
                  <span className="font-bold text-gray-700 block mb-0.5">Clinical Correlation & Recommendations:</span>
                  <p className="text-gray-600 italic leading-relaxed">{patient.remarks}</p>
                </div>
              )}

              {/* 6. VERIFIED DUAL-SIGNATURE BLOCK */}
              <div className="grid grid-cols-2 gap-8 pt-5 border-t border-gray-100 mt-6 text-center text-[10px]">
                <div>
                  <div className="h-6 flex items-end justify-center pb-0.5">
                    <span className="font-mono text-gray-400 text-[9px] italic">Verified Digitally</span>
                  </div>
                  <div className="border-t border-gray-200 w-44 mx-auto pt-1.5">
                    <p className="font-bold text-gray-800">{settings.technician_name}</p>
                    <p className="text-[9px] text-gray-400">Chief Medical Technologist</p>
                  </div>
                </div>

                <div>
                  <div className="h-6 flex items-end justify-center pb-0.5">
                    <span className="font-mono text-gray-400 text-[9px] italic">Authorized Signature</span>
                  </div>
                  <div className="border-t border-gray-200 w-44 mx-auto pt-1.5">
                    <p className="font-bold text-gray-800">Dr. Helena Vance, MD</p>
                    <p className="text-[9px] text-gray-400">Consultant Pathologist</p>
                  </div>
                </div>
              </div>

              {/* 7. END OF SHEET DISCLAIMER */}
              <div className="mt-5 text-center text-[9px] text-gray-400 border-t border-gray-50 pt-2.5 font-mono">
                <p>This report is generated securely by LabSuite Laboratory Report Management System.</p>
                <p>Values exceeding reference parameters require physician evaluation. | END OF PAGE {pageNum}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
