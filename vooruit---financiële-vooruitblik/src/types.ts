export type CostStatus = 
  | 'normal'         // Wordt meegerekend zoals berekend/geschat
  | 'i_do_not_pay'   // "Ik betaal niet" (kosten voor gebruiker = €0)
  | 'already_paid'   // "Al betaald" (reeds voldaan, niet opnieuw aftrekken van het saldo)
  | 'excluded'       // "Uitgesloten van financiële analyse"
  | 'unknown';       // "Onbekend" (nog geen schatting beschikbaar)

export type TransportMode = 'Auto' | 'OV' | 'Fiets' | 'Geen';

export interface Activity {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD (bijv. '2026-10-09')
  endDate?: string; // Optioneel voor meerdaags bijv. Parijs '2026-10-25'
  startTime: string; // '19:00'
  endTime: string; // '22:30'
  location: string;
  category: 'Eten & Drinken' | 'Sport & Hobby' | 'Reizen & Uitstapjes' | 'Sociaal' | 'Overig';
  repetition: 'Geen' | 'Wekelijks' | 'Tweewekelijks' | 'Maandelijks';
  
  // Kostencomponenten
  activityCost: number | null; // null = onbekend
  isActivityCostUnknown?: boolean;
  transportMode: TransportMode;
  distanceKmOneWay: number; // Enkele reis
  isReturnTrip: boolean; // Standaard true
  parkingCost: number;
  extraCost: number;
  
  // Status & overrides
  costStatus: CostStatus;
  customTotalOverride?: number | null; // Handmatig aangepast totaalbedrag
  isPrivate?: boolean; // Privacy: uitsluiten van analyse of afgeschermd

  // Context & historische data
  historicalPrices?: number[]; // Fictieve historische transacties bijv. [42, 50, 58]
  alreadyPaidAmount?: number; // Bijv. 420 voor trein/hotel Parijs
  alreadyPaidDescription?: string;
  explanationNote?: string;
  assumptions?: string[];
  costRange?: { min: number; max: number };
}

export interface FixedTransaction {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  amount: number; // Positief voor inkomen, negatief voor uitgaven
  category: string;
  isKnown: boolean; // True = vaststaand bedrag (contract/factuur), false = schatting
  description: string;
}

export interface UserProfile {
  id: string;
  name: string;
  hobbies: string[];
  routines: string[];
  preferences: string[];
  standardTransport: TransportMode;
  departureLocation: string;
  fuelConsumptionLPer100Km: number; // Bijv. 6.0 L per 100 km
  fuelPricePerLiter: number; // Bijv. €1.80 per liter
  desiredBuffer: number; // Bijv. €500
  dailyExpensesReserve: number; // Totaal €250 voor oktober
}

export interface CalculatedCostBreakdown {
  activityCost: number | null;
  fuelCost: number;
  parkingCost: number;
  transportTotal: number;
  extraCost: number;
  calculatedTotal: number | null; // null indien onbekend
  effectiveCost: number; // Wat daadwerkelijk van het saldo afgaat in oktober (rekening houdend met status)
  status: CostStatus;
  statusLabel: string;
  isUnknown: boolean;
}

export interface DayTimelineItem {
  id: string;
  type: 'initial' | 'fixed_expense' | 'income' | 'daily_expense' | 'activity';
  title: string;
  category: string;
  amount: number; // Negatief voor uitgave, positief voor inkomst
  isEstimate: boolean;
  notes?: string;
  relatedActivityId?: string;
}

export interface DayTimeline {
  date: string; // YYYY-MM-DD
  dayNumber: number; // 1 t/m 31
  dayName: string; // 'Do', 'Vr', etc.
  items: DayTimelineItem[];
  netDayChange: number;
  endOfDayBalance: number;
  isLowestPoint?: boolean;
}

export interface AlertNotification {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  sentence1: string;
  sentence2?: string;
  actionText?: string;
  actionTargetTab?: 'overview' | 'agenda' | 'profile';
  explanationDetails?: string;
  isDismissed?: boolean;
}

// Proactive Advice Card Types
export interface AdviceCard {
  id: string;
  activityId?: string;
  category: 'buffer_alert' | 'trip_prep' | 'transport_check' | 'ambiguity' | 'savings_tip' | 'timing' | 'change_detected';
  title: string;
  summary: string; // Maximaal 2 korte zinnen, bij voorkeur <= 30 woorden
  relevantAmount?: number;
  badge?: string;
  priority: number; // 1 (hoogste urgentie) t/m 5
  primaryAction?: {
    label: string;
    actionType: 'change_transport' | 'i_do_not_pay' | 'already_paid' | 'resolve_ambiguity' | 'view_agenda' | 'view_timeline' | 'adjust_buffer';
    payload?: any;
  };
  secondaryActions?: {
    label: string;
    actionType: string;
    payload?: any;
  }[];
  whyExplanation: {
    calculation?: string;
    dataUsed: string[];
    assumptions: string[];
    sourceOrPolicy?: string;
    verifiedDate?: string;
  };
  status: 'active' | 'dismissed' | 'irrelevant' | 'snoozed';
  routineQuestion?: string;
}

// Persistent user correction
export interface UserCorrection {
  id: string;
  userId: string;
  activityId: string;
  action: string;
  summaryWhatChanged: string;
  previousActivityState: Partial<Activity>;
  isPermanentRoutine?: boolean;
  createdAt: string;
}

// Multi-user data payload
export interface UserData {
  userId: string;
  profile: UserProfile;
  activities: Activity[];
  fixedTransactions: FixedTransaction[];
  initialBalance: number;
  corrections: UserCorrection[];
  dataVersion: number;
  lastSyncTime: string;
  dataSourceStatus: {
    isConnected: boolean;
    sourceName: string;
    mode: 'demo_isolated' | 'live_connected';
    missingConfigs?: string[];
  };
}

// AI Agent types
export interface AppliedCorrection {
  activityId: string;
  action: string;
  summaryWhatChanged: string;
  previousActivityState: Partial<Activity>;
  routineQuestion?: string;
}

export interface ScenarioSimulation {
  amount: number;
  date: string;
  description: string;
  impactOnEndBalance: number;
  impactOnLowestBalance: number;
  newLowestBalance: number;
  newEndBalance: number;
  bufferShortfall?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  quickActionButtons?: string[];
  appliedCorrection?: AppliedCorrection;
  scenario?: ScenarioSimulation;
  isError?: boolean;
  rawExplanation?: string;
}

export interface AIInterpretationResult {
  interpretedCategory: string;
  suggestedParticipationCost: number | null;
  costRangeMin: number | null;
  costRangeMax: number | null;
  costExplanation: string;
  assumptions: string[];
  isAmbiguous: boolean;
  clarificationQuestion?: string | null;
  clarificationOptions?: string[] | null;
  suggestedTransport: string;
  requiresConfirmation: boolean;
}
