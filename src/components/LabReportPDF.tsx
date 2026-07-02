import { Patient, Report, TestParameter, LaboratorySettings } from '../types';

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
  // Group results by category
  const categoriesMap: { [key: string]: typeof results } = {};
  results.forEach(res => {
    const groupName = `${res.category} - ${res.test_name}`;
    if (!categoriesMap[groupName]) {
      categoriesMap[groupName] = [];
    }
    categoriesMap[groupName].push(res);
  });

  const getPatientSpecificReference = (res: typeof results[0]) => {
    if (patient.age < 12) return res.reference_child;
    if (patient.gender === 'Female') return res.reference_female;
    return res.reference_male;
  };

  const getFlagBadge = (flag: 'Normal' | 'High' | 'Low') => {
    if (flag === 'High') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100 font-mono">
          HIGH ▲
        </span>
      );
    }
    if (flag === 'Low') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-100 font-mono">
          LOW ▼
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 font-mono">
        Normal
      </span>
    );
  };

  return (
    <div id={`report-print-${report.id}`} className="print-area bg-white text-gray-800 p-4 sm:p-8 md:p-12 border border-gray-100 rounded-2xl shadow-sm max-w-[800px] mx-auto">
      {/* 1. REPORT HEADER */}
      <div className="flex flex-col sm:flex-row items-start justify-between border-b-2 border-blue-600 pb-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-md shadow-blue-100">
            {settings.lab_name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 leading-tight tracking-tight uppercase">
              {settings.lab_name}
            </h1>
            <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">
              Accredited Clinical Reference Laboratory
            </p>
            <p className="text-xs text-gray-400 font-semibold max-w-sm">
              License #: {settings.license_number || 'N/A'}
            </p>
          </div>
        </div>

        <div className="text-right mt-4 sm:mt-0 text-xs text-gray-500 font-medium space-y-0.5">
          <p className="font-bold text-gray-800 text-[13px]">{settings.address}</p>
          <p>Phone: {settings.phone}</p>
          <p>Email: {settings.email}</p>
          <p className="text-[10px] text-gray-400">Hours: Mon-Sat: 07:00 AM - 08:00 PM</p>
        </div>
      </div>

      {/* 2. PATIENT BIO GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6 bg-slate-50 border border-slate-100 rounded-xl p-4 mb-6 text-xs">
        <div>
          <span className="text-gray-400 block font-semibold uppercase text-[9px] tracking-wider mb-0.5">Patient Name</span>
          <p className="font-bold text-gray-900 text-sm">{patient.name}</p>
        </div>
        <div>
          <span className="text-gray-400 block font-semibold uppercase text-[9px] tracking-wider mb-0.5">Age / Gender</span>
          <p className="font-bold text-gray-900">{patient.age} Yrs / {patient.gender}</p>
        </div>
        <div>
          <span className="text-gray-400 block font-semibold uppercase text-[9px] tracking-wider mb-0.5">Report Number</span>
          <p className="font-mono font-bold text-blue-600 text-[13px]">{report.report_number}</p>
        </div>
        <div>
          <span className="text-gray-400 block font-semibold uppercase text-[9px] tracking-wider mb-0.5">Report Date</span>
          <p className="font-semibold text-gray-900">{report.report_date}</p>
        </div>

        <div>
          <span className="text-gray-400 block font-semibold uppercase text-[9px] tracking-wider mb-0.5">Referring Physician</span>
          <p className="font-bold text-gray-800">{patient.doctor || 'Self Referral'}</p>
        </div>
        <div>
          <span className="text-gray-400 block font-semibold uppercase text-[9px] tracking-wider mb-0.5">Mobile Contact</span>
          <p className="font-medium text-gray-800">{patient.mobile || '—'}</p>
        </div>
        <div>
          <span className="text-gray-400 block font-semibold uppercase text-[9px] tracking-wider mb-0.5">Sample Collection</span>
          <p className="font-medium text-gray-800">{report.report_date} (Diagnostic)</p>
        </div>
        <div>
          <span className="text-gray-400 block font-semibold uppercase text-[9px] tracking-wider mb-0.5">Report Status</span>
          <p className="font-bold text-emerald-600 uppercase text-[11px] flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block"></span>
            {report.status}
          </p>
        </div>
      </div>

      {/* 3. TEST RESULTS TABLE */}
      <div className="mb-6 overflow-hidden">
        {Object.entries(categoriesMap).map(([catName, resList]) => (
          <div key={catName} className="mb-6 last:mb-0">
            {/* Category Header */}
            <div className="bg-blue-50 border-l-4 border-blue-600 px-3 py-1.5 mb-2 rounded-r-lg">
              <h3 className="font-extrabold text-blue-900 text-xs tracking-wide uppercase">
                {catName}
              </h3>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-bold text-[10px] uppercase tracking-wider">
                    <th className="py-2.5 w-1/3">Investigation / Parameter</th>
                    <th className="py-2.5 text-center">Observed Value</th>
                    <th className="py-2.5 text-center">Unit</th>
                    <th className="py-2.5 text-center">Reference Interval</th>
                    <th className="py-2.5 text-right">Interpretive Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {resList.map(res => (
                    <tr key={res.parameter_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 font-semibold text-gray-800">
                        {res.parameter_name}
                      </td>
                      <td className={`py-2.5 text-center font-mono font-bold text-sm ${
                        res.flag === 'High' ? 'text-rose-600' : res.flag === 'Low' ? 'text-sky-600' : 'text-gray-900'
                      }`}>
                        {res.result}
                      </td>
                      <td className="py-2.5 text-center text-gray-400 font-medium">
                        {res.unit || '—'}
                      </td>
                      <td className="py-2.5 text-center text-gray-500 font-mono font-medium">
                        {getPatientSpecificReference(res) || '—'}
                      </td>
                      <td className="py-2.5 text-right">
                        {getFlagBadge(res.flag)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* 4. REMARKS & REASONING SECTION */}
      {patient.remarks && (
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-8 text-xs">
          <span className="font-bold text-gray-700 block mb-1">Remarks & Recommendations:</span>
          <p className="text-gray-600 italic leading-relaxed">{patient.remarks}</p>
        </div>
      )}

      {/* 5. SIGNATURE FOOTER */}
      <div className="grid grid-cols-2 gap-8 pt-10 border-t border-gray-100 mt-12 text-center text-xs">
        <div>
          <div className="h-10 flex items-end justify-center pb-1">
            <span className="font-mono text-gray-400 text-[10px] italic">Verified Digitally</span>
          </div>
          <div className="border-t border-gray-200 w-48 mx-auto pt-2">
            <p className="font-bold text-gray-800">{settings.technician_name}</p>
            <p className="text-[10px] text-gray-400">Chief Medical Technologist</p>
          </div>
        </div>

        <div>
          <div className="h-10 flex items-end justify-center pb-1">
            <span className="font-mono text-gray-400 text-[10px] italic">Authorized Signature</span>
          </div>
          <div className="border-t border-gray-200 w-48 mx-auto pt-2">
            <p className="font-bold text-gray-800">Dr. Helena Vance, MD</p>
            <p className="text-[10px] text-gray-400">Consultant Pathologist</p>
          </div>
        </div>
      </div>

      {/* 6. TECHNICAL FOOTER */}
      <div className="mt-12 text-center text-[10px] text-gray-400 border-t border-gray-50 pt-4 font-mono">
        <p>This report is generated securely by LabSuite Laboratory Report Management System.</p>
        <p>Values exceeding reference parameters require physician evaluation. | END OF REPORT</p>
      </div>
    </div>
  );
}
