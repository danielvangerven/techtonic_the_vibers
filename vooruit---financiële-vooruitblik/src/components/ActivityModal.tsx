import React, { useState } from 'react';
import { Activity, CostStatus, TransportMode, UserProfile, AIInterpretationResult } from '../types';
import { calculateFuelCost, formatPrice } from '../utils/calculations';
import { 
  X, 
  Calendar, 
  MapPin, 
  Clock, 
  Car, 
  Tag, 
  Sparkles, 
  HelpCircle, 
  Shield, 
  CheckCircle2, 
  AlertTriangle,
  Loader2
} from 'lucide-react';

interface ActivityModalProps {
  activity: Activity | null; // null = nieuwe activiteit toevoegen
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: Activity) => void;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  activity,
  profile,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  // Form states
  const [title, setTitle] = useState(activity?.title || '');
  const [description, setDescription] = useState(activity?.description || '');
  const [date, setDate] = useState(activity?.date || '2026-10-16');
  const [startTime, setStartTime] = useState(activity?.startTime || '19:00');
  const [endTime, setEndTime] = useState(activity?.endTime || '21:00');
  const [location, setLocation] = useState(activity?.location || 'Utrecht');
  const [category, setCategory] = useState<Activity['category']>(activity?.category || 'Sociaal');
  const [repetition, setRepetition] = useState<Activity['repetition']>(activity?.repetition || 'Geen');
  const [isPrivate, setIsPrivate] = useState<boolean>(activity?.isPrivate || false);
  
  const [isUnknownCost, setIsUnknownCost] = useState<boolean>(
    activity ? (activity.costStatus === 'unknown' || activity.activityCost === null) : false
  );
  const [activityCost, setActivityCost] = useState<string>(
    activity && activity.activityCost !== null ? activity.activityCost.toString() : '25'
  );
  
  const [transportMode, setTransportMode] = useState<TransportMode>(
    activity?.transportMode || profile.standardTransport
  );
  const [distanceKmOneWay, setDistanceKmOneWay] = useState<string>(
    activity?.distanceKmOneWay !== undefined ? activity.distanceKmOneWay.toString() : '15'
  );
  const [isReturnTrip, setIsReturnTrip] = useState<boolean>(
    activity?.isReturnTrip !== undefined ? activity.isReturnTrip : true
  );
  const [parkingCost, setParkingCost] = useState<string>(
    activity?.parkingCost !== undefined ? activity.parkingCost.toString() : '0'
  );
  const [extraCost, setExtraCost] = useState<string>(
    activity?.extraCost !== undefined ? activity.extraCost.toString() : '0'
  );
  const [costStatus, setCostStatus] = useState<CostStatus>(activity?.costStatus || 'normal');
  const [notes, setNotes] = useState(activity?.explanationNote || '');

  // AI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIInterpretationResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Live fuel calculation preview
  const distNum = parseFloat(distanceKmOneWay) || 0;
  const fuelEst = transportMode === 'Auto' 
    ? calculateFuelCost(distNum, isReturnTrip, profile.fuelConsumptionLPer100Km, profile.fuelPricePerLiter)
    : 0;

  // AI Interpretation handler
  const handleAIInterpret = async () => {
    if (!title.trim()) return;
    setIsAnalyzing(true);
    setAiError(null);
    setAiResult(null);

    try {
      const response = await fetch('/api/agent/interpret-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          date,
          startTime,
          endTime,
          location,
          transportMode,
          userProfile: profile,
          historicalExpenses: [
            { category: 'Eten & Drinken', previous: [42, 50, 58], typical: 50 },
            { category: 'Sport (Padel)', previous: [16, 18, 20], typical: 18 },
            { category: 'Reizen (Stedentrip)', previous: [250, 300, 350], typical: 300 },
          ],
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Kon afspraak niet interpreteren');
      }

      const res = data.interpretation as AIInterpretationResult;
      setAiResult(res);

      // Auto-apply category and suggested costs if unambiguous
      if (!res.isAmbiguous) {
        if (['Eten & Drinken', 'Sport & Hobby', 'Reizen & Uitstapjes', 'Sociaal', 'Overig'].includes(res.interpretedCategory)) {
          setCategory(res.interpretedCategory as Activity['category']);
        }
        if (res.suggestedParticipationCost !== null && res.suggestedParticipationCost !== undefined) {
          setActivityCost(res.suggestedParticipationCost.toString());
          setIsUnknownCost(false);
        }
        if (res.costExplanation) {
          setNotes(res.costExplanation);
        }
      }
    } catch (err: any) {
      setAiError(err.message || 'AI-service is momenteel niet bereikbaar');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyClarificationOption = (option: string) => {
    if (option.toLowerCase().includes('eten') || option.toLowerCase().includes('diner')) {
      setCategory('Eten & Drinken');
      setActivityCost('50');
      setIsUnknownCost(false);
      setNotes('Diner met bekenden. Geschat op €50 op basis van eerdere horeca-uitgaven (€42, €50, €58).');
    } else if (option.toLowerCase().includes('sport') || option.toLowerCase().includes('padel')) {
      setCategory('Sport & Hobby');
      setActivityCost('18');
      setIsUnknownCost(false);
      setNotes('Sportactiviteit. Geschat op €18 op basis van eerdere deelnames.');
    } else if (option.toLowerCase().includes('geen kosten') || option.toLowerCase().includes('studeren')) {
      setCategory('Sociaal');
      setActivityCost('0');
      setIsUnknownCost(false);
      setNotes('Activiteit zonder verwachte kosten (€0).');
    } else {
      setCategory('Sociaal');
      setActivityCost('15');
      setIsUnknownCost(false);
    }

    if (aiResult) {
      setAiResult({
        ...aiResult,
        isAmbiguous: false,
        clarificationQuestion: null,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const baseCost = isUnknownCost ? null : (parseFloat(activityCost) || 0);
    const finalStatus: CostStatus = isUnknownCost ? 'unknown' : costStatus;

    const newActivity: Activity = {
      id: activity?.id || `act-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      startTime,
      endTime,
      location: location.trim(),
      category,
      repetition,
      activityCost: baseCost,
      isActivityCostUnknown: isUnknownCost,
      transportMode,
      distanceKmOneWay: distNum,
      isReturnTrip,
      parkingCost: parseFloat(parkingCost) || 0,
      extraCost: parseFloat(extraCost) || 0,
      costStatus: finalStatus,
      isPrivate,
      historicalPrices: activity?.historicalPrices || (baseCost ? [baseCost * 0.9, baseCost, baseCost * 1.1] : undefined),
      alreadyPaidAmount: activity?.alreadyPaidAmount,
      alreadyPaidDescription: activity?.alreadyPaidDescription,
      explanationNote: notes.trim() || (aiResult?.costExplanation ? aiResult.costExplanation : undefined),
      assumptions: aiResult?.assumptions,
      costRange: (aiResult?.costRangeMin != null && aiResult?.costRangeMax != null) 
        ? { min: aiResult.costRangeMin, max: aiResult.costRangeMax } 
        : undefined,
    };

    onSave(newActivity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto border border-slate-200">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {activity ? 'Activiteit bewerken' : 'Nieuwe activiteit plannen'}
              </h3>
              <p className="text-xs text-slate-500">
                AI begrijpt de omschrijving; de app berekent de exacte bedragen.
              </p>
            </div>
            <button 
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4 text-sm">
            {/* Titel met AI Analyse knop */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">Titel van activiteit *</label>
                <button
                  type="button"
                  onClick={handleAIInterpret}
                  disabled={!title.trim() || isAnalyzing}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  )}
                  <span>AI Begrijpen & Schatten</span>
                </button>
              </div>

              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="bijv. Afspraak met Thomas, of Diner bij Loetje"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>

            {/* AI Interpretatie Resultaat & Verduidelijkingsvraag */}
            {aiResult && (
              <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/90 text-xs space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between font-bold text-blue-900">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    AI-interpretatie van afspraak
                  </span>
                  {aiResult.costRangeMin != null && aiResult.costRangeMax != null && (
                    <span className="font-mono text-blue-800">
                      Bandbreedte: €{formatPrice(aiResult.costRangeMin)} - €{formatPrice(aiResult.costRangeMax)}
                    </span>
                  )}
                </div>

                <p className="text-slate-700">{aiResult.costExplanation}</p>

                {/* Indien vaag (bijv. 'Afspraak met Thomas'): gerichte vraag met antwoordknoppen */}
                {aiResult.isAmbiguous && aiResult.clarificationQuestion && (
                  <div className="mt-2 p-3 bg-white rounded-lg border border-amber-200 text-amber-950 space-y-2">
                    <span className="font-semibold block text-amber-900">
                      ❓ {aiResult.clarificationQuestion}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(aiResult.clarificationOptions || ['Etentje', 'Sport', 'Studeren', 'Geen kosten']).map((opt, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleApplyClarificationOption(opt)}
                          className="px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-medium cursor-pointer transition-colors"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {aiResult.assumptions && aiResult.assumptions.length > 0 && (
                  <div className="pt-1 text-[11px] text-slate-600 space-y-0.5">
                    <span className="font-semibold text-slate-700">Gebruikte aannames:</span>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {aiResult.assumptions.map((ass, i) => (
                        <li key={i}>{ass}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {aiError && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{aiError}</span>
              </div>
            )}

            {/* Categorie & Herhaling */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-500" /> Categorie
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as Activity['category'])}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
                >
                  <option value="Eten & Drinken">Eten & Drinken</option>
                  <option value="Sport & Hobby">Sport & Hobby</option>
                  <option value="Reizen & Uitstapjes">Reizen & Uitstapjes</option>
                  <option value="Sociaal">Sociaal</option>
                  <option value="Overig">Overig</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Herhaling</label>
                <select
                  value={repetition}
                  onChange={e => setRepetition(e.target.value as Activity['repetition'])}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
                >
                  <option value="Geen">Geen (eenmalig)</option>
                  <option value="Wekelijks">Wekelijks</option>
                  <option value="Tweewekelijks">Tweewekelijks</option>
                  <option value="Maandelijks">Maandelijks</option>
                </select>
              </div>
            </div>

            {/* Datum & Tijden */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" /> Datum
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" /> Start
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" /> Einde
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-xs"
                />
              </div>
            </div>

            {/* Locatie */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" /> Locatie
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="bijv. Padel Vleuten of Bistro De Markt"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>

            {/* Kostenactiviteit schatting */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-800">Kosten van activiteit zelf (€)</label>
                <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isUnknownCost}
                    onChange={e => setIsUnknownCost(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Kosten nog onbekend</span>
                </label>
              </div>

              {!isUnknownCost ? (
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-500 font-mono">€</span>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    value={activityCost}
                    onChange={e => setActivityCost(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-900"
                  />
                </div>
              ) : (
                <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  ⚠️ De kosten worden als <strong>Onbekend</strong> aangemerkt. Dit wordt niet automatisch €0 genoemd.
                </p>
              )}
            </div>

            {/* Vervoer & Brandstof */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <label className="font-semibold text-slate-800 block flex items-center gap-1.5">
                <Car className="w-4 h-4 text-blue-600" /> Vervoer & Reiskosten
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-slate-600 block mb-1">Vervoerswijze:</span>
                  <select
                    value={transportMode}
                    onChange={e => setTransportMode(e.target.value as TransportMode)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
                  >
                    <option value="Auto">Auto (verbruik volgens profiel)</option>
                    <option value="Fiets">Fiets (geen brandstof)</option>
                    <option value="OV">Openbaar vervoer</option>
                    <option value="Geen">Geen / Lopen</option>
                  </select>
                </div>

                {transportMode === 'Auto' && (
                  <div>
                    <span className="text-xs text-slate-600 block mb-1">Afstand enkele reis:</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        value={distanceKmOneWay}
                        onChange={e => setDistanceKmOneWay(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900"
                      />
                      <span className="text-xs text-slate-500">km</span>
                    </div>
                  </div>
                )}
              </div>

              {transportMode === 'Auto' && (
                <div className="text-xs text-slate-600 space-y-2 pt-1 border-t border-slate-200/60">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isReturnTrip}
                        onChange={e => setIsReturnTrip(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>Retourrit ({distNum * 2} km totaal)</span>
                    </label>

                    <span className="font-mono font-medium text-slate-800">
                      Brandstof: €{formatPrice(fuelEst)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-600">Parkeerkosten (€):</span>
                    <input
                      type="number"
                      step="0.50"
                      min="0"
                      value={parkingCost}
                      onChange={e => setParkingCost(e.target.value)}
                      className="w-24 px-2 py-1 rounded-lg border border-slate-300 text-right font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Extra kosten */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60 text-xs">
                <span className="text-slate-600">Eventuele extra kosten (€):</span>
                <input
                  type="number"
                  step="0.50"
                  min="0"
                  value={extraCost}
                  onChange={e => setExtraCost(e.target.value)}
                  className="w-24 px-2 py-1 rounded-lg border border-slate-300 text-right font-mono"
                />
              </div>
            </div>

            {/* Financiële Status & Privacy */}
            <div className="space-y-2">
              <label className="block font-semibold text-slate-700">
                Financiële analyse status
              </label>
              <select
                value={costStatus}
                onChange={e => setCostStatus(e.target.value as CostStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white"
              >
                <option value="normal">Normaal meerekenen in vooruitblik</option>
                <option value="i_do_not_pay">"Ik betaal niet" (kost mij €0)</option>
                <option value="already_paid">"Al betaald" (vooraf voldaan, niet nogmaals aftrekken)</option>
                <option value="excluded">Uitsluiten van financiële analyse</option>
              </select>

              {/* Privacy vinkje */}
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={e => setIsPrivate(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  Markeer als <strong>privé-afspraak</strong> (wordt niet meegenomen in de financiële voorspelling)
                </span>
              </label>
            </div>

            {/* Notities & Uitleg */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Toelichting / Notitie</label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="bijv. Eerder kostte dit rond de €20. Trein vooraf geregeld."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
            >
              Annuleren
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
            >
              {activity ? 'Wijzigingen opslaan' : 'Activiteit toevoegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
