import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Activity, 
  AdviceCard,
  AppliedCorrection,
  CostStatus, 
  FixedTransaction, 
  ScenarioSimulation,
  UserProfile 
} from './types';
import { 
  generateOctoberTimeline 
} from './utils/calculations';
import { dataLayer } from './services/dataLayer';
import { Navbar } from './components/Navbar';
import { OverviewTab } from './components/OverviewTab';
import { AgendaTab } from './components/AgendaTab';
import { ProfileTab } from './components/ProfileTab';
import { CostExplanationModal } from './components/CostExplanationModal';
import { ActivityModal } from './components/ActivityModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'agenda' | 'profile'>('overview');

  // Multi-user state (isolated per user)
  const [usersList, setUsersList] = useState<Array<{ id: string; name: string; standardTransport: string }>>([
    { id: 'user-noor', name: 'Noor', standardTransport: 'Auto' },
    { id: 'user-daan', name: 'Daan', standardTransport: 'Fiets' },
    { id: 'user-samira', name: 'Samira', standardTransport: 'OV' },
  ]);
  const [currentUserId, setCurrentUserId] = useState<string>('user-noor');

  // User dataset state
  const [profile, setProfile] = useState<UserProfile>({
    id: 'user-noor',
    name: 'Noor',
    hobbies: ['Padel spelen', 'Uit eten gaan', 'Citytrips maken'],
    routines: ['Wekelijkse sportavond', 'Maandelijkse borrel/diner met vrienden'],
    preferences: ['Standaard reizen met eigen auto', 'Gezonde maaltijden'],
    standardTransport: 'Auto',
    departureLocation: 'Utrecht (Thuis)',
    fuelConsumptionLPer100Km: 6.0,
    fuelPricePerLiter: 1.80,
    desiredBuffer: 500.00,
    dailyExpensesReserve: 250.00,
  });

  const [activities, setActivities] = useState<Activity[]>([]);
  const [fixedTransactions, setFixedTransactions] = useState<FixedTransaction[]>([]);
  const [initialBalance, setInitialBalance] = useState<number>(1800.00);
  const [dataVersion, setDataVersion] = useState<number>(1);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toISOString());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Proactive advice cards state
  const [adviceCards, setAdviceCards] = useState<AdviceCard[]>([]);

  // Corrections and Undo state
  const [lastCorrection, setLastCorrection] = useState<AppliedCorrection | null>(null);

  // Modals state
  const [explainingActivity, setExplainingActivity] = useState<Activity | null>(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  // Scenario simulation
  const [activeScenario, setActiveScenario] = useState<ScenarioSimulation | null>(null);

  // Load user data from server data layer
  const loadUserData = useCallback(async (userId: string) => {
    try {
      setIsRefreshing(true);
      const data = await dataLayer.getUserData(userId);
      setProfile(data.profile);
      setActivities(data.activities);
      setFixedTransactions(data.fixedTransactions);
      setInitialBalance(data.initialBalance);
      setDataVersion(data.dataVersion);
      setLastSyncTime(data.lastSyncTime);

      // Load proactive advice cards for this user
      const advice = await dataLayer.getProactiveAdvice(userId);
      setAdviceCards(advice.cards);
    } catch (err) {
      console.error('Fout bij laden van gebruikersgegevens:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Fetch users list on mount
  useEffect(() => {
    dataLayer.getUsers().then(users => {
      if (users.length > 0) setUsersList(users);
    });
  }, []);

  // Switch user handler (strictly clears previous user's data)
  const handleSwitchUser = async (newUserId: string) => {
    setCurrentUserId(newUserId);
    setAdviceCards([]); // Clear immediately so no cross-user data lingers
    setLastCorrection(null);
    setActiveScenario(null);
    await loadUserData(newUserId);
  };

  // Initial load
  useEffect(() => {
    loadUserData(currentUserId);
  }, [currentUserId, loadUserData]);

  // Periodic polling every 60 seconds while app is open
  useEffect(() => {
    const timer = setInterval(() => {
      loadUserData(currentUserId);
    }, 60000);
    return () => clearInterval(timer);
  }, [currentUserId, loadUserData]);

  // Explicit refresh button handler
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      const data = await dataLayer.refreshUserData(currentUserId);
      setProfile(data.profile);
      setActivities(data.activities);
      setFixedTransactions(data.fixedTransactions);
      setDataVersion(data.dataVersion);
      setLastSyncTime(data.lastSyncTime);

      const advice = await dataLayer.getProactiveAdvice(currentUserId);
      setAdviceCards(advice.cards);
    } catch (e) {
      console.error('Vernieuwen mislukt:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Financial calculations
  const {
    days,
    lowestBalance,
    lowestBalanceDate,
    endOfMonthBalance,
    totalIncome,
    totalFixedExpenses,
    totalActivitiesCost,
    totalDailyExpenses,
  } = useMemo(() => {
    const extra = activeScenario ? {
      date: activeScenario.date,
      amount: activeScenario.amount,
      description: activeScenario.description,
    } : undefined;

    return generateOctoberTimeline(initialBalance, fixedTransactions, activities, profile, extra);
  }, [initialBalance, fixedTransactions, activities, profile, activeScenario]);

  // Execute primary action on proactive advice card
  const handleExecutePrimaryAction = async (card: AdviceCard) => {
    if (!card.primaryAction) return;

    if (card.primaryAction.actionType === 'change_transport') {
      const actId = card.primaryAction.payload?.activityId;
      const newTransport = card.primaryAction.payload?.newTransport || 'Fiets';
      const targetAct = activities.find(a => a.id === actId);

      if (targetAct) {
        const previousState = { ...targetAct };
        const summary = `Vervoer naar ${targetAct.title} aangepast naar ${newTransport} (geen brandstof- en parkeerkosten)`;

        const updated = await dataLayer.applyCorrection(
          currentUserId, 
          actId, 
          'change_transport', 
          summary, 
          previousState, 
          false
        );

        setActivities(updated.activities);
        setDataVersion(updated.dataVersion);
        setLastSyncTime(updated.lastSyncTime);
        setLastCorrection({
          activityId: actId,
          action: 'change_transport',
          summaryWhatChanged: summary,
          previousActivityState: previousState,
        });

        // Refresh advice cards
        const advice = await dataLayer.getProactiveAdvice(currentUserId);
        setAdviceCards(advice.cards);
      }
    } else if (card.primaryAction.actionType === 'resolve_ambiguity') {
      const actId = card.primaryAction.payload?.activityId;
      const targetAct = activities.find(a => a.id === actId);
      if (targetAct) {
        setEditingActivity(targetAct);
        setIsActivityModalOpen(true);
      }
    } else if (card.primaryAction.actionType === 'view_agenda') {
      setActiveTab('agenda');
    } else if (card.primaryAction.actionType === 'view_timeline') {
      setActiveTab('overview');
    }
  };

  // Execute secondary actions on proactive advice card
  const handleExecuteSecondaryAction = async (card: AdviceCard, actionType: string, payload?: any) => {
    const actId = card.activityId || payload?.activityId;
    if (!actId) return;

    if (actionType === 'set_category_dinner') {
      const updated = await dataLayer.updateActivity(currentUserId, actId, {
        category: 'Eten & Drinken',
        activityCost: 50.00,
        isActivityCostUnknown: false,
        explanationNote: 'Etentje bevestigd via advieskaart. Geschat op €50.',
      });
      setActivities(updated.activities);
      const advice = await dataLayer.getProactiveAdvice(currentUserId);
      setAdviceCards(advice.cards);
    } else if (actionType === 'set_category_sport') {
      const updated = await dataLayer.updateActivity(currentUserId, actId, {
        category: 'Sport & Hobby',
        activityCost: 18.00,
        isActivityCostUnknown: false,
        explanationNote: 'Sportafspraak bevestigd via advieskaart. Deelname geschat op €18.',
      });
      setActivities(updated.activities);
      const advice = await dataLayer.getProactiveAdvice(currentUserId);
      setAdviceCards(advice.cards);
    } else if (actionType === 'set_category_free') {
      const updated = await dataLayer.updateActivity(currentUserId, actId, {
        category: 'Sociaal',
        activityCost: 0,
        isActivityCostUnknown: false,
        explanationNote: 'Afspraak zonder kosten (€0) bevestigd via advieskaart.',
      });
      setActivities(updated.activities);
      const advice = await dataLayer.getProactiveAdvice(currentUserId);
      setAdviceCards(advice.cards);
    } else if (actionType === 'confirm_transport') {
      await dataLayer.dismissAdviceCard(currentUserId, card.id);
      const advice = await dataLayer.getProactiveAdvice(currentUserId);
      setAdviceCards(advice.cards);
    }
  };

  // Dismiss card
  const handleDismissCard = async (cardId: string, reason: 'dismissed' | 'irrelevant' | 'later') => {
    await dataLayer.dismissAdviceCard(currentUserId, cardId);
    setAdviceCards(prev => prev.filter(c => c.id !== cardId));
  };

  // Undo last correction
  const handleUndoLastCorrection = async () => {
    if (!lastCorrection) return;
    try {
      const updated = await dataLayer.undoCorrection(currentUserId, lastCorrection.activityId);
      setActivities(updated.activities);
      setDataVersion(updated.dataVersion);
      setLastSyncTime(updated.lastSyncTime);
      setLastCorrection(null);

      const advice = await dataLayer.getProactiveAdvice(currentUserId);
      setAdviceCards(advice.cards);
    } catch (err) {
      console.error('Fout bij ongedaan maken:', err);
    }
  };

  // Ask question specifically about an advice card ("Waarom?" modal)
  const handleAskCardQuestion = async (card: AdviceCard, question: string): Promise<string> => {
    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          message: `Vraag over advieskaart "${card.title}": ${question}`,
          userProfile: profile,
          activities,
          fixedTransactions,
          currentBalance: initialBalance,
          lowestBalance,
          lowestBalanceDate,
          endOfMonthBalance,
          desiredBuffer: profile.desiredBuffer,
        }),
      });

      const data = await response.json();
      return data.result?.replyText || 'De berekening is gebaseerd op je actuele agenda en vaste contractlasten.';
    } catch {
      return 'Kon geen antwoord ophalen van de AI-assistent.';
    }
  };

  // Quick toggle status for activities (e.g. "Ik betaal niet")
  const handleQuickToggleStatus = async (activityId: string, newStatus: CostStatus) => {
    const updated = await dataLayer.updateActivity(currentUserId, activityId, {
      costStatus: newStatus,
    });
    setActivities(updated.activities);
    const advice = await dataLayer.getProactiveAdvice(currentUserId);
    setAdviceCards(advice.cards);
  };

  // Add / Edit activity
  const handleSaveActivity = async (savedAct: Activity) => {
    const exists = activities.some(a => a.id === savedAct.id);
    let updated: any;
    if (exists) {
      updated = await dataLayer.updateActivity(currentUserId, savedAct.id, savedAct);
    } else {
      updated = await dataLayer.addActivity(currentUserId, savedAct);
    }
    setActivities(updated.activities);
    setDataVersion(updated.dataVersion);
    setLastSyncTime(updated.lastSyncTime);
    setIsActivityModalOpen(false);
    setEditingActivity(null);

    // Refresh advice cards automatically
    const advice = await dataLayer.getProactiveAdvice(currentUserId);
    setAdviceCards(advice.cards);
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (window.confirm('Weet je zeker dat je deze activiteit wilt verwijderen?')) {
      const updated = await dataLayer.deleteActivity(currentUserId, activityId);
      setActivities(updated.activities);
      setDataVersion(updated.dataVersion);
      setLastSyncTime(updated.lastSyncTime);

      const advice = await dataLayer.getProactiveAdvice(currentUserId);
      setAdviceCards(advice.cards);
    }
  };

  // Demo reset
  const handleResetDemo = async () => {
    if (window.confirm('Weet je zeker dat je de demogegevens wilt herstellen voor deze gebruiker?')) {
      const updated = await dataLayer.resetUserDemo(currentUserId);
      setProfile(updated.profile);
      setActivities(updated.activities);
      setFixedTransactions(updated.fixedTransactions);
      setInitialBalance(updated.initialBalance);
      setDataVersion(updated.dataVersion);
      setLastSyncTime(updated.lastSyncTime);
      setLastCorrection(null);
      setActiveScenario(null);

      const advice = await dataLayer.getProactiveAdvice(currentUserId);
      setAdviceCards(advice.cards);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Navigation & Header */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onResetDemo={handleResetDemo}
        activitiesCount={activities.length}
        currentUserId={currentUserId}
        usersList={usersList}
        onSwitchUser={handleSwitchUser}
        onRefreshData={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'overview' && (
          <OverviewTab
            initialBalance={initialBalance}
            endBalance={endOfMonthBalance}
            lowestBalance={lowestBalance}
            lowestBalanceDate={lowestBalanceDate}
            days={days}
            profile={profile}
            activities={activities}
            fixedTransactions={fixedTransactions}
            adviceCards={adviceCards}
            lastSyncTime={lastSyncTime}
            dataVersion={dataVersion}
            activeScenario={activeScenario}
            lastCorrection={lastCorrection}
            onClearScenario={() => setActiveScenario(null)}
            onNavigateTab={setActiveTab}
            onOpenCostExplanation={(act) => setExplainingActivity(act)}
            onOpenAddActivity={() => {
              setEditingActivity(null);
              setIsActivityModalOpen(true);
            }}
            onExecutePrimaryAction={handleExecutePrimaryAction}
            onExecuteSecondaryAction={handleExecuteSecondaryAction}
            onDismissAdviceCard={handleDismissCard}
            onUndoLastCorrection={handleUndoLastCorrection}
            onAskCardQuestion={handleAskCardQuestion}
            onRefreshData={handleRefresh}
            isRefreshing={isRefreshing}
            onQuickToggleStatus={handleQuickToggleStatus}
          />
        )}

        {activeTab === 'agenda' && (
          <AgendaTab
            activities={activities}
            profile={profile}
            onAddActivity={() => {
              setEditingActivity(null);
              setIsActivityModalOpen(true);
            }}
            onEditActivity={(act) => {
              setEditingActivity(act);
              setIsActivityModalOpen(true);
            }}
            onDeleteActivity={handleDeleteActivity}
            onUpdateStatus={(id, status) => handleQuickToggleStatus(id, status)}
            onOpenCostExplanation={(act) => setExplainingActivity(act)}
            onQuickOverrideCost={(id, amount) => {
              dataLayer.updateActivity(currentUserId, id, { customTotalOverride: amount }).then(res => {
                setActivities(res.activities);
              });
            }}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileTab
            profile={profile}
            onUpdateProfile={(updated) => {
              setProfile(updated);
            }}
            onResetDemo={handleResetDemo}
            onQuickScenario={(type) => {
              if (type === 'no_dinner_pay') {
                handleQuickToggleStatus('act-etentje', 'i_do_not_pay');
                setActiveTab('overview');
              } else if (type === 'buffer_900') {
                setProfile(prev => ({ ...prev, desiredBuffer: 900 }));
                setActiveTab('overview');
              } else if (type === 'fuel_210') {
                setProfile(prev => ({ ...prev, fuelPricePerLiter: 2.10 }));
                setActiveTab('overview');
              }
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 text-xs text-slate-500 text-center">
        <div className="max-w-6xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-700">
            Vooruit • Proactieve Financiële Assistent
          </p>
          <p className="text-slate-400">
            AI begrijpt; de app rekent. Afzonderlijke gegevenslaag met strikte gebruikersscheiding.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <CostExplanationModal
        activity={explainingActivity}
        profile={profile}
        onClose={() => setExplainingActivity(null)}
        onUpdateStatus={(id, status) => handleQuickToggleStatus(id, status)}
      />

      <ActivityModal
        activity={editingActivity}
        profile={profile}
        isOpen={isActivityModalOpen}
        onClose={() => {
          setIsActivityModalOpen(false);
          setEditingActivity(null);
        }}
        onSave={handleSaveActivity}
      />
    </div>
  );
}
