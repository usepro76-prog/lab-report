import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  FileText, 
  Calendar, 
  User, 
  Activity, 
  Printer, 
  Edit3, 
  Trash2, 
  Filter, 
  AlertCircle,
  Clock,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import { dbManager } from '../db/dbManager';
import { FullReportDetail } from '../types';

export default function ReportsList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [reports, setReports] = useState<FullReportDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering criteria
  const urlSearchQuery = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(urlSearchQuery);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        const data = await dbManager.getReportsList();
        setReports(data);
      } catch (err: any) {
        console.error('Failed to query reports', err);
        setError('Failed to sync clinical databases.');
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  // Sync state if URL query changes
  useEffect(() => {
    if (urlSearchQuery) {
      setSearchTerm(urlSearchQuery);
    }
  }, [urlSearchQuery]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this laboratory report? This action is permanent and cannot be undone.')) {
      try {
        const success = await dbManager.deleteReport(id);
        if (success) {
          setReports(prev => prev.filter(r => r.report.id !== id));
        } else {
          alert('Failed to delete report.');
        }
      } catch (err) {
        console.error(err);
        alert('An error occurred during deletion.');
      }
    }
  };

  // Compute list of categories for filter dropdown
  const categoriesList = Array.from(
    new Set(reports.flatMap(r => r.results.map(res => res.category)))
  );

  // Filter & Search Logic
  const filteredReports = reports.filter(({ report, patient, results }) => {
    // 1. Text Search matches patient name, doctor, report number, or mobile
    const term = searchTerm.toLowerCase().trim();
    const matchesText = !term || 
      patient.name.toLowerCase().includes(term) ||
      (patient.mobile && patient.mobile.toLowerCase().includes(term)) ||
      report.report_number.toLowerCase().includes(term) ||
      patient.doctor.toLowerCase().includes(term);

    // 2. Status match
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;

    // 3. Category match
    const matchesCategory = categoryFilter === 'all' || 
      results.some(res => res.category.toLowerCase() === categoryFilter.toLowerCase());

    // 4. Date match
    const matchesDate = !dateFilter || report.report_date === dateFilter;

    return matchesText && matchesStatus && matchesCategory && matchesDate;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. FILTERING PANEL CARD */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h1 className="text-base font-bold text-gray-900 tracking-tight">Search Clinical Registry</h1>
          <p className="text-xs text-gray-400 font-medium">Instantly isolate diagnostic records using search strings and parameters</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Quick Search string input */}
          <div className="relative md:col-span-1">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Patient Name, Mobile, LAB-ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2 pl-9 pr-3 text-xs font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2 px-3.5 text-xs font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 appearance-none cursor-pointer"
            >
              <option value="all">All Report Statuses</option>
              <option value="Final">Finalized / Signed</option>
              <option value="Draft">Pending Drafts</option>
            </select>
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2 px-3.5 text-xs font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 appearance-none cursor-pointer"
            >
              <option value="all">All Diagnostic Panels</option>
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Date Selector */}
          <div className="relative">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2 px-3 text-xs font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 2. REGISTRY RESULTS GRID */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-100 rounded-2xl">
          <Activity className="h-8 w-8 animate-spin text-blue-500 mb-3" />
          <p className="text-xs font-semibold text-gray-400">Loading electronic registry database...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl max-w-lg mx-auto">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-sm font-bold text-gray-600">No diagnostic files match criteria</p>
          <p className="text-xs text-gray-400 mt-1 mb-6">Verify parameters or register a new patient intake record</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setCategoryFilter('all');
              setDateFilter('');
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600 border-collapse">
              <thead>
                <tr className="border-b border-gray-50 text-gray-400 font-bold uppercase text-[9px] tracking-wider">
                  <th className="py-4 pl-6">Report Identifier</th>
                  <th className="py-4">Patient Profile</th>
                  <th className="py-4 hidden md:table-cell">Intake Date</th>
                  <th className="py-4 hidden sm:table-cell">Referring Doctor</th>
                  <th className="py-4 hidden lg:table-cell">Diagnostic Panels</th>
                  <th className="py-4 text-center hidden lg:table-cell">Observed Lines</th>
                  <th className="py-4">Status</th>
                  <th className="py-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-medium">
                {filteredReports.map(({ report, patient, results }) => {
                  const uniqueCategories = Array.from(new Set(results.map(r => r.category)));

                  return (
                    <tr key={report.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* ID */}
                      <td className="py-4 pl-6 font-mono font-bold text-blue-600 text-xs">
                        {report.report_number}
                      </td>

                      {/* PATIENT */}
                      <td className="py-4">
                        <div className="font-bold text-gray-800 text-xs">{patient.name}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{patient.age} Yrs • {patient.gender} • {patient.mobile || 'No Mobile'}</div>
                      </td>

                      {/* DATE */}
                      <td className="py-4 text-gray-500 font-semibold hidden md:table-cell">
                        {report.report_date}
                      </td>

                      {/* DOCTOR */}
                      <td className="py-4 font-bold text-gray-700 text-[11px] hidden sm:table-cell">
                        {patient.doctor}
                      </td>

                      {/* PANELS */}
                      <td className="py-4 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {uniqueCategories.map(cat => (
                            <span key={cat} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-bold uppercase tracking-wide">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* COUNTS */}
                      <td className="py-4 text-center font-mono font-bold text-gray-500 hidden lg:table-cell">
                        {results.length}
                      </td>

                      {/* STATUS */}
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          report.status === 'Final' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${report.status === 'Final' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                          {report.status}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="py-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/new-report?reportId=${report.id}&step=5`)}
                            title="Print / PDF preview"
                            className="p-1.5 bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-blue-600 border border-gray-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => navigate(`/new-report?reportId=${report.id}`)}
                            title="Edit Record"
                            className="p-1.5 bg-gray-50 hover:bg-amber-50 text-gray-400 hover:text-amber-600 border border-gray-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(report.id)}
                            title="Delete Record"
                            className="p-1.5 bg-gray-50 hover:bg-rose-50 text-gray-400 hover:text-rose-600 border border-gray-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
