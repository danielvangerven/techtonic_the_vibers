import React, { useState } from 'react';
import { AdviceCard, AppliedCorrection } from '../types';
import { formatPrice } from '../utils/calculations';
import { 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  ShieldCheck, 
  AlertTriangle, 
  ChevronRight, 
  X, 
  Send, 
  MessageSquare,
  Car,
  Plane,
  Tag,
  Check
} from 'lucide-react';

interface ProactiveAdviceCardsProps {
  cards: AdviceCard[];
  lastSyncTime: string;
  dataVersion: number;
  onExecutePrimaryAction: (card: AdviceCard) => void;
  onExecuteSecondaryAction?: (card: AdviceCard, actionType: string, payload?: any) => void;
  onDismissCard: (cardId: string, reason: 'dismissed' | 'irrelevant' | 'later') => void;
  lastCorrection: AppliedCorrection | null;
  onUndoLastCorrection: () => void;
  onAskCardQuestion: (card: AdviceCard, question: string) => Promise<string>;
}

export const ProactiveAdviceCards: React.FC<ProactiveAdviceCardsProps> = ({
  cards,
  lastSyncTime,
  dataVersion,
  onExecutePrimaryAction,
  onExecuteSecondaryAction,
  onDismissCard,
  lastCorrection,
  onUndoLastCorrection,
  onAskCardQuestion,
}) => {
  const [selectedWhyCard, setSelectedWhyCard] = useState<AdviceCard | null>(null);
  const [cardQuestion, setCardQuestion] = useState('');
  const [cardAnswer, setCardAnswer] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);
  const [showOptionsCardId, setShowOptionsCardId] = useState<string | null>(null);

  const handleOpenWhy = (card: AdviceCard) => {
    setSelectedWhyCard(card);
    setCardQuestion('');
    setCardAnswer(null);
  };

  const handleSendCardQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardQuestion.trim() || !selectedWhyCard || isAsking) return;

    setIsAsking(true);
    setCardAnswer(null);
    try {
      const answer = await onAskCardQuestion(selectedWhyCard, cardQuestion.trim());
      setCardAnswer(answer);
    } catch {
      setCardAnswer('Kon antwoord niet ophalen. Controleer de verbinding met de AI-assistent.');
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <section className="space-y-3">
      {/* Sectie Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Belangrijk voor jou
          </h2>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            (automatische proactieve adviezen)
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span>Laatst bijgewerkt: {new Date(lastSyncTime).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}</span>
          <span>•</span>
          <span className="font-mono">v{dataVersion}</span>
        </div>
      </div>

      {/* Undo Feedback Banner if a correction was just applied */}
      {lastCorrection && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-950 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">
              Aanpassing doorgevoerd: {lastCorrection.summaryWhatChanged}
            </span>
          </div>
          <button
            onClick={onUndoLastCorrection}
            className="px-2.5 py-1 bg-white border border-emerald-300 hover:bg-emerald-100 rounded-lg text-emerald-900 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Ongedaan maken</span>
          </button>
        </div>
      )}

      {/* Advieskaarten Grid */}
      {cards.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-6 text-center text-slate-500 space-y-1">
          <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
          <h3 className="text-sm font-bold text-slate-800">Geen dringende financiële aandachtspunten</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Je geplande uitgaven, vaste lasten en financiële buffer zijn in evenwicht. Zodra er iets verandert in je agenda of saldo, verschijnt hier vanzelf nieuw advies.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {cards.map(card => {
            const isBuffer = card.category === 'buffer_alert';
            const isTrip = card.category === 'trip_prep';
            const isAmbiguity = card.category === 'ambiguity';
            const isChange = card.category === 'change_detected';

            const cardBg = isBuffer 
              ? 'bg-rose-50/60 border-rose-200 text-rose-950' 
              : isTrip 
              ? 'bg-blue-50/50 border-blue-200/80 text-slate-900'
              : isAmbiguity
              ? 'bg-amber-50/60 border-amber-200 text-amber-950'
              : isChange
              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
              : 'bg-white border-slate-200/90 text-slate-900';

            return (
              <div
                key={card.id}
                className={`rounded-2xl border p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between ${cardBg}`}
              >
                {/* Top: Badge + Dismiss menu */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isBuffer 
                        ? 'bg-rose-100 text-rose-800' 
                        : isAmbiguity 
                        ? 'bg-amber-100 text-amber-900' 
                        : isChange
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {card.badge || 'Advies'}
                    </span>

                    <div className="relative">
                      <button
                        onClick={() => setShowOptionsCardId(showOptionsCardId === card.id ? null : card.id)}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-black/5 transition-colors cursor-pointer text-xs"
                        title="Opties voor deze kaart"
                      >
                        •••
                      </button>

                      {showOptionsCardId === card.id && (
                        <div className="absolute right-0 top-6 z-20 w-36 bg-white rounded-xl shadow-lg border border-slate-200 py-1 text-xs text-slate-700 animate-in fade-in">
                          <button
                            onClick={() => {
                              onDismissCard(card.id, 'dismissed');
                              setShowOptionsCardId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Afgehandeld</span>
                          </button>
                          <button
                            onClick={() => {
                              onDismissCard(card.id, 'later');
                              setShowOptionsCardId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                          >
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            <span>Later herinneren</span>
                          </button>
                          <button
                            onClick={() => {
                              onDismissCard(card.id, 'irrelevant');
                              setShowOptionsCardId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-1.5 text-slate-500 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5 text-slate-400" />
                            <span>Niet relevant</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Titel & Summary (max 2 korte zinnen, <= 30 woorden) */}
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-snug">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                      {card.summary}
                    </p>
                  </div>

                  {/* Secundaire interactieve keuzeknoppen (indien aanwezig, bijv. bij ambiguïteit) */}
                  {card.secondaryActions && card.secondaryActions.length > 0 && onExecuteSecondaryAction && (
                    <div className="pt-1 flex flex-wrap gap-1.5">
                      {card.secondaryActions.map((sec, idx) => (
                        <button
                          key={idx}
                          onClick={() => onExecuteSecondaryAction(card, sec.actionType, sec.payload)}
                          className="px-2 py-1 rounded-lg bg-white/90 hover:bg-white text-[11px] font-semibold text-slate-800 border border-slate-300 shadow-2xs hover:shadow-xs transition-colors cursor-pointer"
                        >
                          {sec.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom: Primaire Actie & 'Waarom?' */}
                <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenWhy(card)}
                    className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <HelpCircle className="w-3 h-3 text-slate-400" />
                    <span>Waarom?</span>
                  </button>

                  {card.primaryAction && (
                    <button
                      onClick={() => onExecutePrimaryAction(card)}
                      className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-all shadow-2xs hover:shadow-xs flex items-center gap-1 cursor-pointer ${
                        isBuffer
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : isAmbiguity
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : isChange
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <span>{card.primaryAction.label}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Waarom? Detail Modal met Controleerbare Onderbouwing & Verdiepingschat */}
      {selectedWhyCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">Waarom dit advies?</h3>
                  <p className="text-[11px] text-slate-500">{selectedWhyCard.title}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedWhyCard(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              {/* Samenvatting advies */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block mb-0.5">Het advies:</span>
                <p className="text-slate-700">{selectedWhyCard.summary}</p>
              </div>

              {/* Exacte berekening */}
              {selectedWhyCard.whyExplanation.calculation && (
                <div>
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block mb-1">
                    Exacte berekening & Formule:
                  </span>
                  <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl font-mono text-slate-800 leading-relaxed">
                    {selectedWhyCard.whyExplanation.calculation}
                  </div>
                </div>
              )}

              {/* Gebruikte gegevens & Aannames */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-800 block text-[11px]">Gebruikte gegevens:</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-600 text-[11px]">
                    {selectedWhyCard.whyExplanation.dataUsed.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-800 block text-[11px]">Aannames:</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-600 text-[11px]">
                    {selectedWhyCard.whyExplanation.assumptions.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Externe Bron of Beleid */}
              {selectedWhyCard.whyExplanation.sourceOrPolicy && (
                <div className="p-2.5 bg-slate-100 rounded-lg text-slate-600 text-[11px] flex items-center justify-between">
                  <span>Bron / Richtlijn: <strong>{selectedWhyCard.whyExplanation.sourceOrPolicy}</strong></span>
                  {selectedWhyCard.whyExplanation.verifiedDate && (
                    <span className="text-slate-400">Controledatum: {selectedWhyCard.whyExplanation.verifiedDate}</span>
                  )}
                </div>
              )}

              {/* Compact Gespreksvak voor Verdieping bij deze Kaart */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                  <span>Stel een verdiepende vraag over dit advies</span>
                </div>

                <form onSubmit={handleSendCardQuestion} className="flex gap-2">
                  <input
                    type="text"
                    value={cardQuestion}
                    onChange={e => setCardQuestion(e.target.value)}
                    placeholder="bijv. Hoeveel houd ik over na deze reis?"
                    disabled={isAsking}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!cardQuestion.trim() || isAsking}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Vraag</span>
                  </button>
                </form>

                {isAsking && (
                  <p className="text-slate-500 italic text-[11px]">AI rekent en analyseert context...</p>
                )}

                {cardAnswer && (
                  <div className="p-3 bg-blue-50 text-slate-900 border border-blue-200 rounded-xl text-xs leading-relaxed animate-in fade-in">
                    <span className="font-bold text-blue-900 block mb-0.5">Antwoord van Vooruit:</span>
                    <p>{cardAnswer}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  onDismissCard(selectedWhyCard.id, 'dismissed');
                  setSelectedWhyCard(null);
                }}
                className="text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
              >
                Markeer als afgehandeld
              </button>
              <button
                onClick={() => setSelectedWhyCard(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
