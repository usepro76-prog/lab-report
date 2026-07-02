import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FilePlus2, 
  FileText, 
  Settings, 
  Search, 
  Activity, 
  Clock, 
  CheckCircle,
  TrendingUp,
  FileSpreadsheet,
  Trash2,
  Printer,
  ChevronRight
} from 'lucide-react';
import { dbManager } from '../db/dbManager';
import { FullReportDetail } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<FullReportDetail[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        const list = await dbManager.getReportsList();
        setReports(list);
      } catch (err) {
        console.error('Failed to load reports', err);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  // Compute stats
  const todayStr = new Date().toISOString().split('T')[0];
  const reportsToday = reports.filter(r => r.report.report_date === todayStr);
  const draftReports = reports.filter(r => r.report.status === 'Draft');
  const finalReports = reports.filter(r => r.report.status === 'Final');

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this laboratory report? This action is permanent.')) {
      const success = await dbManager.deleteReport(id);
      if (success) {
        setReports(prev => prev.filter(r => r.report.id !== id));
      }
    }
  };

  const handleQuickSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/reports?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. TOP STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Stat 1: Today's Count */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center gap-5">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
              Today's Reports
            </span>
            <span className="text-2xl font-black text-gray-900 leading-none">
              {reportsToday.length}
            </span>
            <span className="text-[10px] text-emerald-500 font-semibold block mt-1">
              +100% since morning
            </span>
          </div>
        </div>

        {/* Stat 2: Draft/Active */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center gap-5">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
              Draft / Editing
            </span>
            <span className="text-2xl font-black text-gray-900 leading-none">
              {draftReports.length}
            </span>
            <span className="text-[10px] text-amber-500 font-semibold block mt-1">
              Awaiting verification
            </span>
          </div>
        </div>

        {/* Stat 3: Completed */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center gap-5">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
              Finalized Reports
            </span>
            <span className="text-2xl font-black text-gray-900 leading-none">
              {finalReports.length}
            </span>
            <span className="text-[10px] text-emerald-500 font-semibold block mt-1">
              Printable & verified
            </span>
          </div>
        </div>

        {/* Stat 4: System database */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center gap-5">
          <div className="p-3.5 bg-purple-50 text-purple-600 rounded-xl">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
              Historical Records
            </span>
            <span className="text-2xl font-black text-gray-900 leading-none">
              {reports.length}
            </span>
            <span className="text-[10px] text-purple-500 font-semibold block mt-1">
              Fully indexed archives
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE ACTION CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Action 1: Create New Report */}
        <div 
          onClick={() => navigate('/new-report')}
          className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="h-12 w-12 bg-blue-600 rounded-xl text-white flex items-center justify-center shadow-lg shadow-blue-100 group-hover:scale-105 transition-transform mb-6">
              <FilePlus2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1 tracking-tight">Create New Report</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              Start new workflow. Input patient vitals, choose clinical tests, and fill parameters. Takes ~2 mins.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 mt-6 group-hover:gap-2.5 transition-all">
            Initiate test profile
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>

        {/* Action 2: Reports database */}
        <div 
          onClick={() => navigate('/reports')}
          className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="h-12 w-12 bg-indigo-600 rounded-xl text-white flex items-center justify-center shadow-lg shadow-indigo-100 group-hover:scale-105 transition-transform mb-6">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1 tracking-tight">Laboratory Archives</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              Browse, search, edit, or reprint existing records. Quick indexing by Patient name, mobile, or report numbers.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 mt-6 group-hover:gap-2.5 transition-all">
            Open archives
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>

        {/* Action 3: Lab Settings */}
        <div 
          onClick={() => navigate('/settings')}
          className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="h-12 w-12 bg-slate-800 rounded-xl text-white flex items-center justify-center shadow-lg shadow-slate-200 group-hover:scale-105 transition-transform mb-6">
              <Settings className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1 tracking-tight">Configure Laboratory</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              Adjust header details, upload custom logos, configure active licenses, or set up connection settings.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mt-6 group-hover:gap-2.5 transition-all">
            Configure system
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* 3. RECENT REPORTS TABLE */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-gray-900 tracking-tight">Recent Patient Intake</h3>
            <p className="text-xs text-gray-400 font-medium">Recently updated laboratory test profiles</p>
          </div>
          
          <button 
            onClick={() => navigate('/reports')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
          >
            View All Reports ({reports.length})
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Activity className="h-8 w-8 animate-spin mb-3 text-blue-500" />
            <p className="text-xs font-medium">Syncing clinical registry...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl">
            <FileSpreadsheet className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-xs font-bold text-gray-500">No diagnostic reports stored yet</p>
            <p className="text-[11px] text-gray-400 mt-1 mb-4">Create your very first patient intake file below</p>
            <button
              onClick={() => navigate('/new-report')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-100 cursor-pointer"
            >
              Start Intake Flow
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600 border-collapse">
              <thead>
                <tr className="border-b border-gray-50 text-gray-400 font-bold uppercase text-[10px] tracking-wider pb-3">
                  <th className="py-3">Intake Number</th>
                  <th className="py-3">Patient Details</th>
                  <th className="py-3 hidden sm:table-cell">Date</th>
                  <th className="py-3 hidden md:table-cell">Referring Physician</th>
                  <th className="py-3 hidden lg:table-cell">Test Panel</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-medium">
                {reports.slice(0, 5).map(({ report, patient, results }) => {
                  // Unique category list for tests in this report
                  const uniqueCategories = Array.from(new Set(results.map(r => r.category)));

                  return (
                    <tr key={report.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 font-mono font-bold text-blue-600 text-xs">
                        {report.report_number}
                      </td>
                      <td className="py-4">
                        <div className="font-bold text-gray-800">{patient.name}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{patient.age} Yrs • {patient.gender}</div>
                      </td>
                      <td className="py-4 text-gray-500 hidden sm:table-cell">
                        {report.report_date}
                      </td>
                      <td className="py-4 font-semibold text-gray-700 hidden md:table-cell">
                        {patient.doctor || 'Self'}
                      </td>
                      <td className="py-4 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {uniqueCategories.map(cat => (
                            <span key={cat} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase tracking-wide">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          report.status === 'Final' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${report.status === 'Final' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                          {report.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/new-report?reportId=${report.id}&step=5`)}
                            title="Print / PDF preview"
                            className="p-1.5 bg-gray-50 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-lg border border-gray-100 transition-colors cursor-pointer"
                          >
                            <Printer className="h-[15px] w-[15px]" />
                          </button>
                          
                          <button
                            onClick={() => navigate(`/new-report?reportId=${report.id}`)}
                            title="Edit Report"
                            className="p-1.5 bg-gray-50 hover:bg-amber-50 text-gray-500 hover:text-amber-600 rounded-lg border border-gray-100 transition-colors cursor-pointer"
                          >
                            <FileSpreadsheet className="h-[15px] w-[15px]" />
                          </button>

                          <button
                            onClick={() => handleDelete(report.id)}
                            title="Delete Report"
                            className="p-1.5 bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-lg border border-gray-100 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-[15px] w-[15px]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
