import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldAlert, Key, Check } from 'lucide-react';
import { dbManager } from '../db/dbManager';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await dbManager.login(password);
      if (success) {
        onLoginSuccess();
        navigate('/');
      } else {
        setError('Invalid access credentials. Passcode must be at least 4 characters.');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please verify configurations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 relative">
      {/* Decorative background grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <div className="bg-white p-8 md:p-10 rounded-2xl border border-gray-100 shadow-xl shadow-slate-200/50 max-w-md w-full relative z-10">
        {/* Branding Logo */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200 mb-4 animate-pulse">
            <Activity className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">LabSuite</h2>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">
            Clinical Diagnostic LIMS Platform
          </p>
        </div>

        {/* Warning Badge for Supabase config */}
        <div className="mb-6 px-4 py-3 bg-blue-50/70 border border-blue-100 rounded-xl text-[11px] text-blue-800 leading-normal flex items-start gap-2.5">
          <ShieldAlert className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-0.5">Development & Sandbox Mode Active</p>
            <p className="text-blue-600/90">
              {dbManager.isSupabase() 
                ? 'Authenticated with remote Supabase instance.' 
                : 'Running on secure Local Storage sandbox. Use any 4-digit passcode (e.g., 1234) to sign in.'
              }
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Technician Access Passcode
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                <Key className="h-4 w-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••"
                className="w-full bg-slate-50/50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-center font-mono text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Access Laboratory System'}
          </button>
        </form>
      </div>

      {/* Footer credits */}
      <span className="text-[10px] text-gray-400 font-mono mt-8 z-10">
        Metro Diagnostics System • Secure Cryptographic Ingress
      </span>
    </div>
  );
}
