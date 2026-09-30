import { Activity, FixedTransaction, UserProfile } from '../types';

export const INITIAL_DATE = '2026-10-01';
export const INITIAL_BALANCE = 1800.00;

export const DEFAULT_PROFILE: UserProfile = {
  id: 'user-noor',
  name: 'Noor',
  hobbies: ['Padel spelen', 'Uit eten gaan', 'Citytrips maken'],
  routines: ['Wekelijkse sportavond', 'Maandelijkse borrel/diner met vrienden'],
  preferences: ['Standaard reizen met eigen auto', 'Gezonde maaltijden', 'Flexibele planning'],
  standardTransport: 'Auto',
  departureLocation: 'Utrecht (Thuis)',
  fuelConsumptionLPer100Km: 6.0, // 6 liter per 100 km
  fuelPricePerLiter: 1.80,        // €1,80 per liter
  desiredBuffer: 500.00,          // €500 gewenste buffer
  dailyExpensesReserve: 250.00,   // €250 gewone dagelijkse uitgaven over oktober
};

export const DEFAULT_FIXED_TRANSACTIONS: FixedTransaction[] = [
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
    title: 'Vaste lasten (energie, internet & verzekeringen)',
    date: '2026-10-05',
    amount: -100.00,
    category: 'Vaste lasten',
    isKnown: true,
    description: 'Vaste maandelijkse automatische incasso’s (bekend bedrag).',
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
];

export const DEFAULT_ACTIVITIES: Activity[] = [
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
    explanationNote: 'Gebaseerd op 3 eerdere diners bij vergelijkbare bistro’s (€42, €50 en €58, gemiddeld €50). Vervoer op de fiets brengt geen brandstofkosten met zich mee.',
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
    explanationNote: 'Baanhuur & deelname geschat op €18 (eerdere sessies: €16, €18 en €20). Vervoer met auto: 50 km retour × (6L / 100km) × €1,80/L = €5,40 brandstof. Plus €3 parkeerkosten. Let op: brandstofkosten zijn niet de volledige autokosten (geen afschrijving/onderhoud meegerekend).',
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
    alreadyPaidDescription: 'Trein (Eurostar) en hotel (€420) zijn al in september betaald en reeds afgeschreven in het beginsaldo van €1.800 op 1 oktober. Deze worden dus NIET opnieuw afgetrokken.',
    explanationNote: 'Resterende geschatte uitgaven ter plaatse voor eten, metro en musea zijn €300 (gebaseerd op eerdere vergelijkbare stedentrips: €250, €300 en €350). Trein & hotel zijn al voor 1 oktober voldaan.',
  },
];
