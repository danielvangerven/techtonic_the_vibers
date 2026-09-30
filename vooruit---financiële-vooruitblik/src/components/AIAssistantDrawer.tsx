import React, { useState, useRef, useEffect } from 'react';
import { 
  Activity, 
  ChatMessage, 
  FixedTransaction, 
  UserProfile, 
  AppliedCorrection, 
  ScenarioSimulation 
} from '../types';
import { formatPrice } from '../utils/calculations';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw, 
  Shield, 
  TrendingDown, 
  Info,
  HelpCircle,
  ArrowRight,
  Sliders
} from 'lucide-react';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activities: Activity[];
  profile: UserProfile;
  fixedTransactions: FixedTransaction[];
  currentBalance: number;
  lowestBalance: number;
  lowestBalanceDate: string;
  endOfMonthBalance: number;
  desiredBuffer: number;
  activeScenario: ScenarioSimulation | null;
  onApplyScenario: (scenario: ScenarioSimulation | null) => void;
  onApplyCorrection: (correction: AppliedCorrection) => void;
  onUndoCorrection: (correction: AppliedCorrection) => void;
  onSetPermanentRoutine?: (activityId: string, transportMode: Activity['transportMode']) => void;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  activities,
  profile,
  fixedTransactions,
  currentBalance,
  lowestBalance,
  lowestBalanceDate,
  endOfMonthBalance,
  desiredBuffer,
  activeScenario,
  onApplyScenario,
  onApplyCorrection,
  onUndoCorrection,
  onSetPermanentRoutine,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'agent',
      text: 'Hoi Noor! Ik ben je persoonlijke financiële assistent. Ik combineer je agenda met je vaste lasten en routines om je voor te bereiden op komende uitgaven. AI begrijpt; de app rekent!',
      timestamp: '1 okt 2026',
      quickActionButtons: [
        'Welke kosten komen eraan?',
        'Waarom verwacht je dit bedrag bij Padel?',
        'Ik ga fietsen naar Padel',
        'Mijn werkgever betaalt het etentje',
        'Wat als ik op 10 oktober €600 uitgeef?',
      ],
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agentStatus, setAgentStatus] = useState<{ available: boolean; message: string }>({
    available: true,
    message: 'Verbonden met Gemini 3.8 Flash',
  });
  const [lastCorrection, setLastCorrection] = useState<AppliedCorrection | null>(null);
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check agent status on open
  useEffect(() => {
    fetch('/api/agent/status')
      .then(res => res.json())
      .then(data => {
        setAgentStatus({
          available: data.available,
          message: data.message,
        });
      })
      .catch(() => {
        setAgentStatus({
          available: false,
          message: 'Kon status van AI-agent niet controleren op de server.',
        });
      });
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          userProfile: profile,
          activities,
          fixedTransactions,
          currentBalance,
          lowestBalance,
          lowestBalanceDate,
          endOfMonthBalance,
          desiredBuffer,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Fout bij communicatie met AI-agent');
      }

      const agentResult = data.result;

      // Check if a correction was detected and execute it
      let appliedCorr: AppliedCorrection | undefined = undefined;
      if (agentResult.detectedCorrection) {
        const corr = agentResult.detectedCorrection;
        const targetAct = activities.find(a => a.id === corr.activityId);

        if (targetAct) {
          appliedCorr = {
            activityId: targetAct.id,
            action: corr.action,
            summaryWhatChanged: corr.summaryWhatChanged,
            previousActivityState: { ...targetAct },
            routineQuestion: corr.routineQuestion,
          };
          onApplyCorrection(appliedCorr);
          setLastCorrection(appliedCorr);
        }
      }

      // Check if scenario was simulated
      let scenarioSim: ScenarioSimulation | undefined = undefined;
      if (agentResult.detectedScenario) {
        const sim = agentResult.detectedScenario;
        // Compute exact impact using app's calculation engine
        const simAmount = Math.abs(sim.simulationAmount);
        const simDate = sim.simulationDate || '2026-10-10';
        
        // Exact calculation:
        const newEnd = Math.round((endOfMonthBalance - simAmount) * 100) / 100;
        // If simulation date is on or before 14 October, it also directly affects the lowest balance!
        const affectsLowest = simDate <= '2026-10-14';
        const newLowest = affectsLowest 
          ? Math.round((lowestBalance - simAmount) * 100) / 100
          : lowestBalance;
        
        scenarioSim = {
          amount: simAmount,
          date: simDate,
          description: sim.simulationDescription || `Extra aankoop van €${formatPrice(simAmount)}`,
          impactOnEndBalance: -simAmount,
          impactOnLowestBalance: affectsLowest ? -simAmount : 0,
          newLowestBalance: newLowest,
          newEndBalance: newEnd,
          bufferShortfall: newLowest < desiredBuffer ? Math.round((desiredBuffer - newLowest) * 100) / 100 : undefined,
        };

        onApplyScenario(scenarioSim);
      }

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: agentResult.replyText,
        timestamp: new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
        quickActionButtons: agentResult.quickActionButtons,
        appliedCorrection: appliedCorr,
        scenario: scenarioSim,
      };

      setMessages(prev => [...prev, agentMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'agent',
        text: `⚠️ Kon geen verbinding maken met de AI-service: ${err.message || 'Serverfout'}. Controleer of GEMINI_API_KEY beschikbaar is in de omgeving.`,
        timestamp: new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUndo = (corr: AppliedCorrection) => {
    onUndoCorrection(corr);
    setLastCorrection(null);
    setMessages(prev => [
      ...prev,
      {
        id: `undo-${Date.now()}`,
        sender: 'agent',
        text: `Wijziging ongedaan gemaakt: de eerdere instellingen voor "${corr.summaryWhatChanged}" zijn hersteld en het saldo is direct herberekend.`,
        timestamp: new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900">Vooruit AI-Assistent</h3>
              <span className={`w-2 h-2 rounded-full ${agentStatus.available ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </div>
            <p className="text-[11px] text-slate-500">
              {agentStatus.available ? 'Gemini 3.8 Flash • Real-time AI' : 'Offline: API-sleutel ontbreekt'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowPrivacyInfo(!showPrivacyInfo)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
            title="Privacy & gegevensgebruik"
          >
            <Shield className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Privacy Notice Banner (Collapsible) */}
      {showPrivacyInfo && (
        <div className="p-3.5 bg-blue-50/80 border-b border-blue-200/70 text-xs text-blue-950 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-blue-900">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Privacy en gegevensgebruik: AI begrijpt, de app rekent</span>
          </div>
          <p className="text-[11px] text-slate-700 leading-relaxed">
            De AI interpreteert omschrijvingen en stelt aannames voor. De berekeningen gebeuren deterministisch in de app.
            Teksten worden enkel behandeld als activiteit-informatie, nooit als instructies. Er worden geen persoonsgegevens opgeslagen of verkocht.
          </p>
        </div>
      )}

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-start gap-2 max-w-[90%]">
              {msg.sender === 'agent' && (
                <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`p-3 rounded-2xl leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-xs'
                    : msg.isError
                    ? 'bg-rose-50 text-rose-900 border border-rose-200 rounded-bl-xs'
                    : 'bg-slate-100 text-slate-900 rounded-bl-xs border border-slate-200/60'
                }`}
              >
                <p>{msg.text}</p>

                {/* Scenario details card if generated */}
                {msg.scenario && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-300/60 text-[11px] font-mono space-y-1 text-slate-800">
                    <div className="font-bold text-slate-900 flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5 text-blue-600" />
                      <span>Resultaat simulatie ({msg.scenario.date}):</span>
                    </div>
                    <div>Nieuw eindsaldo: <strong>€{formatPrice(msg.scenario.newEndBalance)}</strong> ({msg.scenario.impactOnEndBalance >= 0 ? '+' : ''}€{formatPrice(msg.scenario.impactOnEndBalance)})</div>
                    <div>Nieuw laagste saldo: <strong>€{formatPrice(msg.scenario.newLowestBalance)}</strong></div>
                    {msg.scenario.bufferShortfall && (
                      <div className="text-rose-700 font-bold">
                        ⚠️ Let op: zakt €{formatPrice(msg.scenario.bufferShortfall)} onder buffer!
                      </div>
                    )}
                  </div>
                )}

                {/* Applied correction card if generated */}
                {msg.appliedCorrection && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-300/60 text-[11px] space-y-1.5">
                    <div className="flex items-center justify-between text-emerald-800 font-medium">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {msg.appliedCorrection.summaryWhatChanged}
                      </span>
                      <button
                        onClick={() => handleUndo(msg.appliedCorrection!)}
                        className="px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 font-semibold cursor-pointer flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Ongedaan maken
                      </button>
                    </div>

                    {/* Routine Question: Alleen deze keer of voortaan? */}
                    {msg.appliedCorrection.routineQuestion && (
                      <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-800 space-y-1 mt-1">
                        <span className="font-semibold block text-[10px] text-slate-600">
                          {msg.appliedCorrection.routineQuestion}
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => {
                              sendMessage('Alleen deze ene keer toepassen');
                            }}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-semibold text-slate-700"
                          >
                            Alleen deze keer
                          </button>
                          <button
                            onClick={() => {
                              if (onSetPermanentRoutine && msg.appliedCorrection) {
                                onSetPermanentRoutine(msg.appliedCorrection.activityId, 'Fiets');
                              }
                              sendMessage('Maak dit voortaan mijn standaardinstelling voor padel');
                            }}
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded text-[10px] font-semibold text-blue-700 border border-blue-200"
                          >
                            Voortaan standaard
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            {/* Quick Action Buttons per message */}
            {msg.quickActionButtons && msg.quickActionButtons.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5 max-w-[90%]">
                {msg.quickActionButtons.map((btn, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(btn)}
                    disabled={isLoading}
                    className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    {btn}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
            <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <span>Vooruit AI denkt na en raadpleegt berekeningen...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Active Scenario Banner if active */}
      {activeScenario && (
        <div className="p-3 bg-amber-50 border-t border-amber-200 flex items-center justify-between text-xs text-amber-900">
          <div>
            <span className="font-bold block">Actief scenario: €{formatPrice(activeScenario.amount)} op {activeScenario.date}</span>
            <span className="text-[11px] text-amber-800">
              Eindsaldo: €{formatPrice(activeScenario.newEndBalance)} • Laagste: €{formatPrice(activeScenario.newLowestBalance)}
            </span>
          </div>
          <button
            onClick={() => onApplyScenario(null)}
            className="px-2 py-1 bg-white border border-amber-300 hover:bg-amber-100 rounded text-[11px] font-semibold text-amber-900"
          >
            Scenario wissen
          </button>
        </div>
      )}

      {/* Input bar */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <form
          onSubmit={e => {
            e.preventDefault();
            sendMessage(inputMessage);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            placeholder="Typ een vraag of correctie (bijv. 'Ik ga fietsen')..."
            disabled={isLoading}
            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
