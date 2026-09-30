import React, { useState } from 'react';
import { 
  Activity, 
  AdviceCard,
  AppliedCorrection,
  DayTimeline, 
  FixedTransaction, 
  UserProfile, 
  ScenarioSimulation 
} from '../types';
import { calculateActivityBreakdown, formatPrice } from '../utils/calculations';
import { CashflowChart } from './CashflowChart';
import { ProactiveAdviceCards } from './ProactiveAdviceCards';
import { 
  Calendar, 
  CheckCircle2, 
  Car,
  Filter,
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Sliders,
  X,
  RefreshCw,
  Clock,
  HelpCircle,
  Plus,
  User,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface OverviewTabProps {
  initialBalance: number;
  endBalance: number;
  lowestBalance: number;
  lowestBalanceDate: string;
  days: DayTimeline[];
  profile: UserProfile;
  activities: Activity[];
  fixedTransactions: FixedTransaction[];
  adviceCards: AdviceCard[];
  lastSyncTime: string;
  dataVersion: number;
  activeScenario?: ScenarioSimulation | null;
  lastCorrection: AppliedCorrection | null;
  onClearScenario?: () => void;
  onNavigateTab: (tab: 'overview' | 'agenda' | 'profile') => void;
  onOpenCostExplanation: (activity: Activity) => void;
  onOpenAddActivity: () => void;
  onExecutePrimaryAction: (card: AdviceCard) => void;
  onExecuteSecondaryAction?: (card: AdviceCard, actionType: string, payload?: any) => void;
  onDismissAdviceCard: (cardId: string, reason: 'dismissed' | 'irrelevant' | 'later') => void;
  onUndoLastCorrection: () => void;
  onAskCardQuestion: (card: AdviceCard, question: string) => Promise<string>;
  onRefreshData: () => void;
  isRefreshing: boolean;
  onQuickToggleStatus: (activityId: string, newStatus: Activity['costStatus']) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  initialBalance,
  endBalance,
  lowestBalance,
  lowestBalanceDate,
  days,
  profile,
  activities,
  fixedTransactions,
  adviceCards,
  lastSyncTime,
  dataVersion,
  activeScenario,
  lastCorrection,
  onClearScenario,
  onNavigateTab,
  onOpenCostExplanation,
  onOpenAddActivity,
  onExecutePrimaryAction,
  onExecuteSecondaryAction,
  onDismissAdviceCard,
  onUndoLastCorrection,
  onAskCardQuestion,
  onRefreshData,
  isRefreshing,
  onQuickToggleStatus,
}) => {
  const [selectedDay, setSelectedDay] = useState<DayTimeline | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'activities' | 'fixed' | 'daily'>('all');
  const [showCalculationDetails, setShowCalculationDetails] = useState(false);

  const buffer = profile.desiredBuffer;
  const isBufferAtRisk = lowestBalance < buffer;
  const bufferMargin = lowestBalance - buffer;

  const formatDateNl = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parseInt(parts[2], 10)} okt`;
    }
    return dateStr;
  };

  // Sort upcoming activities chronologically
  const upcomingActivities = [...activities].sort((a, b) => a.date.localeCompare(b.date));

  // Filter items in the detailed timeline
  const filteredDays = days.filter(d => {
    if (filterType === 'all') return true;
    if (filterType === 'activities') return d.items.some(i => i.type === 'activity');
    if (filterType === 'fixed') return d.items.some(i => i.type === 'fixed_expense' || i.type === 'income');
    if (filterType === 'daily') return d.items.some(i => i.type === 'daily_expense');
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Synchronization & Data Status Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            {profile.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900">{profile.name}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600">{profile.departureLocation}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Gegevenslaag: v{dataVersion} • Gesynchroniseerd: {new Date(lastSyncTime).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshData}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Herlaad gegevens uit de bron"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
            <span>{isRefreshing ? 'Vernieuwen...' : 'Gegevens vernieuwen'}</span>
          </button>
        </div>
      </div>

      {/* Actief scenario waarschuwing indien gesimuleerd */}
      {activeScenario && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div className="text-xs text-amber-950">
              <span className="font-bold text-sm block text-amber-900">
                Wat-als simulatie actief: {activeScenario.description} op {activeScenario.date}
              </span>
              <span>
                Eindsaldo daalt met €{formatPrice(Math.abs(activeScenario.impactOnEndBalance))} naar <strong>€{formatPrice(activeScenario.newEndBalance)}</strong>. 
                {activeScenario.impactOnLowestBalance !== 0 && (
                  <> Laagste saldo daalt naar <strong>€{formatPrice(activeScenario.newLowestBalance)}</strong>.</>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onClearScenario && (
              <button
                onClick={onClearScenario}
                className="px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Simulatie wissen
              </button>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 1. KERNONDERDEEL: “BELANGRIJK VOOR JOU” (Proactieve advieskaarten) */}
      {/* ---------------------------------------------------- */}
      <ProactiveAdviceCards
        cards={adviceCards}
        lastSyncTime={lastSyncTime}
        dataVersion={dataVersion}
        onExecutePrimaryAction={onExecutePrimaryAction}
        onExecuteSecondaryAction={onExecuteSecondaryAction}
        onDismissCard={onDismissAdviceCard}
        lastCorrection={lastCorrection}
        onUndoLastCorrection={onUndoLastCorrection}
        onAskCardQuestion={onAskCardQuestion}
      />

      {/* ---------------------------------------------------- */}
      {/* 2. KERNONDERDEEL: “WAT KOMT ERAAN?” (Komende activiteiten) */}
      {/* ---------------------------------------------------- */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Wat komt eraan?
            </h2>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              ({upcomingActivities.length} activiteiten in oktober)
            </span>
          </div>

          <button
            onClick={onOpenAddActivity}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nieuwe activiteit</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {upcomingActivities.map(activity => {
            const breakdown = calculateActivityBreakdown(activity, profile);
            const isUnknown = breakdown.isUnknown;
            const displayCost = breakdown.effectiveCost;

            let displayNote = '';
            if (activity.costStatus === 'i_do_not_pay') {
              displayNote = 'Ik betaal niet (€0)';
            } else if (activity.costStatus === 'already_paid') {
              displayNote = activity.alreadyPaidAmount 
                ? `Vooraf voldaan (€${formatPrice(activity.alreadyPaidAmount)})` 
                : 'Vooraf voldaan';
            } else if (activity.costStatus === 'excluded') {
              displayNote = 'Uitgesloten van analyse';
            } else if (isUnknown) {
              displayNote = 'Kosten nog onbekend';
            } else if (breakdown.transportTotal > 0) {
              displayNote = `Inclusief €${formatPrice(breakdown.transportTotal)} vervoer (${activity.transportMode})`;
            }

            return (
              <div
                key={activity.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                    <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                      {formatDateNl(activity.date)}
                    </span>
                    <span className="text-[11px]">{activity.category}</span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 leading-snug">
                    {activity.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <span>{activity.location}</span>
                    <span>•</span>
                    <span>{activity.transportMode}</span>
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-baseline justify-between">
                    <span className="text-xs text-slate-500">Nog te betalen:</span>
                    <div className="text-right">
                      <span className={`text-base font-bold font-mono ${isUnknown ? 'text-amber-600' : displayCost > 0 ? 'text-slate-900' : 'text-emerald-700'}`}>
                        {isUnknown ? 'Onbekend' : `€${formatPrice(displayCost)}`}
                      </span>
                      {displayNote && (
                        <p className="text-[10px] text-slate-400 mt-0.5">{displayNote}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Snelle contextuele acties per activiteit */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
                  <button
                    onClick={() => onOpenCostExplanation(activity)}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold hover:underline cursor-pointer"
                  >
                    Waarom dit bedrag?
                  </button>

                  <div className="flex items-center gap-1.5">
                    {isUnknown ? (
                      <button
                        onClick={() => {
                          onExecutePrimaryAction({
                            id: `card-ambiguity-${activity.id}`,
                            activityId: activity.id,
                            category: 'ambiguity',
                            title: `Type afspraak: ${activity.title}`,
                            summary: '',
                            priority: 2,
                            status: 'active',
                            whyExplanation: { dataUsed: [], assumptions: [] },
                            primaryAction: {
                              label: 'Kies type activiteit',
                              actionType: 'resolve_ambiguity',
                              payload: { activityId: activity.id },
                            },
                          });
                        }}
                        className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 cursor-pointer"
                      >
                        Verduidelijken
                      </button>
                    ) : (
                      <>
                        {activity.transportMode === 'Auto' && breakdown.transportTotal > 0 && (
                          <button
                            onClick={() => {
                              onExecutePrimaryAction({
                                id: `card-transport-${activity.id}`,
                                activityId: activity.id,
                                title: `${activity.title} vervoer`,
                                category: 'transport_check',
                                summary: '',
                                priority: 1,
                                status: 'active',
                                whyExplanation: { dataUsed: [], assumptions: [] },
                                primaryAction: {
                                  label: `Ik ga fietsen (-€${formatPrice(breakdown.transportTotal)})`,
                                  actionType: 'change_transport',
                                  payload: { activityId: activity.id, newTransport: 'Fiets' },
                                },
                              });
                            }}
                            className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                            title="Schakel om naar de fiets om brandstof en parkeren te besparen"
                          >
                            Naar fiets (-€{formatPrice(breakdown.transportTotal)})
                          </button>
                        )}

                        <button
                          onClick={() => onQuickToggleStatus(activity.id, activity.costStatus === 'i_do_not_pay' ? 'normal' : 'i_do_not_pay')}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold border cursor-pointer ${
                            activity.costStatus === 'i_do_not_pay' 
                              ? 'bg-amber-100 text-amber-900 border-amber-300' 
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {activity.costStatus === 'i_do_not_pay' ? '✓ Ik betaal niet' : 'Ik betaal niet'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 3. KERNONDERDEEL: “JE FINANCIËLE VOORUITBLIK” (KPI, Chart, Timeline) */}
      {/* ---------------------------------------------------- */}
      <section className="space-y-5 pt-2">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Je financiële vooruitblik
            </h2>
            <p className="text-xs text-slate-500">
              Controleerbare doorrekening van inkomsten, vaste lasten, dagelijks leefgeld en agenda.
            </p>
          </div>
        </div>

        {/* 4 Hoofdcijfers (KPI Kaarten) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Huidig Saldo */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Huidig saldo (1 okt)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                Bekend
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tracking-tight">
              €{formatPrice(initialBalance)}
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              Beginsaldo op demodatum
            </p>
          </div>

          {/* Verwacht Eindsaldo */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Verwacht eindsaldo (31 okt)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                Schatting
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-blue-600 tracking-tight">
              €{formatPrice(endBalance)}
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
              <span>Netto wijziging:</span>
              <span className={`font-mono font-semibold ${endBalance >= initialBalance ? 'text-emerald-600' : 'text-slate-700'}`}>
                {endBalance >= initialBalance ? '+' : ''}€{formatPrice(endBalance - initialBalance)}
              </span>
            </p>
          </div>

          {/* Laagste verwachte saldo */}
          <div className={`rounded-2xl p-5 border shadow-2xs relative overflow-hidden ${
            isBufferAtRisk ? 'bg-rose-50/60 border-rose-200' : 'bg-white border-slate-200/90'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Laagste punt van de maand
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                isBufferAtRisk ? 'bg-rose-100 text-rose-800' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              }`}>
                {formatDateNl(lowestBalanceDate)}
              </span>
            </div>
            <div className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${
              isBufferAtRisk ? 'text-rose-600' : 'text-slate-900'
            }`}>
              €{formatPrice(lowestBalance)}
            </div>
            <p className="text-xs mt-2 flex items-center justify-between">
              <span className="text-slate-500">Marge t.o.v. buffer:</span>
              <span className={`font-semibold font-mono ${
                bufferMargin >= 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}>
                {bufferMargin >= 0 ? `+€${formatPrice(bufferMargin)}` : `-€${formatPrice(Math.abs(bufferMargin))}`}
              </span>
            </p>
          </div>

          {/* Financiële Buffer */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Zelfgekozen buffer</span>
              <button
                onClick={() => onNavigateTab('profile')}
                className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Wijzigen
              </button>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tracking-tight">
              €{formatPrice(buffer)}
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
              <CheckCircle2 className={`w-3.5 h-3.5 ${isBufferAtRisk ? 'text-rose-500' : 'text-emerald-600'}`} />
              <span>{isBufferAtRisk ? 'Buffer wordt geraakt' : 'Buffer blijft intact'}</span>
            </p>
          </div>
        </div>

        {/* Cashflow visualisatie grafiek */}
        <CashflowChart
          days={days}
          buffer={buffer}
          initialBalance={initialBalance}
          lowestBalance={lowestBalance}
          lowestBalanceDate={lowestBalanceDate}
          selectedDay={selectedDay}
          onSelectDay={(day) => setSelectedDay(day)}
        />

        {/* Berekening details (Uitklapbaar op klik) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <button
            onClick={() => setShowCalculationDetails(!showCalculationDetails)}
            className="w-full flex items-center justify-between text-left cursor-pointer group"
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Hoe is het verwachte saldo berekend?
                </h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  Formule & Uitsplitsing
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Beginsaldo + Inkomsten - Vaste lasten - Dagelijkse reservering - Agenda-activiteiten = Verwacht eindsaldo
              </p>
            </div>

            <div className="p-2 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              {showCalculationDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showCalculationDetails && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800 uppercase tracking-wider block text-[11px]">
                    Stap-voor-stap optelsom:
                  </span>
                  <div className="space-y-1.5 font-mono text-slate-700">
                    <div className="flex justify-between">
                      <span>Beginsaldo (1 okt):</span>
                      <strong className="text-slate-900">€{formatPrice(initialBalance)}</strong>
                    </div>
                    <div className="flex justify-between text-emerald-700">
                      <span>+ Inkomsten (salaris/facturen):</span>
                      <strong>+€{formatPrice(fixedTransactions.filter(f => f.amount > 0).reduce((s, f) => s + f.amount, 0))}</strong>
                    </div>
                    <div className="flex justify-between text-rose-700">
                      <span>- Vaste contractlasten:</span>
                      <strong>-€{formatPrice(fixedTransactions.filter(f => f.amount < 0).reduce((s, f) => s + Math.abs(f.amount), 0))}</strong>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>- Gewone dagelijkse uitgaven (reservering):</span>
                      <strong>-€{formatPrice(profile.dailyExpensesReserve)}</strong>
                    </div>
                    <div className="pt-2 border-t border-slate-300 flex justify-between font-bold text-sm text-blue-700">
                      <span>= Verwacht eindsaldo:</span>
                      <span>€{formatPrice(endBalance)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-slate-700">
                  <span className="font-bold text-slate-800 uppercase tracking-wider block text-[11px]">
                    Duidelijk onderscheid:
                  </span>
                  <ul className="space-y-1.5 list-disc pl-4 text-xs leading-relaxed text-slate-600">
                    <li>
                      <strong>Vaste contracten:</strong> Bekende overboekingen met vastgestelde data en bedragen.
                    </li>
                    <li>
                      <strong>Geplande agenda-uitgaven:</strong> Schattingen op basis van context, vervoerswijze en eerdere transacties.
                    </li>
                    <li>
                      <strong>Dubbeltellingspreventie:</strong> Reeds voldane onderdelen (zoals geboekt hotel) zitten al in het huidige saldo en worden niet nogmaals afgetrokken.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tijdlijn van oktober */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Financiële tijdlijn van oktober</h3>
              <p className="text-xs text-slate-500">
                Bekijk per dag welke posten het saldo beïnvloeden en onderscheid bekende bedragen van schattingen.
              </p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  filterType === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Alles
              </button>
              <button
                onClick={() => setFilterType('activities')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  filterType === 'activities' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Agenda ({activities.length})
              </button>
              <button
                onClick={() => setFilterType('fixed')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  filterType === 'fixed' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Vaste posten
              </button>
            </div>
          </div>

          {/* Dag-voor-dag items */}
          <div className="space-y-3">
            {filteredDays
              .filter(d => filterType === 'all' || d.items.some(i => i.type !== 'daily_expense') || filterType === 'daily')
              .map(day => {
                const hasKeyItems = day.items.some(i => i.type !== 'daily_expense');
                const isSelected = selectedDay?.date === day.date;

                return (
                  <div
                    key={day.date}
                    className={`p-3.5 rounded-xl border transition-all ${
                      day.isLowestPoint 
                        ? 'border-rose-300 bg-rose-50/40' 
                        : isSelected 
                        ? 'border-blue-500 bg-blue-50/30 ring-1 ring-blue-500' 
                        : hasKeyItems 
                        ? 'border-slate-200/90 bg-slate-50/60 hover:bg-slate-50' 
                        : 'border-slate-100 bg-white opacity-80'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {day.dayName} {day.dayNumber} oktober 2026
                        </span>
                        {day.isLowestPoint && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 flex items-center gap-1">
                            ⚡ Laagste punt (€{formatPrice(day.endOfDayBalance)})
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono text-slate-600 flex items-center gap-2">
                        <span>Eindstand: <strong className="text-slate-900">€{formatPrice(day.endOfDayBalance)}</strong></span>
                        <span className="text-slate-300">|</span>
                        <span className={day.netDayChange >= 0 ? 'text-emerald-700 font-semibold' : 'text-slate-700'}>
                          {day.netDayChange >= 0 ? '+' : ''}€{formatPrice(day.netDayChange)}
                        </span>
                      </div>
                    </div>

                    {/* Transacties van die dag */}
                    <div className="pt-2 space-y-1.5">
                      {day.items.map(item => {
                        const relatedAct = item.relatedActivityId 
                          ? activities.find(a => a.id === item.relatedActivityId) 
                          : null;

                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-xs py-1 px-1 rounded hover:bg-slate-100/70"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                              {item.amount > 0 ? (
                                <ArrowUpRight className="w-4 h-4 text-emerald-600 shrink-0" />
                              ) : item.type === 'activity' ? (
                                <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                              ) : (
                                <ArrowDownRight className="w-4 h-4 text-slate-500 shrink-0" />
                              )}
                              <div className="truncate">
                                <span className="font-medium text-slate-800">{item.title}</span>
                                <span className="text-slate-400 ml-1.5">({item.category})</span>
                              </div>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold shrink-0 ${
                                item.isEstimate ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {item.isEstimate ? 'Schatting' : 'Bekend'}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              {relatedAct && (
                                <button
                                  onClick={() => onOpenCostExplanation(relatedAct)}
                                  className="text-blue-600 hover:text-blue-800 font-semibold underline text-[11px] cursor-pointer"
                                >
                                  Waarom dit bedrag?
                                </button>
                              )}
                              <span className={`font-mono font-semibold text-xs ${
                                item.amount > 0 ? 'text-emerald-700' : 'text-slate-900'
                              }`}>
                                {item.amount > 0 ? '+' : ''}€{formatPrice(item.amount)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </section>
    </div>
  );
};
