import React, { useState } from 'react';
import { DayTimeline } from '../types';
import { formatPrice } from '../utils/calculations';

interface CashflowChartProps {
  days: DayTimeline[];
  buffer: number;
  initialBalance: number;
  lowestBalance: number;
  lowestBalanceDate: string;
  selectedDay: DayTimeline | null;
  onSelectDay: (day: DayTimeline) => void;
}

export const CashflowChart: React.FC<CashflowChartProps> = ({
  days,
  buffer,
  initialBalance,
  lowestBalance,
  lowestBalanceDate,
  selectedDay,
  onSelectDay,
}) => {
  const [hoveredDay, setHoveredDay] = useState<DayTimeline | null>(null);

  if (days.length === 0) return null;

  // Chart dimensions & scaling
  const width = 800;
  const height = 260;
  const paddingLeft = 60;
  const paddingRight = 40;
  const paddingTop = 30;
  const paddingBottom = 45;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Min and max balances for scaling
  const allBalances = days.map(d => d.endOfDayBalance);
  allBalances.push(initialBalance, buffer);
  const minVal = Math.min(...allBalances);
  const maxVal = Math.max(...allBalances);

  // Add 10% breathing room
  const yMin = Math.floor(Math.max(0, minVal - 150));
  const yMax = Math.ceil(maxVal + 200);

  const getX = (index: number) => {
    return paddingLeft + (index / (days.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    const ratio = (val - yMin) / (yMax - yMin);
    return height - paddingBottom - ratio * chartHeight;
  };

  // Generate path string
  const points = days.map((day, idx) => ({
    x: getX(idx),
    y: getY(day.endOfDayBalance),
    day,
  }));

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  // Fill area under path
  const areaD = `${pathD} L ${points[points.length - 1].x},${height - paddingBottom} L ${points[0].x},${height - paddingBottom} Z`;

  // Buffer line Y
  const bufferY = getY(buffer);

  const activeDay = hoveredDay || selectedDay || days[0];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Verloop van je bankrekening in oktober</h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              Oktober 2026
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Zie precies wanneer inkomsten binnenkomen en waar het saldo het diepst dipt.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 bg-blue-600 rounded-full inline-block"></span>
            <span>Verwacht saldo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-0.5 border-t-2 border-dashed border-amber-500 inline-block"></span>
            <span>Gewenste buffer (€{formatPrice(buffer)})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
            <span>Laagste punt</span>
          </div>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
        >
          <defs>
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines (horizontal) */}
          {[yMin, (yMin + yMax) / 2, yMax].map((tickVal, i) => {
            const y = getY(tickVal);
            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#94a3b8"
                  fontFamily="inherit"
                >
                  €{Math.round(tickVal)}
                </text>
              </g>
            );
          })}

          {/* Buffer threshold line */}
          <line
            x1={paddingLeft}
            y1={bufferY}
            x2={width - paddingRight}
            y2={bufferY}
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <text
            x={width - paddingRight + 4}
            y={bufferY + 4}
            fontSize="10"
            fontWeight="600"
            fill="#d97706"
          >
            Buffer
          </text>

          {/* Area under curve */}
          <path d={areaD} fill="url(#balanceGradient)" />

          {/* Main curve line */}
          <path
            d={pathD}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Key event badges / markers */}
          {/* 1. Huur afschrijving op dag 2 */}
          <g transform={`translate(${getX(1)}, ${getY(days[1].endOfDayBalance)})`}>
            <circle r="4" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
          </g>

          {/* 2. Salaris op dag 15 */}
          <g transform={`translate(${getX(14)}, ${getY(days[14].endOfDayBalance)})`}>
            <circle r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
          </g>

          {/* 3. Laagste punt markering */}
          {points.find(p => p.day.isLowestPoint) && (
            <g transform={`translate(${getX(days.findIndex(d => d.isLowestPoint))}, ${getY(lowestBalance)})`}>
              <circle r="7" fill="#ef4444" opacity="0.3" className="animate-ping" />
              <circle r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
            </g>
          )}

          {/* Hover / Selected line */}
          {activeDay && (
            <g>
              <line
                x1={getX(activeDay.dayNumber - 1)}
                y1={paddingTop}
                x2={getX(activeDay.dayNumber - 1)}
                y2={height - paddingBottom}
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle
                cx={getX(activeDay.dayNumber - 1)}
                cy={getY(activeDay.endOfDayBalance)}
                r="6"
                fill="#2563eb"
                stroke="#ffffff"
                strokeWidth="2.5"
              />
            </g>
          )}

          {/* X Axis days */}
          {[1, 5, 10, 15, 20, 25, 31].map(dayNum => {
            const idx = dayNum - 1;
            const x = getX(idx);
            return (
              <g key={dayNum}>
                <text
                  x={x}
                  y={height - paddingBottom + 18}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#64748b"
                  fontWeight="500"
                >
                  {dayNum} okt
                </text>
                <line
                  x1={x}
                  y1={height - paddingBottom}
                  x2={x}
                  y2={height - paddingBottom + 4}
                  stroke="#cbd5e1"
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* Interactive invisible hover rectangles */}
          {points.map((pt, idx) => {
            const rectWidth = chartWidth / days.length;
            return (
              <rect
                key={idx}
                x={pt.x - rectWidth / 2}
                y={paddingTop}
                width={rectWidth}
                height={chartHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredDay(pt.day)}
                onMouseLeave={() => setHoveredDay(null)}
                onClick={() => onSelectDay(pt.day)}
              />
            );
          })}
        </svg>
      </div>

      {/* Selected day active preview summary */}
      {activeDay && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-md">
              {activeDay.dayName} {activeDay.dayNumber} oktober 2026
            </span>
            <span className="text-slate-500">
              Eind van de dag: <strong className="text-slate-900 font-mono">€{formatPrice(activeDay.endOfDayBalance)}</strong>
            </span>
            {activeDay.endOfDayBalance >= buffer ? (
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                +€{formatPrice(activeDay.endOfDayBalance - buffer)} boven buffer
              </span>
            ) : (
              <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-medium">
                -€{formatPrice(buffer - activeDay.endOfDayBalance)} onder buffer!
              </span>
            )}
            {activeDay.isLowestPoint && (
              <span className="text-rose-600 bg-rose-50 font-bold px-2 py-0.5 rounded">
                ⚡ Laagste punt van de maand
              </span>
            )}
          </div>

          <div className="text-slate-600 truncate max-w-md">
            {activeDay.items.filter(i => i.type !== 'daily_expense').length > 0 ? (
              <span>
                Acties: {activeDay.items.filter(i => i.type !== 'daily_expense').map(i => `${i.title} (${i.amount > 0 ? '+' : ''}€${formatPrice(i.amount)})`).join(' • ')}
              </span>
            ) : (
              <span className="text-slate-400 italic">Alleen reguliere dagelijkse reservering (-€8,06)</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
