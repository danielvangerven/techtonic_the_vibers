import { 
  Activity, 
  CalculatedCostBreakdown, 
  DayTimeline, 
  DayTimelineItem, 
  FixedTransaction, 
  UserProfile, 
  AlertNotification,
  ScenarioSimulation
} from '../types';

/**
 * Bereken brandstofkosten:
 * Gereden kilometers × verbruik in liter per 100 km ÷ 100 × brandstofprijs per liter
 */
export function calculateFuelCost(
  distanceKmOneWay: number,
  isReturnTrip: boolean,
  fuelConsumptionLPer100Km: number,
  fuelPricePerLiter: number
): number {
  if (distanceKmOneWay <= 0 || fuelConsumptionLPer100Km <= 0 || fuelPricePerLiter <= 0) {
    return 0;
  }
  const totalKm = distanceKmOneWay * (isReturnTrip ? 2 : 1);
  const litersUsed = (totalKm * fuelConsumptionLPer100Km) / 100;
  const cost = litersUsed * fuelPricePerLiter;
  // Afgerond op 2 decimalen
  return Math.round(cost * 100) / 100;
}

/**
 * Bereken de volledige kostenopsplitsing voor een activiteit
 */
export function calculateActivityBreakdown(
  activity: Activity,
  profile: UserProfile
): CalculatedCostBreakdown {
  const isUnknown = activity.costStatus === 'unknown' || (activity.activityCost === null && !activity.customTotalOverride);

  // Vervoer berekenen
  let fuelCost = 0;
  let parkingCost = 0;

  if (activity.transportMode === 'Auto') {
    fuelCost = calculateFuelCost(
      activity.distanceKmOneWay,
      activity.isReturnTrip,
      profile.fuelConsumptionLPer100Km,
      profile.fuelPricePerLiter
    );
    parkingCost = activity.parkingCost || 0;
  } else if (activity.transportMode === 'Fiets') {
    // Fietsen brengt in de demo geen brandstof en geen parkeerkosten met zich mee
    fuelCost = 0;
    parkingCost = 0;
  } else if (activity.transportMode === 'OV') {
    fuelCost = 0;
    parkingCost = 0;
  }

  const transportTotal = Math.round((fuelCost + parkingCost) * 100) / 100;
  const extraCost = activity.extraCost || 0;
  const actCost = activity.activityCost !== null ? activity.activityCost : 0;

  const rawCalculatedTotal = isUnknown 
    ? null 
    : (activity.customTotalOverride != null 
        ? activity.customTotalOverride 
        : Math.round((actCost + transportTotal + extraCost) * 100) / 100);

  // Bepaal wat daadwerkelijk van het saldo in oktober wordt afgetrokken
  let effectiveCost = 0;
  let statusLabel = 'Normaal meegerekend';

  if (activity.isPrivate) {
    effectiveCost = 0;
    statusLabel = 'Privé (buiten analyse gehouden)';
  } else {
    switch (activity.costStatus) {
      case 'i_do_not_pay':
        effectiveCost = 0;
        statusLabel = 'Ik betaal niet (€0 voor mij)';
        break;
      case 'already_paid':
        effectiveCost = 0;
        statusLabel = 'Al vooraf betaald (niet dubbel)';
        break;
      case 'excluded':
        effectiveCost = 0;
        statusLabel = 'Uitgesloten van analyse';
        break;
      case 'unknown':
        effectiveCost = 0; // Wordt niet afgetrokken, maar gemarkeerd als onbekend
        statusLabel = 'Kosten onbekend';
        break;
      case 'normal':
      default:
        effectiveCost = rawCalculatedTotal ?? 0;
        statusLabel = 'Geschat & meegerekend';
        break;
    }
  }

  return {
    activityCost: activity.activityCost,
    fuelCost,
    parkingCost,
    transportTotal,
    extraCost,
    calculatedTotal: rawCalculatedTotal,
    effectiveCost,
    status: activity.costStatus,
    statusLabel,
    isUnknown,
  };
}

/**
 * Genereer dag-voor-dag tijdlijn voor oktober 2026 (1 t/m 31 oktober)
 */
export function generateOctoberTimeline(
  initialBalance: number,
  fixedTransactions: FixedTransaction[],
  activities: Activity[],
  profile: UserProfile,
  simulatedExtraExpense?: { date: string; amount: number; description?: string }
): {
  days: DayTimeline[];
  lowestBalance: number;
  lowestBalanceDate: string;
  endOfMonthBalance: number;
  totalIncome: number;
  totalFixedExpenses: number;
  totalActivitiesCost: number;
  totalDailyExpenses: number;
} {
  const days: DayTimeline[] = [];
  let currentBalance = initialBalance;
  let lowestBalance = initialBalance;
  let lowestBalanceDate = '2026-10-01';

  let totalIncome = 0;
  let totalFixedExpenses = 0;
  let totalActivitiesCost = 0;
  const totalDailyExpenses = profile.dailyExpensesReserve;

  // Dagelijkse verdeling van €250 over 31 dagen (dag 1..30: €8,06; dag 31: €8,20)
  const baseDailyCost = 8.06;
  const lastDayDailyCost = Math.round((totalDailyExpenses - (30 * baseDailyCost)) * 100) / 100;

  const dayNames = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];

  for (let day = 1; day <= 31; day++) {
    const dayStr = day.toString().padStart(2, '0');
    const dateStr = `2026-10-${dayStr}`;
    const dateObj = new Date(2026, 9, day); // Maand 9 = oktober
    const dayName = dayNames[dateObj.getDay()];

    const items: DayTimelineItem[] = [];
    let netDayChange = 0;

    // 1. Dagelijkse leefuitgaven verdelen
    const dayDailyAmount = (day === 31) ? lastDayDailyCost : baseDailyCost;
    items.push({
      id: `daily-${dateStr}`,
      type: 'daily_expense',
      title: 'Dagelijkse uitgaven (reservering)',
      category: 'Levensonderhoud',
      amount: -dayDailyAmount,
      isEstimate: true,
      notes: 'Onderdeel van €250 reservering voor gewone dagelijkse uitgaven',
    });
    netDayChange -= dayDailyAmount;

    // 2. Vaste transacties op deze datum
    const dayFixed = fixedTransactions.filter(t => t.date === dateStr);
    for (const f of dayFixed) {
      items.push({
        id: f.id,
        type: f.amount >= 0 ? 'income' : 'fixed_expense',
        title: f.title,
        category: f.category,
        amount: f.amount,
        isEstimate: !f.isKnown,
        notes: f.description,
      });
      netDayChange += f.amount;
      if (f.amount > 0) {
        totalIncome += f.amount;
      } else {
        totalFixedExpenses += Math.abs(f.amount);
      }
    }

    // 3. Activiteiten op deze datum
    const dayActivities = activities.filter(a => a.date === dateStr);
    for (const act of dayActivities) {
      const breakdown = calculateActivityBreakdown(act, profile);
      const effective = breakdown.effectiveCost;

      let itemNote = '';
      if (act.isPrivate) {
        itemNote = 'Privé-afspraak: buiten de financiële analyse gehouden.';
      } else if (act.costStatus === 'i_do_not_pay') {
        itemNote = 'Geen kosten: Noor betaalt niet bij deze activiteit.';
      } else if (act.costStatus === 'already_paid') {
        itemNote = 'Reeds vooraf betaald: geen nieuwe inhouding op het saldo.';
      } else if (act.costStatus === 'excluded') {
        itemNote = 'Uitgesloten van de financiële vooruitblik.';
      } else if (breakdown.isUnknown) {
        itemNote = 'Kosten zijn onbekend (nog niet meegerekend).';
      } else {
        itemNote = `Geschat bedrag: activiteit €${breakdown.activityCost?.toFixed(2) || '0'} + vervoer €${breakdown.transportTotal.toFixed(2)}`;
      }

      items.push({
        id: act.id,
        type: 'activity',
        title: act.isPrivate ? 'Privé-afspraak' : act.title,
        category: act.category,
        amount: -effective,
        isEstimate: true,
        notes: itemNote,
        relatedActivityId: act.id,
      });

      netDayChange -= effective;
      totalActivitiesCost += effective;
    }

    // 4. Gesimuleerde scenario-uitgave op deze dag
    if (simulatedExtraExpense && simulatedExtraExpense.date === dateStr) {
      const simCost = Math.abs(simulatedExtraExpense.amount);
      items.push({
        id: `sim-${dateStr}`,
        type: 'activity',
        title: `⚡ Wat-als scenario: ${simulatedExtraExpense.description || 'Extra uitgave'}`,
        category: 'Scenario',
        amount: -simCost,
        isEstimate: true,
        notes: `Simulatie van €${formatPrice(simCost)} om impact op saldo en buffer te toetsen.`,
      });
      netDayChange -= simCost;
    }

    // Update running balance
    currentBalance = Math.round((currentBalance + netDayChange) * 100) / 100;

    // Check lowest point during the month
    if (currentBalance < lowestBalance) {
      lowestBalance = currentBalance;
      lowestBalanceDate = dateStr;
    }

    days.push({
      date: dateStr,
      dayNumber: day,
      dayName,
      items,
      netDayChange: Math.round(netDayChange * 100) / 100,
      endOfDayBalance: currentBalance,
    });
  }

  // Mark the day with the lowest point
  for (const d of days) {
    if (d.date === lowestBalanceDate) {
      d.isLowestPoint = true;
    }
  }

  return {
    days,
    lowestBalance,
    lowestBalanceDate,
    endOfMonthBalance: currentBalance,
    totalIncome,
    totalFixedExpenses,
    totalActivitiesCost: Math.round(totalActivitiesCost * 100) / 100,
    totalDailyExpenses,
  };
}

/**
 * Voer een scenario-berekening uit (Wat verandert er als ik op datum X bedrag Y uitgeef?)
 */
export function calculateScenarioSimulation(
  initialBalance: number,
  fixedTransactions: FixedTransaction[],
  activities: Activity[],
  profile: UserProfile,
  amount: number,
  date: string,
  description: string
): ScenarioSimulation {
  const base = generateOctoberTimeline(initialBalance, fixedTransactions, activities, profile);
  const simulated = generateOctoberTimeline(initialBalance, fixedTransactions, activities, profile, {
    amount,
    date,
    description,
  });

  const impactOnEndBalance = Math.round((simulated.endOfMonthBalance - base.endOfMonthBalance) * 100) / 100;
  const impactOnLowestBalance = Math.round((simulated.lowestBalance - base.lowestBalance) * 100) / 100;
  const bufferShortfall = simulated.lowestBalance < profile.desiredBuffer 
    ? Math.round((profile.desiredBuffer - simulated.lowestBalance) * 100) / 100
    : undefined;

  return {
    amount,
    date,
    description,
    impactOnEndBalance,
    impactOnLowestBalance,
    newLowestBalance: simulated.lowestBalance,
    newEndBalance: simulated.endOfMonthBalance,
    bufferShortfall,
  };
}

/**
 * Genereer transparante, regel-gebaseerde meldingen (maximaal 3 meldingen, max 2 zinnen per melding)
 */
export function generateRuleBasedAlerts(
  lowestBalance: number,
  lowestBalanceDate: string,
  endBalance: number,
  profile: UserProfile,
  activities: Activity[]
): AlertNotification[] {
  const alerts: AlertNotification[] = [];

  const formatDateNl = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parseInt(parts[2], 10)} oktober`;
    }
    return dateStr;
  };

  const buffer = profile.desiredBuffer;

  // Regel 1: Financiële buffer bewaking (op basis van het laagste saldo!)
  if (lowestBalance < buffer) {
    const shortfall = Math.round((buffer - lowestBalance) * 100) / 100;
    alerts.push({
      id: 'alert-buffer-under',
      type: 'warning',
      title: 'Buffer dreigt te worden onderschreden',
      sentence1: `Op ${formatDateNl(lowestBalanceDate)} zakt je verwachte saldo naar €${formatPrice(lowestBalance)}, wat €${formatPrice(shortfall)} onder je buffer van €${formatPrice(buffer)} is.`,
      sentence2: 'Pas eventueel een activiteit aan of kies "Ik betaal niet" om boven je buffer te blijven.',
      actionTargetTab: 'agenda',
      actionText: 'Bekijk agenda',
      explanationDetails: `Het laagste punt vindt plaats op ${formatDateNl(lowestBalanceDate)}, vlak vóór het salaris van €1.200 op 15 oktober wordt gestort.`,
    });
  } else {
    alerts.push({
      id: 'alert-buffer-ok',
      type: 'success',
      title: 'Financiële buffer blijft de hele maand intact',
      sentence1: `Je saldo blijft te allen tijde boven je buffer van €${formatPrice(buffer)}.`,
      sentence2: `Het laagste punt is €${formatPrice(lowestBalance)} op ${formatDateNl(lowestBalanceDate)} (vlak voor je salaris).`,
      actionTargetTab: 'overview',
      explanationDetails: `Met een minimum van €${formatPrice(lowestBalance)} heb je nog een veiligheidsmarge van €${formatPrice(lowestBalance - buffer)} boven je buffer.`,
    });
  }

  // Regel 2: Check op activiteiten met "Onbekend"
  const unknownActivity = activities.find(a => !a.isPrivate && (a.costStatus === 'unknown' || (a.activityCost === null && !a.customTotalOverride)));
  if (unknownActivity) {
    alerts.push({
      id: 'alert-unknown-cost',
      type: 'warning',
      title: 'Activiteit met onbekende kosten',
      sentence1: `Voor "${unknownActivity.title}" op ${formatDateNl(unknownActivity.date)} is nog geen kostenschatting ingevuld.`,
      sentence2: 'Vul een richtbedrag in voor een betrouwbaardere financiële vooruitblik.',
      actionTargetTab: 'agenda',
      actionText: 'Kosten invullen',
    });
  } else {
    // Regel 2 alternatief: Weekend Parijs reeds voldaan reminder
    const parijsAct = activities.find(a => a.title.toLowerCase().includes('parijs') && !a.isPrivate);
    if (parijsAct) {
      alerts.push({
        id: 'alert-parijs-info',
        type: 'info',
        title: 'Weekend Parijs: trein & hotel reeds betaald',
        sentence1: 'De geboekte reis en het hotel (€420) zijn al voor oktober afgeschreven en tellen niet opnieuw mee.',
        sentence2: 'Alleen de geschatte €300 aan verblijfskosten ter plaatse wordt in oktober gereserveerd.',
        actionTargetTab: 'agenda',
        actionText: 'Bekijk reis',
      });
    }
  }

  // Regel 3: Grote uitgaven vóór salaris
  alerts.push({
    id: 'alert-timing-cashflow',
    type: 'info',
    title: 'Grote afschrijvingen vóór het salaris',
    sentence1: 'Op 2 en 5 oktober gaat in totaal €750 van je rekening voor huur en vaste lasten.',
    sentence2: 'Pas op 15 oktober wordt je salaris van €1.200 bijgeschreven.',
    actionTargetTab: 'overview',
  });

  return alerts.slice(0, 3);
}

export function formatPrice(amount: number): string {
  return amount.toLocaleString('nl-NL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
