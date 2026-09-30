import React from 'react';
import { Activity, UserProfile } from '../types';
import { calculateActivityBreakdown, formatPrice } from '../utils/calculations';
import { X, HelpCircle, Car, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface CostExplanationModalProps {
  activity: Activity | null;
  profile: UserProfile;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: Activity['costStatus']) => void;
}

export const CostExplanationModal: React.FC<CostExplanationModalProps> = ({
  activity,
  profile,
  onClose,
  onUpdateStatus,
}) => {
  if (!activity) return null;

  const breakdown = calculateActivityBreakdown(activity, profile);
  const totalKm = activity.distanceKmOneWay * (activity.isReturnTrip ? 2 : 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Waarom dit bedrag?</h3>
              <p className="text-xs text-slate-500 font-medium">{activity.title} • {activity.date}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status banner */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            activity.costStatus === 'i_do_not_pay' 
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : activity.costStatus === 'already_paid'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : activity.costStatus === 'excluded'
              ? 'bg-slate-100 border-slate-200 text-slate-800'
              : breakdown.isUnknown
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-blue-50 border-blue-200 text-blue-950'
          }`}>
            <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
            <div className="text-sm">
              <span className="font-semibold block">Huidige status: {breakdown.statusLabel}</span>
              <span className="text-xs opacity-90">
                {activity.costStatus === 'i_do_not_pay' && 'Je hebt aangegeven niet mee te betalen. Dit kost je dus €0.'}
                {activity.costStatus === 'already_paid' && 'Deze kosten zijn vooraf al voldaan en worden niet opnieuw van je saldo afgetrokken.'}
                {activity.costStatus === 'excluded' && 'Deze activiteit is uitgesloten van de financiële voorspelling.'}
                {activity.costStatus === 'unknown' && 'Kosten zijn onbekend en niet automatisch op €0 gezet. Vul een schatting in.'}
                {activity.costStatus === 'normal' && 'Dit bedrag wordt meegewogen in je verwachte saldo voor oktober.'}
              </span>
            </div>
          </div>

          {/* Uitsplitsing */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Uitsplitsing van de kosten
            </h4>

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/70 text-sm">
              {/* Activiteit / Deelname */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60">
                <div>
                  <span className="font-medium text-slate-800">Deelname / Activiteit</span>
                  {activity.historicalPrices && activity.historicalPrices.length > 0 && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Vergelijkbare eerdere uitgaven: {activity.historicalPrices.map(p => `€${formatPrice(p)}`).join(', ')}
                    </p>
                  )}
                </div>
                <span className="font-semibold text-slate-900 font-mono">
                  {breakdown.activityCost !== null ? `€${formatPrice(breakdown.activityCost)}` : 'Onbekend'}
                </span>
              </div>

              {/* Vervoer */}
              <div className="pb-2.5 border-b border-slate-200/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-slate-500" />
                    <span className="font-medium text-slate-800">Vervoer ({activity.transportMode})</span>
                  </div>
                  <span className="font-semibold text-slate-900 font-mono">
                    €{formatPrice(breakdown.transportTotal)}
                  </span>
                </div>

                {activity.transportMode === 'Auto' && (
                  <div className="mt-2 text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
                    <div className="font-medium text-slate-700">Brandstofberekening Noor:</div>
                    <div className="font-mono text-slate-600">
                      {totalKm} km ({activity.distanceKmOneWay} km {activity.isReturnTrip ? 'retour' : 'enkel'}) × ({profile.fuelConsumptionLPer100Km}L / 100km) ÷ 100 × €{formatPrice(profile.fuelPricePerLiter)}/L = €{formatPrice(breakdown.fuelCost)}
                    </div>
                    {activity.parkingCost > 0 && (
                      <div className="text-slate-600">
                        + Parkeerkosten: €{formatPrice(activity.parkingCost)}
                      </div>
                    )}
                    <div className="text-amber-800 bg-amber-50 p-2 rounded text-[11px] flex items-start gap-1.5 mt-2">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                      <span>
                        <strong>Let op:</strong> Brandstofkosten (€{formatPrice(breakdown.fuelCost)}) zijn niet de volledige autokosten (geen afschrijving, verzekering of onderhoud meegerekend).
                      </span>
                    </div>
                  </div>
                )}

                {activity.transportMode === 'Fiets' && (
                  <p className="text-xs text-slate-500 mt-1">
                    Fietsafstand {activity.distanceKmOneWay} km ({activity.isReturnTrip ? 'retour' : 'enkele reis'}). Geen brandstof- of parkeerkosten.
                  </p>
                )}

                {activity.transportMode === 'OV' && activity.parkingCost === 0 && breakdown.fuelCost === 0 && (
                  <p className="text-xs text-slate-500 mt-1">
                    Openbaar vervoer. Eventuele losse tickets vallen onder overige kosten.
                  </p>
                )}
              </div>

              {/* Extra kosten */}
              {activity.extraCost > 0 && (
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60">
                  <span className="font-medium text-slate-800">Extra kosten</span>
                  <span className="font-semibold text-slate-900 font-mono">
                    €{formatPrice(activity.extraCost)}
                  </span>
                </div>
              )}

              {/* Reeds betaald info (bijv. Parijs trein & hotel) */}
              {activity.alreadyPaidAmount && activity.alreadyPaidAmount > 0 && (
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5 text-emerald-800">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Reeds vooraf betaald: €{formatPrice(activity.alreadyPaidAmount)}
                  </div>
                  <p className="text-emerald-800/90">{activity.alreadyPaidDescription}</p>
                </div>
              )}

              {/* Totaalbedrag */}
              <div className="pt-2 flex items-center justify-between text-base">
                <div>
                  <span className="font-bold text-slate-900 block">Effectief van je saldo in okt:</span>
                  <span className="text-xs text-slate-500">
                    {activity.costStatus === 'normal' ? 'Volledig ingehouden' : 'Niet ingehouden wegens status'}
                  </span>
                </div>
                <span className={`text-xl font-bold font-mono ${
                  breakdown.effectiveCost > 0 ? 'text-slate-900' : 'text-emerald-600'
                }`}>
                  €{formatPrice(breakdown.effectiveCost)}
                </span>
              </div>
            </div>
          </div>

          {/* Toelichting & Context */}
          {activity.explanationNote && (
            <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-700 block mb-1">Toelichting berekening:</span>
              <p>{activity.explanationNote}</p>
            </div>
          )}

          {/* Snelle statusaanpassing */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Status aanpassen voor deze activiteit
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => onUpdateStatus(activity.id, 'normal')}
                className={`p-2.5 rounded-lg border text-left font-medium transition-colors ${
                  activity.costStatus === 'normal' 
                    ? 'border-blue-600 bg-blue-50 text-blue-900' 
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                ✓ Normaal meerekenen
              </button>
              <button
                type="button"
                onClick={() => onUpdateStatus(activity.id, 'i_do_not_pay')}
                className={`p-2.5 rounded-lg border text-left font-medium transition-colors ${
                  activity.costStatus === 'i_do_not_pay' 
                    ? 'border-amber-600 bg-amber-50 text-amber-900' 
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                ✕ Ik betaal niet (€0)
              </button>
              <button
                type="button"
                onClick={() => onUpdateStatus(activity.id, 'already_paid')}
                className={`p-2.5 rounded-lg border text-left font-medium transition-colors ${
                  activity.costStatus === 'already_paid' 
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900' 
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                ✓ Al vooraf betaald
              </button>
              <button
                type="button"
                onClick={() => onUpdateStatus(activity.id, 'excluded')}
                className={`p-2.5 rounded-lg border text-left font-medium transition-colors ${
                  activity.costStatus === 'excluded' 
                    ? 'border-slate-600 bg-slate-100 text-slate-900' 
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                ⊘ Uitsluiten van analyse
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-xs"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
};
