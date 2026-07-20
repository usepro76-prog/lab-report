import { useState, useEffect, FormEvent } from 'react';
import { 
  Settings, Check, Save, Info, Plus, Trash2, Search, 
  Database, Sliders, Edit, Activity, ChevronRight, AlertTriangle 
} from 'lucide-react';
import { dbManager } from '../db/dbManager';
import { LaboratorySettings, Test, TestParameter } from '../types';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'tests'>('profile');

  // --- TAB 1: PROFILE STATE ---
  const [labName, setLabName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [technicianName, setTechnicianName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [successProfile, setSuccessProfile] = useState(false);

  // --- TAB 2: DYNAMIC TEST CATALOG STATE ---
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [testParameters, setTestParameters] = useState<TestParameter[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states for Test Panels
  const [isEditingTest, setIsEditingTest] = useState(false);
  const [testFormName, setTestFormName] = useState('');
  const [testFormCategory, setTestFormCategory] = useState('');
  const [testFormDescription, setTestFormDescription] = useState('');
  const [testFormId, setTestFormId] = useState<string | null>(null);

  // Form states for Parameters
  const [isEditingParam, setIsEditingParam] = useState(false);
  const [paramFormId, setParamFormId] = useState<string | null>(null);
  const [paramFormName, setParamFormName] = useState('');
  const [paramFormUnit, setParamFormUnit] = useState('');
  const [paramFormMale, setParamFormMale] = useState('');
  const [paramFormFemale, setParamFormFemale] = useState('');
  const [paramFormChild, setParamFormChild] = useState('');
  const [paramFormOrder, setParamFormOrder] = useState<number>(1);

  // Status/feedback states
  const [testFeedback, setTestFeedback] = useState('');
  const [paramFeedback, setParamFeedback] = useState('');

  // --- INITS & FETCHERS ---
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

  useEffect(() => {
    async function loadTests() {
      const allTests = await dbManager.getTests();
      setTests(allTests);
      if (allTests.length > 0 && !selectedTest) {
        setSelectedTest(allTests[0]);
      }
    }
    loadTests();
  }, [activeTab]);

  useEffect(() => {
    async function loadParams() {
      if (selectedTest) {
        const params = await dbManager.getParametersByTestId(selectedTest.id);
        setTestParameters(params);
      } else {
        setTestParameters([]);
      }
    }
    loadParams();
  }, [selectedTest]);

  // --- ACTIONS: PROFILE ---
  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setSuccessProfile(false);

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
      localStorage.setItem('lab_current_user', technicianName);
      setSuccessProfile(true);
      setTimeout(() => setSuccessProfile(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to save laboratory profile settings.');
    } finally {
      setSavingProfile(false);
    }
  };

  // --- ACTIONS: TEST PANELS ---
  const handleOpenCreateTest = () => {
    setTestFormId(null);
    setTestFormName('');
    setTestFormCategory('Biochemistry');
    setTestFormDescription('');
    setIsEditingTest(true);
  };

  const handleOpenEditTest = (test: Test) => {
    setTestFormId(test.id);
    setTestFormName(test.test_name);
    setTestFormCategory(test.category);
    setTestFormDescription(test.description);
    setIsEditingTest(true);
  };

  const handleSaveTest = async (e: FormEvent) => {
    e.preventDefault();
    if (!testFormName.trim() || !testFormCategory.trim()) return;

    try {
      const id = testFormId || `t-${Date.now()}`;
      const saved = await dbManager.saveTest({
        id,
        test_name: testFormName.trim(),
        category: testFormCategory.trim(),
        description: testFormDescription.trim()
      });

      const updatedTests = await dbManager.getTests();
      setTests(updatedTests);
      setSelectedTest(saved);
      setIsEditingTest(false);
      
      setTestFeedback('Test panel saved successfully.');
      setTimeout(() => setTestFeedback(''), 3000);
    } catch (err) {
      console.error(err);
      alert('Error saving test panel.');
    }
  };

  const handleDeleteTest = async (testId: string) => {
    if (!confirm('Are you sure you want to delete this entire test panel and all its parameters? This action cannot be undone.')) {
      return;
    }

    try {
      await dbManager.deleteTest(testId);
      const updatedTests = await dbManager.getTests();
      setTests(updatedTests);
      if (updatedTests.length > 0) {
        setSelectedTest(updatedTests[0]);
      } else {
        setSelectedTest(null);
      }
      setTestFeedback('Test panel and linked parameters removed.');
      setTimeout(() => setTestFeedback(''), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to delete test panel.');
    }
  };

  // --- ACTIONS: TEST PARAMETERS ---
  const handleOpenCreateParam = () => {
    if (!selectedTest) return;
    setParamFormId(null);
    setParamFormName('');
    setParamFormUnit('');
    setParamFormMale('');
    setParamFormFemale('');
    setParamFormChild('');
    setParamFormOrder(testParameters.length + 1);
    setIsEditingParam(true);
  };

  const handleOpenEditParam = (param: TestParameter) => {
    setParamFormId(param.id);
    setParamFormName(param.parameter_name);
    setParamFormUnit(param.unit);
    setParamFormMale(param.reference_male);
    setParamFormFemale(param.reference_female);
    setParamFormChild(param.reference_child);
    setParamFormOrder(param.display_order);
    setIsEditingParam(true);
  };

  const handleSaveParam = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedTest || !paramFormName.trim()) return;

    try {
      const id = paramFormId || `p-${Date.now()}`;
      await dbManager.saveParameter({
        id,
        test_id: selectedTest.id,
        parameter_name: paramFormName.trim(),
        unit: paramFormUnit.trim(),
        reference_male: paramFormMale.trim() || 'Negative',
        reference_female: paramFormFemale.trim() || 'Negative',
        reference_child: paramFormChild.trim() || 'Negative',
        display_order: Number(paramFormOrder) || 1
      });

      const params = await dbManager.getParametersByTestId(selectedTest.id);
      setTestParameters(params);
      setIsEditingParam(false);

      setParamFeedback('Parameter updated successfully.');
      setTimeout(() => setParamFeedback(''), 3000);
    } catch (err) {
      console.error(err);
      alert('Error saving parameter.');
    }
  };

  const handleDeleteParam = async (paramId: string) => {
    if (!confirm('Are you sure you want to remove this parameter?')) return;

    try {
      await dbManager.deleteParameter(paramId);
      if (selectedTest) {
        const params = await dbManager.getParametersByTestId(selectedTest.id);
        setTestParameters(params);
      }
      setParamFeedback('Parameter deleted.');
      setTimeout(() => setParamFeedback(''), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to delete parameter.');
    }
  };

  const filteredTests = tests.filter(test => {
    const q = searchQuery.toLowerCase();
    return test.test_name.toLowerCase().includes(q) || test.category.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-12">
      
      {/* Tab Selector Nav Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-gray-900 text-base">LIMS Configuration Engine</h1>
            <p className="text-[11px] text-gray-400">Manage client headers, department test profiles, formulas, and parameters</p>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-100'
            }`}
          >
            <Settings className="h-4 w-4" />
            Laboratory Profile
          </button>
          
          <button
            onClick={() => {
              setActiveTab('tests');
              setIsEditingTest(false);
              setIsEditingParam(false);
            }}
            className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'tests'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-100'
            }`}
          >
            <Database className="h-4 w-4" />
            Customize Tests
          </button>
        </div>
      </div>

      {/* --- TAB 1: LABORATORY PROFILE --- */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Editable settings form */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-sm">Header Branding & Details</h2>
                <p className="text-[11px] text-gray-400">Modify print letterheads, clinical contacts, and signature details</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
              {successProfile && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl font-bold flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  Laboratory profile settings successfully synced with DB.
                </div>
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
                    type="text"
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
                  This identity is stamped digitally on PDF report verify-blocks.
                </span>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-100 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Save className="h-4 w-4" />
                {savingProfile ? 'Saving...' : 'Save Configuration'}
              </button>
            </form>
          </div>

          {/* Right Column: Predefined Test Catalog guidelines info */}
          <div className="space-y-6">
            <div className="bg-blue-50/50 border border-blue-100/50 rounded-2xl p-6 shadow-sm">
              <h4 className="text-xs font-extrabold text-blue-900 uppercase tracking-wide mb-2 flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600" />
                Database Settings
              </h4>
              <p className="text-[11px] text-blue-800/80 leading-normal mb-3">
                Any modifications saved here are updated dynamically in the main database registry.
              </p>
              <p className="text-[11px] text-blue-800/80 leading-normal">
                Use the <span className="font-bold">Customize Tests</span> tab at the top right to dynamically add, edit, or remove analytical tests for your clinical facility.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: CUSTOMIZE DIAGNOSTIC TESTS & PARAMETERS --- */}
      {activeTab === 'tests' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (12-col layout: 4-cols for Test Panels list) */}
          <div className="lg:col-span-4 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-50 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-blue-600" />
                <span className="font-bold text-gray-900 text-xs uppercase tracking-wide">Test Panels</span>
              </div>
              <button
                type="button"
                onClick={handleOpenCreateTest}
                className="px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold rounded-lg text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="h-3 w-3 stroke-[3]" /> Add Panel
              </button>
            </div>

            {testFeedback && (
              <div className="p-2.5 bg-blue-50 text-blue-800 border border-blue-100 rounded-xl text-[10px] font-bold">
                {testFeedback}
              </div>
            )}

            {/* Search filter */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search panels or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
              />
            </div>

            {/* Test Panels List */}
            <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
              {filteredTests.length === 0 ? (
                <div className="p-8 text-center text-gray-400 font-medium text-[11px] italic">
                  No panels found
                </div>
              ) : (
                filteredTests.map(test => {
                  const isSelected = selectedTest?.id === test.id;
                  return (
                    <div
                      key={test.id}
                      onClick={() => {
                        setSelectedTest(test);
                        setIsEditingTest(false);
                        setIsEditingParam(false);
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-blue-50/70 border-blue-200'
                          : 'bg-white border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[8px] font-extrabold uppercase tracking-wide">
                            {test.category}
                          </span>
                        </div>
                        <h4 className="font-bold text-gray-800 text-xs truncate">
                          {test.test_name}
                        </h4>
                        <p className="text-[10px] text-gray-400 truncate font-medium">
                          {test.description || 'No description provided'}
                        </p>
                      </div>
                      <ChevronRight className={`h-4 w-4 shrink-0 transition-transform mt-2 ${
                        isSelected ? 'text-blue-500 translate-x-0.5' : 'text-gray-300'
                      }`} />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column (12-col layout: 8-cols for detail/parameters list) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. EDITING / CREATING A TEST PANEL */}
            {isEditingTest ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                  <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wide">
                    {testFormId ? 'Edit Panel Profile' : 'Configure New Test Panel'}
                  </h3>
                  <button
                    onClick={() => setIsEditingTest(false)}
                    className="text-[10px] font-bold text-gray-400 hover:text-gray-600"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleSaveTest} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Test Panel Name *</label>
                      <input
                        type="text"
                        required
                        value={testFormName}
                        onChange={(e) => setTestFormName(e.target.value)}
                        placeholder="e.g. Liver Function Test (LFT)"
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2 px-3 text-xs font-bold text-gray-800 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Category / Department *</label>
                      <select
                        required
                        value={testFormCategory}
                        onChange={(e) => setTestFormCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2 px-3 text-xs font-semibold text-gray-800 focus:outline-none"
                      >
                        <option value="Biochemistry">Biochemistry</option>
                        <option value="Hematology">Hematology</option>
                        <option value="Lipid Profile">Lipid Profile</option>
                        <option value="Liver Function">Liver Function</option>
                        <option value="Kidney Function">Kidney Function</option>
                        <option value="Hormones">Hormones</option>
                        <option value="Urine">Urine / Urinalysis</option>
                        <option value="Immunology">Immunology</option>
                        <option value="Microbiology">Microbiology</option>
                        <option value="Other">Other Department</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description (Clinical Purpose)</label>
                    <textarea
                      value={testFormDescription}
                      onChange={(e) => setTestFormDescription(e.target.value)}
                      placeholder="Specify test indications, screening guidelines..."
                      rows={2}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2 px-3 text-xs font-semibold text-gray-800 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Save Test Panel
                  </button>
                </form>
              </div>
            ) : selectedTest ? (
              
              /* SHOW SELECTED TEST PANEL INFO & LFT TABLE */
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
                
                {/* Header detail */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-4">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-extrabold uppercase tracking-wider">
                      {selectedTest.category}
                    </span>
                    <h2 className="font-extrabold text-gray-900 text-sm">
                      {selectedTest.test_name}
                    </h2>
                    <p className="text-[10px] text-gray-400 font-medium leading-normal max-w-xl">
                      {selectedTest.description || 'No description configured for this test panel.'}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditTest(selectedTest)}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-gray-600 font-bold rounded-lg text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit className="h-3 w-3 text-gray-400" /> Edit Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTest(selectedTest.id)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-lg text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3 text-rose-400" /> Delete
                    </button>
                  </div>
                </div>

                {/* 2. PARAMETERS SUB-EDITOR SECTION */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wide">Chemical Parameter Registry</h3>
                      <p className="text-[10px] text-gray-400">All metrics mapped to this profile</p>
                    </div>

                    <button
                      type="button"
                      disabled={isEditingParam}
                      onClick={handleOpenCreateParam}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold rounded-lg text-[10px] flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Plus className="h-3 w-3 stroke-[3]" /> Add Parameter
                    </button>
                  </div>

                  {paramFeedback && (
                    <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-[10px] font-bold">
                      {paramFeedback}
                    </div>
                  )}

                  {/* 3. EDIT PARAMETER INLINE FORM */}
                  {isEditingParam && (
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-200/50 pb-2.5">
                        <span className="font-bold text-gray-800 text-[11px] uppercase tracking-wide">
                          {paramFormId ? 'Modify Parameter' : 'Register New Biochemical Parameter'}
                        </span>
                        <button 
                          onClick={() => setIsEditingParam(false)} 
                          className="text-[10px] font-bold text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      <form onSubmit={handleSaveParam} className="space-y-4 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Parameter Name *</label>
                            <input
                              type="text"
                              required
                              value={paramFormName}
                              onChange={(e) => setParamFormName(e.target.value)}
                              placeholder="e.g. Total Bilirubin"
                              className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-2.5 font-bold text-gray-800 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Display Unit</label>
                            <input
                              type="text"
                              value={paramFormUnit}
                              onChange={(e) => setParamFormUnit(e.target.value)}
                              placeholder="e.g. mg/dL, %"
                              className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-2.5 font-semibold text-gray-800 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-slate-100">
                          <div>
                            <label className="block text-[9px] font-extrabold text-blue-600 uppercase tracking-wider mb-1">Male Ref Range *</label>
                            <input
                              type="text"
                              required
                              value={paramFormMale}
                              onChange={(e) => setParamFormMale(e.target.value)}
                              placeholder="e.g. 13.5 - 17.5"
                              className="w-full bg-slate-50 border border-gray-200 rounded-lg py-1.5 px-2.5 font-bold text-gray-800 focus:outline-none focus:bg-white text-[11px]"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-extrabold text-pink-600 uppercase tracking-wider mb-1">Female Ref Range *</label>
                            <input
                              type="text"
                              required
                              value={paramFormFemale}
                              onChange={(e) => setParamFormFemale(e.target.value)}
                              placeholder="e.g. 12.0 - 15.5"
                              className="w-full bg-slate-50 border border-gray-200 rounded-lg py-1.5 px-2.5 font-bold text-gray-800 focus:outline-none focus:bg-white text-[11px]"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-extrabold text-indigo-600 uppercase tracking-wider mb-1">Child Ref Range *</label>
                            <input
                              type="text"
                              required
                              value={paramFormChild}
                              onChange={(e) => setParamFormChild(e.target.value)}
                              placeholder="e.g. 11.0 - 14.5"
                              className="w-full bg-slate-50 border border-gray-200 rounded-lg py-1.5 px-2.5 font-bold text-gray-800 focus:outline-none focus:bg-white text-[11px]"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider shrink-0">Display Order:</label>
                            <input
                              type="number"
                              required
                              min={1}
                              value={paramFormOrder}
                              onChange={(e) => setParamFormOrder(Number(e.target.value))}
                              className="w-16 bg-white border border-gray-200 rounded-lg py-1 text-center font-bold text-gray-800"
                            />
                          </div>

                          <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Save className="h-3 w-3" />
                            Save Parameter
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* 4. PARAMETERS TABLE */}
                  <div className="overflow-x-auto border border-gray-100 rounded-xl">
                    <table className="w-full text-left text-xs text-gray-600 border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[9px] tracking-wider">
                          <th className="py-2.5 px-4 w-12 text-center">Order</th>
                          <th className="py-2.5 px-2">Investigation Parameter</th>
                          <th className="py-2.5 px-2 text-center">Unit</th>
                          <th className="py-2.5 px-2 text-center">Male Ref</th>
                          <th className="py-2.5 px-2 text-center">Female Ref</th>
                          <th className="py-2.5 px-2 text-center">Child Ref</th>
                          <th className="py-2.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {testParameters.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-gray-400 italic font-medium">
                              No biochemical parameters mapped to this test panel yet. Click "+ Add Parameter" above.
                            </td>
                          </tr>
                        ) : (
                          testParameters.map((p) => {
                            const isFormula = p.parameter_name.toLowerCase().includes('calculated');
                            return (
                              <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-3 px-4 text-center font-mono font-semibold text-gray-400">
                                  {p.display_order}
                                </td>
                                <td className="py-3 px-2 font-bold text-gray-800">
                                  {p.parameter_name}
                                  {isFormula && (
                                    <span className="ml-1.5 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[8px] font-bold uppercase tracking-wide inline-block">
                                      Formula
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-2 text-center text-gray-400 font-medium">
                                  {p.unit || '—'}
                                </td>
                                <td className="py-3 px-2 text-center font-mono font-medium text-gray-500 text-[11px]">
                                  {p.reference_male}
                                </td>
                                <td className="py-3 px-2 text-center font-mono font-medium text-gray-500 text-[11px]">
                                  {p.reference_female}
                                </td>
                                <td className="py-3 px-2 text-center font-mono font-medium text-gray-500 text-[11px]">
                                  {p.reference_child}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => handleOpenEditParam(p)}
                                      className="p-1 text-gray-400 hover:text-blue-600 rounded hover:bg-slate-50 transition-colors cursor-pointer"
                                      title="Edit Parameter"
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteParam(p.id)}
                                      className="p-1 text-gray-400 hover:text-rose-600 rounded hover:bg-slate-50 transition-colors cursor-pointer"
                                      title="Delete Parameter"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>

              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-12 text-center text-gray-400 font-semibold text-xs flex flex-col items-center justify-center space-y-3">
                <Database className="h-8 w-8 text-slate-300" />
                <p>Select or create a test panel from the left sidebar to view/configure biochemical parameters.</p>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
