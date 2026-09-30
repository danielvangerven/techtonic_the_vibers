import { Activity, FixedTransaction, UserProfile, UserCorrection, UserData, AdviceCard } from '../src/types';

interface UserStoreRecord {
  userId: string;
  profile: UserProfile;
  activities: Activity[];
  fixedTransactions: FixedTransaction[];
  initialBalance: number;
  corrections: Record<string, UserCorrection>;
  dismissedAdviceIds: string[];
  dataVersion: number;
  lastSyncTime: string;
}

// Initial Default Records for Noor and Daan
const INITIAL_USERS: Record<string, UserStoreRecord> = {
  'user-noor': {
    userId: 'user-noor',
    profile: {
      id: 'user-noor',
      name: 'Noor',
      hobbies: ['Padel spelen', 'Uit eten gaan', 'Citytrips maken'],
      routines: ['Wekelijkse sportavond', 'Maandelijkse borrel/diner met vrienden'],
      preferences: ['Standaard reizen met eigen auto', 'Gezonde maaltijden', 'Flexibele planning'],
      standardTransport: 'Auto',
      departureLocation: 'Utrecht (Thuis)',
      fuelConsumptionLPer100Km: 6.0,
      fuelPricePerLiter: 1.80,
      desiredBuffer: 500.00,
      dailyExpensesReserve: 250.00,
    },
    initialBalance: 1800.00,
    fixedTransactions: [
      {
        id: 'fix-huur',
        title: 'Huur appartement',
        date: '2026-10-02',
        amount: -650.00,
        category: 'Wonen',
        isKnown: true,
        description: 'Vaste maandelijkse huuroverboeking (bekend contractbedrag).',
      },
      {
        id: 'fix-abonnementen',
        title: 'Vaste lasten (energie & internet)',
        date: '2026-10-05',
        amount: -100.00,
        category: 'Vaste lasten',
        isKnown: true,
        description: 'Vaste automatische incasso (bekend contractbedrag).',
      },
      {
        id: 'inc-salaris',
        title: 'Salaris / Inkomsten',
        date: '2026-10-15',
        amount: 1200.00,
        category: 'Inkomen',
        isKnown: true,
        description: 'Verwachte maandelijkse salarisuitbetaling.',
      },
    ],
    activities: [
      {
        id: 'act-etentje',
        title: 'Etentje met vrienden',
        date: '2026-10-09',
        startTime: '19:00',
        endTime: '22:30',
        location: 'Bistro De Markt, Utrecht Centrum',
        category: 'Eten & Drinken',
        repetition: 'Geen',
        activityCost: 50.00,
        isActivityCostUnknown: false,
        transportMode: 'Fiets',
        distanceKmOneWay: 3,
        isReturnTrip: true,
        parkingCost: 0,
        extraCost: 0,
        costStatus: 'normal',
        historicalPrices: [42.00, 50.00, 58.00],
        explanationNote: 'Gebaseerd op 3 eerdere diners bij vergelijkbare bistro’s (€42, €50 en €58, gemiddeld €50).',
      },
      {
        id: 'act-padel',
        title: 'Padel wedstrijd & training',
        date: '2026-10-11',
        startTime: '10:00',
        endTime: '11:30',
        location: 'Padel Centrum Vleuten',
        category: 'Sport & Hobby',
        repetition: 'Wekelijks',
        activityCost: 18.00,
        isActivityCostUnknown: false,
        transportMode: 'Auto',
        distanceKmOneWay: 25,
        isReturnTrip: true,
        parkingCost: 3.00,
        extraCost: 0,
        costStatus: 'normal',
        historicalPrices: [16.00, 18.00, 20.00],
        explanationNote: 'Deelname geschat op €18. Auto: 50 km retour × (6L / 100km) × €1,80 = €5,40 benzine + €3 parkeren = €26,40 totaal.',
      },
      {
        id: 'act-parijs',
        title: 'Weekend Parijs',
        date: '2026-10-23',
        endDate: '2026-10-25',
        startTime: '08:30',
        endTime: '21:00',
        location: 'Parijs, Frankrijk',
        category: 'Reizen & Uitstapjes',
        repetition: 'Geen',
        activityCost: 300.00,
        isActivityCostUnknown: false,
        transportMode: 'OV',
        distanceKmOneWay: 0,
        isReturnTrip: false,
        parkingCost: 0,
        extraCost: 0,
        costStatus: 'normal',
        historicalPrices: [250.00, 300.00, 350.00],
        alreadyPaidAmount: 420.00,
        alreadyPaidDescription: 'Trein en hotel (€420) zijn al voldaan en afgeschreven in het beginsaldo op 1 oktober. Deze worden niet opnieuw afgetrokken.',
        explanationNote: 'Resterende geschatte uitgaven ter plaatse voor eten, metro en musea zijn €300.',
      },
    ],
    corrections: {},
    dismissedAdviceIds: [],
    dataVersion: 1,
    lastSyncTime: '2026-10-01T08:00:00Z',
  },
  'user-daan': {
    userId: 'user-daan',
    profile: {
      id: 'user-daan',
      name: 'Daan',
      hobbies: ['Wielrennen', 'Boulderen', 'Koffiebars bezoeken'],
      routines: ['Wekelijkse fietstocht', 'Vrijdagmiddagborrel'],
      preferences: ['Altijd met de fiets in de stad', 'Treinreiziger voor lange afstanden'],
      standardTransport: 'Fiets',
      departureLocation: 'Amsterdam (De Pijp)',
      fuelConsumptionLPer100Km: 7.2,
      fuelPricePerLiter: 1.85,
      desiredBuffer: 1000.00,
      dailyExpensesReserve: 400.00,
    },
    initialBalance: 3200.00,
    fixedTransactions: [
      {
        id: 'daan-huur',
        title: 'Huur studio Amsterdam',
        date: '2026-10-01',
        amount: -1200.00,
        category: 'Wonen',
        isKnown: true,
        description: 'Vaste maandelijkse overschrijving.',
      },
      {
        id: 'daan-vaste-lasten',
        title: 'Verzekeringen & internet',
        date: '2026-10-04',
        amount: -180.00,
        category: 'Vaste lasten',
        isKnown: true,
        description: 'Automatische incasso.',
      },
      {
        id: 'daan-inkomsten',
        title: 'Facturen opdrachten (zzp)',
        date: '2026-10-22',
        amount: 2800.00,
        category: 'Inkomen',
        isKnown: true,
        description: 'Verwachte uitbetaling opdrachtgevers.',
      },
    ],
    activities: [
      {
        id: 'daan-act-wielrennen',
        title: 'Wielrentraining Heuvelrug',
        date: '2026-10-08',
        startTime: '09:00',
        endTime: '13:00',
        location: 'Utrechtse Heuvelrug',
        category: 'Sport & Hobby',
        repetition: 'Wekelijks',
        activityCost: 0,
        isActivityCostUnknown: false,
        transportMode: 'Fiets',
        distanceKmOneWay: 35,
        isReturnTrip: true,
        parkingCost: 0,
        extraCost: 8.50, // Koffie & appeltaart stop
        costStatus: 'normal',
        historicalPrices: [7.50, 8.50, 10.00],
        explanationNote: 'Eigen fiets, geen brandstofkosten. Alleen kleine horecastop onderweg (€8,50).',
      },
      {
        id: 'daan-act-londen',
        title: 'Stedentrip Londen',
        date: '2026-10-24',
        endDate: '2026-10-26',
        startTime: '07:00',
        endTime: '22:00',
        location: 'Londen, Verenigd Koninkrijk',
        category: 'Reizen & Uitstapjes',
        repetition: 'Geen',
        activityCost: 325.00, // Ca. £280
        isActivityCostUnknown: false,
        transportMode: 'OV',
        distanceKmOneWay: 0,
        isReturnTrip: false,
        parkingCost: 0,
        extraCost: 0,
        costStatus: 'normal',
        historicalPrices: [290.00, 325.00, 360.00],
        alreadyPaidAmount: 380.00,
        alreadyPaidDescription: 'Eurostar en hotel reeds voldaan voor vertrek.',
        explanationNote: 'Let op: bestemming in het Verenigd Koninkrijk (Britse Ponden, niet-euro). Verwachte uitgaven ter plaatse ca. £280 (€325).',
      },
      {
        id: 'daan-act-thomas',
        title: 'Afspraak met Thomas',
        date: '2026-10-14',
        startTime: '15:00',
        endTime: '17:00',
        location: 'Utrecht Centrum',
        category: 'Sociaal',
        repetition: 'Geen',
        activityCost: null,
        isActivityCostUnknown: true,
        transportMode: 'OV',
        distanceKmOneWay: 0,
        isReturnTrip: false,
        parkingCost: 0,
        extraCost: 0,
        costStatus: 'unknown',
        explanationNote: 'Nog niet gespecificeerd of dit een etentje, sportactiviteit of kosteloze ontmoeting betreft. De app rekent niet automatisch restaurantkosten.',
      },
    ],
    corrections: {},
    dismissedAdviceIds: [],
    dataVersion: 1,
    lastSyncTime: '2026-10-01T08:00:00Z',
  },
  'user-samira': {
    userId: 'user-samira',
    profile: {
      id: 'user-samira',
      name: 'Samira',
      hobbies: ['Fotografie', 'Hardlopen', 'Koken'],
      routines: ['Wekelijkse hardloopsessie'],
      preferences: ['Reist met openbaar vervoer en fiets', 'Let scherp op de buffer'],
      standardTransport: 'OV',
      departureLocation: 'Eindhoven',
      fuelConsumptionLPer100Km: 5.5,
      fuelPricePerLiter: 1.80,
      desiredBuffer: 300.00,
      dailyExpensesReserve: 180.00,
    },
    initialBalance: 820.00,
    fixedTransactions: [
      {
        id: 'samira-huur',
        title: 'Kamerhuur Eindhoven',
        date: '2026-10-02',
        amount: -450.00,
        category: 'Wonen',
        isKnown: true,
        description: 'Vaste maandelijkse overboeking verhuurder.',
      },
      {
        id: 'samira-zorg',
        title: 'Zorgverzekering',
        date: '2026-10-04',
        amount: -135.00,
        category: 'Vaste lasten',
        isKnown: true,
        description: 'Automatische incasso zorgverzekeraar.',
      },
      {
        id: 'samira-studie',
        title: 'Studiefinanciering & bijbaan',
        date: '2026-10-21',
        amount: 1100.00,
        category: 'Inkomen',
        isKnown: true,
        description: 'Verwachte storting DUO en werkgever.',
      },
    ],
    activities: [
      {
        id: 'samira-act-verjaardag',
        title: 'Verjaardagsdiner zus',
        date: '2026-10-10',
        startTime: '18:30',
        endTime: '21:30',
        location: 'Trattoria Mamma, Eindhoven',
        category: 'Eten & Drinken',
        repetition: 'Geen',
        activityCost: 45.00,
        isActivityCostUnknown: false,
        transportMode: 'Fiets',
        distanceKmOneWay: 4,
        isReturnTrip: true,
        parkingCost: 0,
        extraCost: 0,
        costStatus: 'normal',
        historicalPrices: [38.00, 45.00, 50.00],
        explanationNote: 'Cadeau en aandeel in restaurantrekening geschat op €45.',
      },
    ],
    corrections: {},
    dismissedAdviceIds: [],
    dataVersion: 1,
    lastSyncTime: '2026-10-01T08:00:00Z',
  },
};

// In-Memory User Store with data isolation
class DataStoreManager {
  private users: Record<string, UserStoreRecord>;

  constructor() {
    // Clone initial records so modifications remain isolated
    this.users = JSON.parse(JSON.stringify(INITIAL_USERS));
  }

  public getUsersList(): Array<{ id: string; name: string; standardTransport: string }> {
    return Object.values(this.users).map(u => ({
      id: u.userId,
      name: u.profile.name,
      standardTransport: u.profile.standardTransport,
    }));
  }

  public getUserData(userId: string): UserData | null {
    const user = this.users[userId];
    if (!user) return null;

    return {
      userId: user.userId,
      profile: { ...user.profile },
      activities: user.activities.map(act => ({ ...act })),
      fixedTransactions: [...user.fixedTransactions],
      initialBalance: user.initialBalance,
      corrections: Object.values(user.corrections),
      dataVersion: user.dataVersion,
      lastSyncTime: user.lastSyncTime,
      dataSourceStatus: {
        isConnected: false,
        sourceName: 'Lokale gegevenslaag (Demomodus met multi-user scheiding)',
        mode: 'demo_isolated',
        missingConfigs: [
          'DATABASE_URL of PostgreSQL niet geconfigureerd in .env.',
          'De app draait betrouwbaar op de lokale afzonderlijke gegevenslaag met strikte gebruikersscheiding.',
        ],
      },
    };
  }

  public refreshUserData(userId: string): UserData | null {
    const user = this.users[userId];
    if (!user) return null;

    user.dataVersion += 1;
    user.lastSyncTime = new Date().toISOString();
    return this.getUserData(userId);
  }

  public addActivity(userId: string, activity: Activity): UserData | null {
    const user = this.users[userId];
    if (!user) return null;

    user.activities.push(activity);
    user.dataVersion += 1;
    user.lastSyncTime = new Date().toISOString();
    return this.getUserData(userId);
  }

  public updateActivity(userId: string, activityId: string, updatedFields: Partial<Activity>): UserData | null {
    const user = this.users[userId];
    if (!user) return null;

    const idx = user.activities.findIndex(a => a.id === activityId);
    if (idx === -1) return null;

    user.activities[idx] = { ...user.activities[idx], ...updatedFields };
    user.dataVersion += 1;
    user.lastSyncTime = new Date().toISOString();
    return this.getUserData(userId);
  }

  public deleteActivity(userId: string, activityId: string): UserData | null {
    const user = this.users[userId];
    if (!user) return null;

    user.activities = user.activities.filter(a => a.id !== activityId);
    delete user.corrections[activityId];
    user.dataVersion += 1;
    user.lastSyncTime = new Date().toISOString();
    return this.getUserData(userId);
  }

  public applyCorrection(
    userId: string, 
    activityId: string, 
    action: string, 
    summary: string, 
    previousState: Partial<Activity>,
    isPermanentRoutine?: boolean,
    newTransportMode?: string,
    newCostStatus?: string,
    customAmount?: number
  ): UserData | null {
    const user = this.users[userId];
    if (!user) return null;

    const actIndex = user.activities.findIndex(a => a.id === activityId);
    if (actIndex === -1) return null;

    // Apply the correction to the activity
    const act = user.activities[actIndex];
    if (action === 'change_transport') {
      act.transportMode = (newTransportMode as any) || 'Fiets';
    } else if (action === 'i_do_not_pay') {
      act.costStatus = 'i_do_not_pay';
    } else if (action === 'already_paid') {
      act.costStatus = 'already_paid';
    } else if (action === 'exclude_activity') {
      act.costStatus = 'excluded';
    } else if (action === 'set_custom_amount' && customAmount !== undefined) {
      act.customTotalOverride = customAmount;
    }
    if (newCostStatus) {
      act.costStatus = newCostStatus as any;
    }

    // Persist correction separately per user and activity
    const correctionRecord: UserCorrection = {
      id: `corr-${Date.now()}`,
      userId,
      activityId,
      action,
      summaryWhatChanged: summary,
      previousActivityState: previousState,
      isPermanentRoutine: Boolean(isPermanentRoutine),
      createdAt: new Date().toISOString(),
    };

    user.corrections[activityId] = correctionRecord;

    if (isPermanentRoutine && action === 'change_transport') {
      user.profile.preferences = Array.from(new Set([...user.profile.preferences, 'Standaard fietsen bij sport']));
    }

    user.dataVersion += 1;
    user.lastSyncTime = new Date().toISOString();
    return this.getUserData(userId);
  }

  public undoCorrection(userId: string, activityId: string): UserData | null {
    const user = this.users[userId];
    if (!user) return null;

    const correction = user.corrections[activityId];
    if (!correction) return null;

    const actIndex = user.activities.findIndex(a => a.id === activityId);
    if (actIndex !== -1) {
      user.activities[actIndex] = {
        ...user.activities[actIndex],
        ...correction.previousActivityState,
      };
    }

    delete user.corrections[activityId];
    user.dataVersion += 1;
    user.lastSyncTime = new Date().toISOString();
    return this.getUserData(userId);
  }

  public dismissAdviceCard(userId: string, cardId: string): void {
    const user = this.users[userId];
    if (!user) return;
    if (!user.dismissedAdviceIds.includes(cardId)) {
      user.dismissedAdviceIds.push(cardId);
    }
  }

  public getDismissedAdviceIds(userId: string): string[] {
    const user = this.users[userId];
    return user ? [...user.dismissedAdviceIds] : [];
  }

  public resetUserDemo(userId: string): UserData | null {
    const initial = INITIAL_USERS[userId];
    if (!initial) return null;

    this.users[userId] = JSON.parse(JSON.stringify(initial));
    this.users[userId].lastSyncTime = new Date().toISOString();
    return this.getUserData(userId);
  }
}

export const dataStore = new DataStoreManager();
