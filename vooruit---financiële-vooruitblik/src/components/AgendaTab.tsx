import React, { useState } from 'react';
import { Activity, CostStatus, UserProfile } from '../types';
import { calculateActivityBreakdown, formatPrice } from '../utils/calculations';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  MapPin, 
  Clock, 
  Car, 
  HelpCircle, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  AlertCircle,
  Sparkles,
  Info,
  DollarSign
} from 'lucide-react';

interface AgendaTabProps {
  activities: Activity[];
  profile: UserProfile;
  onAddActivity: () => void;
  onEditActivity: (activity: Activity) => void;
  onDeleteActivity: (id: string) => void;
  onUpdateStatus: (id: string, newStatus: CostStatus) => void;
  onOpenCostExplanation: (activity: Activity) => void;
  onQuickOverrideCost: (id: string, newAmount: number | null) => void;
}

export const AgendaTab: React.FC<AgendaTabProps> = ({
  activities,
  profile,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
  onUpdateStatus,
  onOpenCostExplanation,
  onQuickOverrideCost,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle');
  const [editingCustomCostId, setEditingCustomCostId] = useState<string | null>(null);
  const [customCostInput, setCustomCostInput] = useState<string>('');

  const categories = ['Alle', 'Eten & Drinken', 'Sport & Hobby', 'Reizen & Uitstapjes', 'Sociaal', 'Overig'];

  const filteredActivities = activities.filter(a => {
    if (selectedCategory === 'Alle') return true;
    return a.category === selectedCategory;
  }).sort((a, b) => a.date.localeCompare(b.date));

  const handleStartCustomCost = (act: Activity, currentCost: number) => {
    setEditingCustomCostId(act.id);
    setCustomCostInput(currentCost.toString());
  };

  const handleSaveCustomCost = (id: string) => {
    const val = parseFloat(customCostInput);
    if (!isNaN(val) && val >= 0) {
      onQuickOverrideCost(id, val);
    }
    setEditingCustomCostId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Agenda van Noor</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-100">
              Oktober 2026
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Geplande activiteiten koppelen automatisch reiskosten en verwachte uitgaven aan je banksaldo.
          </p>
        </div>

        <button
          onClick={onAddActivity}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nieuwe activiteit</span>
        </button>
      </div>

      {/* Categorie Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors shrink-0 cursor-pointer ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Activiteiten Kaarten Lijst */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            <CalendarIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-medium">Geen activiteiten gevonden in deze categorie.</p>
            <button
              onClick={onAddActivity}
              className="mt-3 text-xs text-blue-600 font-semibold hover:underline"
            >
              + Voeg een activiteit toe
            </button>
          </div>
        ) : (
          filteredActivities.map(activity => {
            const breakdown = calculateActivityBreakdown(activity, profile);
            const isEditingCost = editingCustomCostId === activity.id;

            return (
              <div
                key={activity.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 hover:border-slate-300 transition-all"
              >
                {/* Header van kaart */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{activity.title}</h3>
                      <span className="text-[11px] px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-700">
                        {activity.category}
                      </span>
                      {activity.repetition !== 'Geen' && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold border border-purple-100">
                          {activity.repetition}
                        </span>
                      )}
                      {activity.costStatus === 'i_do_not_pay' && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                          Ik betaal niet (€0)
                        </span>
                      )}
                      {activity.costStatus === 'already_paid' && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                          Al betaald (vooraf)
                        </span>
                      )}
                      {activity.costStatus === 'excluded' && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-semibold">
                          Uitgesloten
                        </span>
                      )}
                      {breakdown.isUnknown && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                          Kosten onbekend
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                        {activity.date} {activity.endDate ? `t/m ${activity.endDate}` : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {activity.startTime} - {activity.endTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {activity.location}
                      </span>
                    </div>
                  </div>

                  {/* Bedrag weergave */}
                  <div className="flex items-baseline sm:flex-col sm:items-end gap-2 shrink-0">
                    <span className="text-xs text-slate-500 font-medium">Nog te betalen:</span>
                    <div className="text-right">
                      {isEditingCost ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-mono">€</span>
                          <input
                            type="number"
                            step="0.5"
                            value={customCostInput}
                            onChange={e => setCustomCostInput(e.target.value)}
                            className="w-20 px-2 py-1 text-xs rounded border border-blue-500 font-mono"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveCustomCost(activity.id)}
                            className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                            title="Opslaan"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setEditingCustomCostId(null)}
                            className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300"
                            title="Annuleren"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <span className={`text-xl font-bold font-mono ${
                          breakdown.isUnknown 
                            ? 'text-amber-600' 
                            : breakdown.effectiveCost > 0 
                            ? 'text-slate-900' 
                            : 'text-emerald-600'
                        }`}>
                          {breakdown.isUnknown ? 'Onbekend' : `€${formatPrice(breakdown.effectiveCost)}`}
                        </span>
                      )}

                      {activity.costStatus === 'i_do_not_pay' && (
                        <p className="text-[10px] text-amber-700 italic">
                          Oorspronkelijk: €{formatPrice(breakdown.calculatedTotal || 0)}
                        </p>
                      )}
                      {activity.costStatus === 'already_paid' && (
                        <p className="text-[10px] text-emerald-700 italic">
                          Vooraf voldaan (geen aftrek)
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Kosten Uitsplitsing Pills */}
                <div className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-slate-500">Kostenopbouw:</span>
                    <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200 font-mono">
                      Activiteit: {breakdown.activityCost !== null ? `€${formatPrice(breakdown.activityCost)}` : 'Onbekend'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200 font-mono flex items-center gap-1">
                      <Car className="w-3 h-3 text-slate-400" />
                      Vervoer: €{formatPrice(breakdown.transportTotal)}
                    </span>
                    {activity.extraCost > 0 && (
                      <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200 font-mono">
                        Extra: €{formatPrice(activity.extraCost)}
                      </span>
                    )}
                    {activity.customTotalOverride != null && (
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                        Handmatig aangepast: €{formatPrice(activity.customTotalOverride)}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => onOpenCostExplanation(activity)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Waarom dit bedrag?</span>
                  </button>
                </div>

                {/* Toelichtingsnotitie indien aanwezig */}
                {activity.explanationNote && (
                  <p className="text-[11px] text-slate-500 pt-2 pb-1 italic">
                    💡 {activity.explanationNote}
                  </p>
                )}

                {/* Snelle Actiebalk per Activiteit */}
                <div className="pt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                  {/* Status Knoppen */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-slate-500 mr-1 font-medium">Status:</span>
                    <button
                      onClick={() => onUpdateStatus(activity.id, 'normal')}
                      className={`px-2.5 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
                        activity.costStatus === 'normal'
                          ? 'bg-blue-50 border-blue-600 text-blue-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Normaal
                    </button>

                    <button
                      onClick={() => onUpdateStatus(activity.id, activity.costStatus === 'i_do_not_pay' ? 'normal' : 'i_do_not_pay')}
                      className={`px-2.5 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
                        activity.costStatus === 'i_do_not_pay'
                          ? 'bg-amber-100 border-amber-500 text-amber-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                      title="Klik om 'Ik betaal niet' aan of uit te zetten"
                    >
                      {activity.costStatus === 'i_do_not_pay' ? '✓ Ik betaal niet' : 'Ik betaal niet'}
                    </button>

                    <button
                      onClick={() => onUpdateStatus(activity.id, activity.costStatus === 'already_paid' ? 'normal' : 'already_paid')}
                      className={`px-2.5 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
                        activity.costStatus === 'already_paid'
                          ? 'bg-emerald-100 border-emerald-500 text-emerald-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                      title="Markeer als reeds betaald vóór oktober"
                    >
                      {activity.costStatus === 'already_paid' ? '✓ Al betaald' : 'Al betaald'}
                    </button>

                    <button
                      onClick={() => onUpdateStatus(activity.id, activity.costStatus === 'excluded' ? 'normal' : 'excluded')}
                      className={`px-2.5 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
                        activity.costStatus === 'excluded'
                          ? 'bg-slate-200 border-slate-400 text-slate-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Uitsluiten
                    </button>

                    {/* Bedrag handmatig aanpassen knop */}
                    <button
                      onClick={() => handleStartCustomCost(activity, breakdown.effectiveCost)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium cursor-pointer"
                    >
                      Bedrag aanpassen
                    </button>
                  </div>

                  {/* Bewerken & Verwijderen */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      onClick={() => onEditActivity(activity)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Activiteit bewerken"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteActivity(activity.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Activiteit verwijderen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
