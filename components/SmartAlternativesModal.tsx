"use client";

import React from "react";
import type { MomentRecommendations } from "@/lib/types";

interface Props {
  recommendations?: MomentRecommendations;
  onActivateProduct?: (productId: string) => void;
}

export const SmartAlternativesModal: React.FC<Props> = ({
  recommendations,
  onActivateProduct,
}) => {
  if (!recommendations) return null;

  const { bestProduct, secondaryProduct, alternatives } = recommendations;

  return (
    <div className="mt-4 space-y-4">
      {/* 1. Best Matched KBC Product */}
      {bestProduct && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wider">
              {bestProduct.badge || "Best Match"}
            </span>
            {bestProduct.priceOrRate && (
              <span className="text-xs font-semibold text-blue-900">
                {bestProduct.priceOrRate}
              </span>
            )}
          </div>
          <h4 className="mt-1 text-sm font-bold text-gray-900">{bestProduct.name}</h4>
          <p className="mt-0.5 text-xs text-gray-600">{bestProduct.reason}</p>
          <button
            onClick={() => onActivateProduct && onActivateProduct(bestProduct.productId)}
            className="mt-2.5 w-full rounded-lg bg-blue-600 py-1.5 text-xs font-medium text-white shadow-xs transition hover:bg-blue-700 active:scale-98"
          >
            {bestProduct.actionLabel}
          </button>
        </div>
      )}

      {/* 2. Secondary KBC Product / Deal */}
      {secondaryProduct && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wider">
              {secondaryProduct.badge || "KBC Deal"}
            </span>
            {secondaryProduct.priceOrRate && (
              <span className="text-xs font-semibold text-emerald-900">
                {secondaryProduct.priceOrRate}
              </span>
            )}
          </div>
          <h4 className="mt-1 text-sm font-bold text-gray-900">{secondaryProduct.name}</h4>
          <p className="mt-0.5 text-xs text-gray-600">{secondaryProduct.reason}</p>
          <button
            onClick={() => onActivateProduct && onActivateProduct(secondaryProduct.productId)}
            className="mt-2.5 w-full rounded-lg bg-emerald-600 py-1.5 text-xs font-medium text-white shadow-xs transition hover:bg-emerald-700 active:scale-98"
          >
            {secondaryProduct.actionLabel}
          </button>
        </div>
      )}

      {/* 3. Crowd-Driven Smart Alternatives */}
      {alternatives && alternatives.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            💡 Smart Peer Alternatives
          </h4>
          {alternatives.map((alt) => (
            <div
              key={alt.id}
              className="rounded-lg border border-gray-200 bg-white p-2.5 shadow-2xs hover:border-gray-300"
            >
              <div className="flex items-center justify-between">
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                  {alt.badge}
                </span>
                {alt.estimatedSavings && (
                  <span className="text-[11px] font-semibold text-emerald-700">
                    {alt.estimatedSavings}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs font-bold text-gray-800">{alt.title}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-gray-600">
                {alt.description}
              </p>
              {alt.action && (
                <button className="mt-2 text-[11px] font-semibold text-blue-600 hover:underline">
                  {alt.action.label} →
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
