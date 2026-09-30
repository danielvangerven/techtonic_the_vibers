import React, { useState, useEffect } from 'react';
import { TransportMode, UserProfile } from '../types';
import { formatPrice } from '../utils/calculations';
import { 
  User, 
  Car, 
  ShieldCheck, 
  MapPin, 
  Heart, 
  Repeat, 
  Info, 
  Save, 
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Sliders,
  DollarSign
} from 'lucide-react';

interface ProfileTabProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onResetDemo: () => void;
  onQuickScenario: (type: 'buffer_900' | 'fuel_210' | 'no_dinner_pay') => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  profile,
  onUpdateProfile,
  onResetDemo,
  onQuickScenario,
}) => {
  // Local state for editing
  const [name, setName] = useState(profile.name);
  const [departureLocation, setDepartureLocation] = useState(profile.departureLocation);
  const [standardTransport, setStandardTransport] = useState<TransportMode>(profile.standardTransport);
  const [fuelConsumption, setFuelConsumption] = useState<string>(profile.fuelConsumptionLPer100Km.toString());
  const [fuelPrice, setFuelPrice] = useState<string>(profile.fuelPricePerLiter.toString());
  const [desiredBuffer, setDesiredBuffer] = useState<string>(profile.desiredBuffer.toString());
  const [dailyExpensesReserve, setDailyExpensesReserve] = useState<string>(profile.dailyExpensesReserve.toString());

  const [hobbiesText, setHobbiesText] = useState(profile.hobbies.join(', '));
  const [routinesText, setRoutinesText] = useState(profile.routines.join(', '));
  const [preferencesText, setPreferencesText] = useState(profile.preferences.join(', '));

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state whenever the active user's profile changes
  useEffect(() => {
    setName(profile.name);
    setDepartureLocation(profile.departureLocation);
    setStandardTransport(profile.standardTransport);
    setFuelConsumption(profile.fuelConsumptionLPer100Km.toString());
    setFuelPrice(profile.fuelPricePerLiter.toString());
    setDesiredBuffer(profile.desiredBuffer.toString());
    setDailyExpensesReserve(profile.dailyExpensesReserve.toString());
    setHobbiesText(profile.hobbies.join(', '));
    setRoutinesText(profile.routines.join(', '));
    setPreferencesText(profile.preferences.join(', '));
  }, [profile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: UserProfile = {
      ...profile,
      name: name.trim() || profile.name,
      departureLocation: departureLocation.trim() || profile.departureLocation,
      standardTransport,
      fuelConsumptionLPer100Km: parseFloat(fuelConsumption) || profile.fuelConsumptionLPer100Km,
      fuelPricePerLiter: parseFloat(fuelPrice) || profile.fuelPricePerLiter,
      desiredBuffer: parseFloat(desiredBuffer) || profile.desiredBuffer,
      dailyExpensesReserve: parseFloat(dailyExpensesReserve) || profile.dailyExpensesReserve,
      hobbies: hobbiesText.split(',').map(s => s.trim()).filter(Boolean),
      routines: routinesText.split(',').map(s => s.trim()).filter(Boolean),
      preferences: preferencesText.split(',').map(s => s.trim()).filter(Boolean),
    };

    onUpdateProfile(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Profile */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl">
            {name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{name}</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                Fictief gebruikersprofiel
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Instellingen voor financiële buffer, auto, reisgewoontes en routines
            </p>
          </div>
        </div>

        <button
          onClick={onResetDemo}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Demo herstellen</span>
        </button>
      </div>

      {/* Belangrijke Toelichting Banner */}
      <div className="bg-blue-50/70 border border-blue-200/80 p-4 rounded-2xl flex items-start gap-3 text-xs text-blue-950">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold block text-blue-900 mb-0.5">
            Principe: Voorkeuren en hobby’s zijn context, geen automatische uitgaven
          </span>
          Een hobby of voorkeur in dit profiel veroorzaakt op zichzelf nog geen uitgave. Daarvoor moet eerst een concrete agenda-activiteit of expliciete periodieke reservering worden gepland.
        </div>
      </div>

      {/* Test Scenarios Box */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Snelle tests & demonstratie scenario’s</h3>
          </div>
          <span className="text-xs text-slate-500">Direct invloed op de voorspelling</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <button
            type="button"
            onClick={() => {
              onQuickScenario('no_dinner_pay');
              // update local form if needed
            }}
            className="p-3 text-left rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 transition-colors cursor-pointer group"
          >
            <span className="font-bold text-blue-900 block group-hover:text-blue-950">
              1. Etentje: "Ik betaal niet"
            </span>
            <span className="text-slate-600 block mt-0.5 text-[11px]">
              Eindsaldo stijgt direct van €1.623,60 naar <strong>€1.673,60</strong> (+€50).
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onQuickScenario('buffer_900');
              setDesiredBuffer('900');
            }}
            className="p-3 text-left rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 transition-colors cursor-pointer group"
          >
            <span className="font-bold text-amber-900 block group-hover:text-amber-950">
              2. Buffer verhogen naar €900
            </span>
            <span className="text-slate-600 block mt-0.5 text-[11px]">
              Laagste saldo (€860,76) zakt onder buffer, triggert waarschuwing!
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onQuickScenario('fuel_210');
              setFuelPrice('2.10');
            }}
            className="p-3 text-left rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 transition-colors cursor-pointer group"
          >
            <span className="font-bold text-purple-900 block group-hover:text-purple-950">
              3. Brandstofprijs naar €2,10
            </span>
            <span className="text-slate-600 block mt-0.5 text-[11px]">
              Padelrit wordt direct herberekend (50 km × 6L/100 × €2,10).
            </span>
          </button>
        </div>
      </div>

      {/* Bewerkformulier */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Profielgegevens bewerken
        </h3>

        {/* Persoonlijke info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-400" /> Naam
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" /> Vertrekpunt (thuis)
            </label>
            <input
              type="text"
              required
              value={departureLocation}
              onChange={e => setDepartureLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>
        </div>

        {/* Vervoer & Brandstof Parameters */}
        <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-blue-600" />
            <h4 className="font-bold text-slate-900 text-sm">Vervoersprofiel & Brandstofberekening</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Standaardvervoer</label>
              <select
                value={standardTransport}
                onChange={e => setStandardTransport(e.target.value as TransportMode)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900"
              >
                <option value="Auto">Auto (standaard)</option>
                <option value="OV">Openbaar vervoer</option>
                <option value="Fiets">Fiets</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Verbruik (liter per 100 km)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={fuelConsumption}
                  onChange={e => setFuelConsumption(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono text-slate-900"
                />
                <span className="text-slate-500">L/100km</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Fictieve brandstofprijs per liter (€)
              </label>
              <div className="flex items-center gap-1">
                <span className="font-mono text-slate-500">€</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.5"
                  value={fuelPrice}
                  onChange={e => setFuelPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Formule uitleg */}
          <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-1">
            <span className="font-semibold text-slate-800 block">Gebruikte formule voor autoritten:</span>
            <p className="font-mono text-slate-700 text-[11px]">
              Gereden kilometers × ({fuelConsumption || '6.0'} L ÷ 100) × €{fuelPrice || '1.80'} / liter = Brandstofkosten
            </p>
            <p className="text-[11px] text-amber-800 pt-1">
              * Brandstofkosten zijn géén volledige autokosten (geen afschrijving, verzekering of onderhoud meegerekend).
            </p>
          </div>
        </div>

        {/* Financiële Buffer & Reserveringen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <label className="block font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Zelfgekozen financiële buffer (€)
            </label>
            <div className="flex items-center gap-1">
              <span className="font-mono text-slate-500">€</span>
              <input
                type="number"
                step="50"
                min="0"
                value={desiredBuffer}
                onChange={e => setDesiredBuffer(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono text-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Als het verwachte saldo op enig moment onder deze buffer zakt, geeft het meldingenvak een signaal.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <label className="block font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
              <DollarSign className="w-4 h-4 text-blue-600" />
              Gewone dagelijkse uitgaven oktober (€)
            </label>
            <div className="flex items-center gap-1">
              <span className="font-mono text-slate-500">€</span>
              <input
                type="number"
                step="25"
                min="0"
                value={dailyExpensesReserve}
                onChange={e => setDailyExpensesReserve(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono text-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Gereserveerd voor kleine boodschappen e.d., verdeeld over de maand (exclusief geplande agenda-uitgaven).
            </p>
          </div>
        </div>

        {/* Hobby's, Routines & Voorkeuren */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500" /> Hobby's en interesses (komma-gescheiden)
            </label>
            <input
              type="text"
              value={hobbiesText}
              onChange={e => setHobbiesText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
              placeholder="Padel spelen, Uit eten gaan, Citytrips maken"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Repeat className="w-3.5 h-3.5 text-blue-500" /> Routines & Gewoontes (komma-gescheiden)
            </label>
            <input
              type="text"
              value={routinesText}
              onChange={e => setRoutinesText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
              placeholder="Wekelijkse sportavond, Maandelijkse borrel"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Voorkeuren
            </label>
            <input
              type="text"
              value={preferencesText}
              onChange={e => setPreferencesText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900"
              placeholder="Standaard reizen met eigen auto, Flexibele planning"
            />
          </div>
        </div>

        {/* Opslaan Knop & Feedback */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Wijzigingen worden direct doorberekend in het overzicht en lokaal bewaard.
          </span>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Opgeslagen!
              </span>
            )}

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Instellingen opslaan</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
