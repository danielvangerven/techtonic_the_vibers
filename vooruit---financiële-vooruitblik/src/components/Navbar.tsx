import React from 'react';
import { RotateCcw, Calendar, LayoutDashboard, User, Users, RefreshCw } from 'lucide-react';

interface NavbarProps {
  activeTab: 'overview' | 'agenda' | 'profile';
  onSelectTab: (tab: 'overview' | 'agenda' | 'profile') => void;
  onResetDemo: () => void;
  activitiesCount: number;
  currentUserId: string;
  usersList: Array<{ id: string; name: string; standardTransport: string }>;
  onSwitchUser: (newUserId: string) => void;
  onRefreshData: () => void;
  isRefreshing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onResetDemo,
  activitiesCount,
  currentUserId,
  usersList,
  onSwitchUser,
  onRefreshData,
  isRefreshing,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      {/* Top Demo Disclaimer & Multi-user isolation banner */}
      <div className="bg-slate-900 text-slate-200 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wide">
            Proactieve Assistent
          </span>
          <span className="font-medium text-slate-300 hidden sm:inline">
            Geïsoleerde gegevenslaag • Geen chatvraag vereist voor inzichten
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-400">
          {/* Demo User Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700 text-slate-200">
            <Users className="w-3 h-3 text-blue-400" />
            <span className="text-[11px] text-slate-400">Demo profiel:</span>
            <select
              value={currentUserId}
              onChange={e => onSwitchUser(e.target.value)}
              className="bg-transparent text-white font-semibold text-xs border-none outline-none cursor-pointer"
            >
              {usersList.map(u => (
                <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                  {u.name} ({u.standardTransport})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onResetDemo}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-300 hover:text-blue-100 hover:underline transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Demo herstellen</span>
          </button>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
              V
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">Vooruit</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-100 uppercase tracking-wide">
                  Proactief
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Automatische financiële voorbereiding en advieskaarten
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 sm:gap-2">
            <nav className="flex items-center gap-1 sm:gap-1.5">
              <button
                onClick={() => onSelectTab('overview')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Overzicht</span>
              </button>

              <button
                onClick={() => onSelectTab('agenda')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'agenda'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Agenda</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === 'agenda' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {activitiesCount}
                </span>
              </button>

              <button
                onClick={() => onSelectTab('profile')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Profiel</span>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};
