import { Activity, AdviceCard, FixedTransaction, UserProfile, UserData } from '../src/types';
import { generateOctoberTimeline, calculateActivityBreakdown, formatPrice } from '../src/utils/calculations';

export function generateProactiveAdviceCards(
  userData: UserData,
  currentSimulatedDate: string = '2026-10-01'
): AdviceCard[] {
  const { profile, activities, fixedTransactions, initialBalance } = userData;

  // Compute exact financial metrics
  const timeline = generateOctoberTimeline(initialBalance, fixedTransactions, activities, profile);
  const { lowestBalance, lowestBalanceDate, endOfMonthBalance } = timeline;
  const buffer = profile.desiredBuffer;

  const candidateCards: AdviceCard[] = [];

  // Helper date formatter
  const formatDateNl = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parseInt(parts[2], 10)} oktober`;
    return dateStr;
  };

  // 1. Veranderkaart (Change Card): If a user correction or change was recently applied
  if (userData.corrections && userData.corrections.length > 0) {
    const recentCorrection = userData.corrections[userData.corrections.length - 1];
    candidateCards.push({
      id: `card-change-${recentCorrection.id}`,
      activityId: recentCorrection.activityId,
      category: 'change_detected',
      title: 'Aanpassing direct doorgerekend',
      summary: `${recentCorrection.summaryWhatChanged}. Je verwachte eindsaldo is direct bijgewerkt naar €${formatPrice(endOfMonthBalance)}.`,
      relevantAmount: endOfMonthBalance,
      badge: 'Verandering',
      priority: 1, // High priority to provide proactive feedback on changes
      primaryAction: {
        label: 'Bekijk verloop',
        actionType: 'view_timeline',
      },
      whyExplanation: {
        calculation: `Actie "${recentCorrection.action}" uitgevoerd. Nieuw eindsaldo op 31 oktober is €${formatPrice(endOfMonthBalance)} (laagste punt: €${formatPrice(lowestBalance)} op ${formatDateNl(lowestBalanceDate)}).`,
        dataUsed: [`Correctie: ${recentCorrection.summaryWhatChanged}`, `Geregistreerd: ${new Date(recentCorrection.createdAt).toLocaleTimeString('nl-NL')}`],
        assumptions: [recentCorrection.isPermanentRoutine ? 'Opgeslagen als permanente routinevoorkeur' : 'Geldt voor deze specifieke afspraak'],
        sourceOrPolicy: 'Verwerkt via Vooruit gegevenslaag',
      },
      status: 'active',
    });
  }

  // 2. Buffer Warning Card (Priority 1/2 if lowestBalance < buffer)
  if (lowestBalance < buffer) {
    const shortfall = Math.round((buffer - lowestBalance) * 100) / 100;
    candidateCards.push({
      id: `card-buffer-${lowestBalanceDate}`,
      category: 'buffer_alert',
      title: 'Buffer dreigt te worden onderschreden',
      summary: `Op ${formatDateNl(lowestBalanceDate)} zakt je verwachte saldo naar €${formatPrice(lowestBalance)}, wat €${formatPrice(shortfall)} onder je gewenste buffer van €${formatPrice(buffer)} is.`,
      relevantAmount: shortfall,
      badge: 'Knelpunt',
      priority: 1,
      primaryAction: {
        label: 'Bekijk aanpasbare uitgaven',
        actionType: 'view_agenda',
      },
      whyExplanation: {
        calculation: `Beginsaldo €${formatPrice(initialBalance)} verminderd met vaste lasten en geplande uitgaven tot ${formatDateNl(lowestBalanceDate)} brengt het saldo op €${formatPrice(lowestBalance)}. Gewenste buffer is €${formatPrice(buffer)} (tekort: €${formatPrice(shortfall)}).`,
        dataUsed: ['Beginsaldo 1 okt', 'Vaste contractlasten vóór salarisdatum', 'Geplande agenda-uitgaven'],
        assumptions: ['Salaris of inkomsten volgen conform planning', `Gereserveerd leefgeld: €${profile.dailyExpensesReserve} over de maand`],
        sourceOrPolicy: 'Zelfingestelde persoonlijke buffer in Vooruit profiel',
      },
      status: 'active',
    });
  }

  // 3. Ambiguity Check Cards (Activities with vague titles or unknown cost)
  const ambiguousAct = activities.find(a => 
    !a.isPrivate && 
    (a.costStatus === 'unknown' || (a.activityCost === null && !a.customTotalOverride) || a.title.toLowerCase().includes('thomas') || a.title.toLowerCase().includes('afspraak met'))
  );

  if (ambiguousAct) {
    candidateCards.push({
      id: `card-ambiguity-${ambiguousAct.id}`,
      activityId: ambiguousAct.id,
      category: 'ambiguity',
      title: `Type afspraak: ${ambiguousAct.title}`,
      summary: `Het doel van "${ambiguousAct.title}" op ${formatDateNl(ambiguousAct.date)} is nog niet duidelijk. De app rekent niet automatisch restaurantkosten zonder toelichting.`,
      badge: 'Verduidelijking',
      priority: 2,
      primaryAction: {
        label: 'Kies type activiteit',
        actionType: 'resolve_ambiguity',
        payload: { activityId: ambiguousAct.id },
      },
      secondaryActions: [
        { label: 'Etentje (€50)', actionType: 'set_category_dinner', payload: { activityId: ambiguousAct.id } },
        { label: 'Sport (€18)', actionType: 'set_category_sport', payload: { activityId: ambiguousAct.id } },
        { label: 'Geen kosten (€0)', actionType: 'set_category_free', payload: { activityId: ambiguousAct.id } },
      ],
      whyExplanation: {
        calculation: 'Geen automatische aanname op basis van een vage naam. Pas na bevestiging wordt een kostenpost berekend.',
        dataUsed: [`Agenda-titel: "${ambiguousAct.title}"`, `Datum: ${ambiguousAct.date}`],
        assumptions: ['Een afspraak met een persoon hoeft geen geld te kosten'],
        sourceOrPolicy: 'Vooruit principe: AI begrijpt, de app rekent controleerbaar',
      },
      status: 'active',
    });
  }

  // 4. Proactive Travel Preparation Card (e.g. Paris or London trip)
  const travelAct = activities.find(a => 
    !a.isPrivate && 
    (a.category === 'Reizen & Uitstapjes' || a.location.toLowerCase().includes('parijs') || a.location.toLowerCase().includes('londen') || a.title.toLowerCase().includes('reis') || a.title.toLowerCase().includes('weekend'))
  );

  if (travelAct) {
    const isForeignCurrency = travelAct.location.toLowerCase().includes('londen') || travelAct.location.toLowerCase().includes('verenigd koninkrijk');
    const breakdown = calculateActivityBreakdown(travelAct, profile);

    if (isForeignCurrency) {
      candidateCards.push({
        id: `card-travel-${travelAct.id}`,
        activityId: travelAct.id,
        category: 'trip_prep',
        title: `Voorbereiding ${travelAct.title}`,
        summary: `Je reist naar het VK met Britse Ponden (GBP). Let op mogelijke koersopslagen van je bank bij pintransacties buiten de eurozone.`,
        relevantAmount: breakdown.effectiveCost,
        badge: 'Valuta & Reis',
        priority: 2,
        primaryAction: {
          label: 'Bekijk reisbegroting',
          actionType: 'view_agenda',
        },
        whyExplanation: {
          calculation: `Geschatte resterende uitgaven: £280 (ca. €${formatPrice(breakdown.effectiveCost)}). Reeds voldane Eurostar/hotel vallen al binnen het huidige saldo.`,
          dataUsed: ['Reisbestemming: Londen, VK', 'Historische eerdere stedentrips: £250 - £300'],
          assumptions: ['Betaalkaart staat standaard ingesteld op Europa/Wereld', 'Verzekeringsdekking is hier niet bekend; controleer je eigen polis.'],
          sourceOrPolicy: 'Officiële betaalrichtlijnen niet-eurozone betalingen',
          verifiedDate: '1 oktober 2026',
        },
        status: 'active',
      });
    } else {
      // Eurozone trip (e.g. Paris)
      candidateCards.push({
        id: `card-travel-${travelAct.id}`,
        activityId: travelAct.id,
        category: 'trip_prep',
        title: `Voorbereiding ${travelAct.title}`,
        summary: `Je hotel en trein zijn al voldaan. Voor eten, metro en musea verwachten we nog ongeveer €${formatPrice(breakdown.effectiveCost)} aan uitgaven ter plaatse.`,
        relevantAmount: breakdown.effectiveCost,
        badge: 'Reisvoorbereiding',
        priority: 3,
        primaryAction: {
          label: 'Bekijk reisbudget',
          actionType: 'view_agenda',
        },
        whyExplanation: {
          calculation: `Resterend ter plaatse: €${formatPrice(breakdown.effectiveCost)} (gemiddeld €100/dag over 3 dagen). Trein & hotel (€420) zijn al voldaan vóór 1 oktober en worden niet dubbel meegerekend.`,
          dataUsed: [`Agenda ${travelAct.title}`, '3 eerdere stedentrips (€250, €300, €350)'],
          assumptions: ['Eurozone (geen wisselkoersopslag)', 'EU-roaming dekt mobiel dataverkeer conform thuisbundel', 'Verzekeringsdekking is hier niet bekend; controleer je eigen polis.'],
          sourceOrPolicy: 'Europese Unie Roaming & Betalingsrichtlijn',
          verifiedDate: '1 oktober 2026',
        },
        status: 'active',
      });
    }
  }

  // 5. Transportation check card (Savings / Optimization: e.g. Car to Bike)
  const carSportAct = activities.find(a => 
    !a.isPrivate && 
    a.transportMode === 'Auto' && 
    a.costStatus === 'normal'
  );

  if (carSportAct) {
    const breakdown = calculateActivityBreakdown(carSportAct, profile);

    if (breakdown.transportTotal > 0) {
      const fuelAndParking = breakdown.transportTotal;
      candidateCards.push({
        id: `card-transport-${carSportAct.id}`,
        activityId: carSportAct.id,
        category: 'transport_check',
        title: `Vervoerscheck ${carSportAct.title}`,
        summary: `${carSportAct.title} kost naar schatting €${formatPrice(breakdown.effectiveCost)}, inclusief €${formatPrice(fuelAndParking)} voor brandstof en parkeren. Ga je op de fiets?`,
        relevantAmount: breakdown.effectiveCost,
        badge: 'Besparingstip',
        priority: 4,
        primaryAction: {
          label: `Ik ga fietsen (-€${formatPrice(fuelAndParking)})`,
          actionType: 'change_transport',
          payload: { activityId: carSportAct.id, newTransport: 'Fiets' },
        },
        secondaryActions: [
          { label: 'Ja, met de auto', actionType: 'confirm_transport', payload: { activityId: carSportAct.id } },
        ],
        whyExplanation: {
          calculation: `Deelname €${formatPrice(carSportAct.activityCost || 0)} + ${carSportAct.distanceKmOneWay * (carSportAct.isReturnTrip ? 2 : 1)} km retour × (${profile.fuelConsumptionLPer100Km}L/100km) × €${formatPrice(profile.fuelPricePerLiter)}/L = €${formatPrice(breakdown.fuelCost)} benzine + €${formatPrice(breakdown.parkingCost)} parkeren = €${formatPrice(breakdown.effectiveCost)} totaal.`,
          dataUsed: [`Vertrekpunt: ${profile.departureLocation}`, `Afstand: ${carSportAct.distanceKmOneWay} km enkele reis`, `Brandstofprijs: €${formatPrice(profile.fuelPricePerLiter)}/L`],
          assumptions: ['Brandstofkosten zijn puur verbruikskosten (geen afschrijving of verzekering)'],
          sourceOrPolicy: 'Berekening brandstofkosten Vooruit formule',
        },
        status: 'active',
        routineQuestion: `Wil je fietsen voortaan als standaardinstelling voor ${carSportAct.title.toLowerCase()} bewaren?`,
      });
    }
  }

  // 6. Positive Buffer Safety Card (If buffer is safe and fewer than 3 cards present)
  if (lowestBalance >= buffer && candidateCards.length < 3) {
    const margin = Math.round((lowestBalance - buffer) * 100) / 100;
    candidateCards.push({
      id: 'card-buffer-safe',
      category: 'savings_tip',
      title: 'Financiële buffer blijft de hele maand intact',
      summary: `Je saldo blijft te allen tijde minimaal €${formatPrice(lowestBalance)} (op ${formatDateNl(lowestBalanceDate)}), ruim €${formatPrice(margin)} boven je buffer van €${formatPrice(buffer)}.`,
      relevantAmount: lowestBalance,
      badge: 'Op koers',
      priority: 5,
      primaryAction: {
        label: 'Bekijk financieel verloop',
        actionType: 'view_timeline',
      },
      whyExplanation: {
        calculation: `Laagste punt van €${formatPrice(lowestBalance)} op ${formatDateNl(lowestBalanceDate)} ligt ruim boven je gekozen buffer van €${formatPrice(buffer)}.`,
        dataUsed: ['Beginsaldo', 'Vaste contractlasten', 'Geplande agenda-uitgaven'],
        assumptions: [`Reservering van €${formatPrice(profile.dailyExpensesReserve)} voor dagelijkse leefuitgaven`],
      },
      status: 'active',
    });
  }

  // Sort candidate cards by priority (1 is highest) and return top 3
  const activeCards = candidateCards
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3); // Maximaal 3 advieskaarten tegelijk tonen voor rust en overzicht!

  return activeCards;
}
