import React, { useState } from 'react';
import { AlertNotification } from '../types';
import { AlertTriangle, CheckCircle, Info, ChevronRight, X, ChevronDown, ChevronUp, BellOff, Volume2 } from 'lucide-react';

interface NotificationsBoxProps {
  notifications: AlertNotification[];
  onNavigateTab?: (tab: 'overview' | 'agenda' | 'profile') => void;
  onOpenAssistantForPrompt?: (prompt: string) => void;
}

export const NotificationsBox: React.FC<NotificationsBoxProps> = ({
  notifications,
  onNavigateTab,
  onOpenAssistantForPrompt,
}) => {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [expandedWhyId, setExpandedWhyId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const activeAlerts = isMuted 
    ? [] 
    : notifications
        .filter(n => !dismissedIds.includes(n.id))
        .slice(0, 3); // Maximaal 3 meldingen

  if (isMuted) {
    return (
      <div className="bg-slate-100/80 rounded-2xl p-3 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <span className="flex items-center gap-1.5">
          <BellOff className="w-3.5 h-3.5 text-slate-400" />
          Meldingen zijn tijdelijk gedempt.
        </span>
        <button
          onClick={() => setIsMuted(false)}
          className="text-blue-600 font-semibold hover:underline cursor-pointer"
        >
          Meldingen weer inschakelen
        </button>
      </div>
    );
  }

  if (activeAlerts.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
            {activeAlerts.length}
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            Aandachtspunten & Meldingen
          </h3>
          <span className="text-[11px] text-slate-500 font-normal hidden sm:inline">
            (max. 2 korte zinnen per signaal)
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <button
            onClick={() => setIsMuted(true)}
            className="hover:text-slate-600 flex items-center gap-1 transition-colors cursor-pointer"
            title="Meldingen minder vaak tonen"
          >
            <BellOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dempen</span>
          </button>
        </div>
      </div>

      <div className="space-y-2.5">
        {activeAlerts.map(alert => {
          const isWhyOpen = expandedWhyId === alert.id;

          const icon = alert.type === 'warning' ? (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          ) : alert.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          );

          const bgColor = alert.type === 'warning' 
            ? 'bg-amber-50/70 border-amber-200/80 text-amber-950'
            : alert.type === 'success'
            ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-950'
            : 'bg-blue-50/60 border-blue-200/80 text-blue-950';

          return (
            <div
              key={alert.id}
              className={`p-3 rounded-xl border transition-all ${bgColor} relative`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  {icon}
                  <div className="text-xs leading-relaxed flex-1">
                    <span className="font-semibold block text-slate-900 mb-0.5">
                      {alert.title}
                    </span>
                    <p className="text-slate-700">
                      {alert.sentence1}
                    </p>
                    {alert.sentence2 && (
                      <p className="text-slate-600 mt-0.5">
                        {alert.sentence2}
                      </p>
                    )}

                    {/* Waarom? uitklap */}
                    {isWhyOpen && (
                      <div className="mt-2 p-2 bg-white/90 rounded-lg border border-slate-200 text-[11px] text-slate-700 animate-in fade-in">
                        <span className="font-bold text-slate-800 block mb-0.5">Achtergrond:</span>
                        <p>{alert.explanationDetails || 'Deze melding is gebaseerd op de vaste rekenregels en de huidige agenda van oktober 2026.'}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Waarom knop */}
                  <button
                    onClick={() => setExpandedWhyId(isWhyOpen ? null : alert.id)}
                    className="px-2 py-0.5 rounded text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/80 transition-colors cursor-pointer"
                  >
                    {isWhyOpen ? 'Minder' : 'Waarom?'}
                  </button>

                  {alert.actionTargetTab && onNavigateTab && alert.actionText && (
                    <button
                      onClick={() => onNavigateTab(alert.actionTargetTab!)}
                      className="px-2.5 py-1 rounded-lg bg-white/90 hover:bg-white text-[11px] font-semibold text-blue-700 border border-blue-200 shadow-2xs hover:shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                    >
                      {alert.actionText}
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}

                  <button
                    onClick={() => setDismissedIds(prev => [...prev, alert.id])}
                    title="Melding sluiten"
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
