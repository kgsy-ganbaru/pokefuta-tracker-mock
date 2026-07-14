"use client";

import { useMemo, useState } from "react";
import { PokefutaRow } from "../../lib/pokefuta/listData";
import { buildRegionSections, REGION_LABELS } from "../../utils/pokefutaGrouping";

export type QuantityMap = Record<number, number>;

export default function PokefutaQuantitySelector({
  rows,
  quantities,
  onChange,
  ownedOnly,
  totalLimit,
  selectionLabel,
}: {
  rows: PokefutaRow[];
  quantities: QuantityMap;
  onChange: (next: QuantityMap) => void;
  ownedOnly: boolean;
  totalLimit: number;
  selectionLabel: string;
}) {
  const selectableRows = useMemo(
    () => (ownedOnly ? rows.filter((row) => row.owned_count > 0) : rows),
    [ownedOnly, rows]
  );
  const sections = useMemo(() => buildRegionSections(selectableRows), [selectableRows]);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(
    () => new Set(sections.length > 0 ? [sections[0].regionId] : [])
  );
  const total = Object.values(quantities).reduce((sum, count) => sum + count, 0);

  const updateQuantity = (row: PokefutaRow, requested: number) => {
    const current = quantities[row.id] ?? 0;
    const itemMax = ownedOnly ? row.owned_count : totalLimit;
    const availableTotal = totalLimit - (total - current);
    const nextCount = Math.max(0, Math.min(requested, itemMax, availableTotal));
    const next = { ...quantities };
    if (nextCount === 0) delete next[row.id];
    else next[row.id] = nextCount;
    onChange(next);
  };

  const toggleRegion = (regionId: number) => {
    setExpandedIds((previous) => {
      const next = new Set(previous);
      if (next.has(regionId)) next.delete(regionId);
      else next.add(regionId);
      return next;
    });
  };

  if (selectableRows.length === 0) {
    return (
      <p className="rounded-lg bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
        {ownedOnly
          ? "所持登録されているポケふたがありません。"
          : "選択できるポケふたがありません。"}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="sticky top-0 z-10 flex items-center justify-between rounded-lg border bg-white px-4 py-3 shadow-sm">
        <span className="text-sm font-semibold text-gray-700">選択中の合計</span>
        <span className={`text-base font-bold ${total >= totalLimit ? "text-red-600" : "text-emerald-700"}`}>
          {total} / {totalLimit}枚
        </span>
      </div>

      {sections.map((section) => {
        const isExpanded = expandedIds.has(section.regionId);
        const sectionRows = section.prefectureIdsToRender.flatMap(
          (prefectureId) => section.rowsByPrefectureId.get(prefectureId) ?? []
        );
        return (
          <section key={section.regionId} className="overflow-hidden rounded-xl border bg-white">
            <button
              type="button"
              onClick={() => toggleRegion(section.regionId)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold transition hover:bg-gray-50"
            >
              <span>{REGION_LABELS[section.regionId]}</span>
              <span className="text-xs text-gray-500">{isExpanded ? "閉じる" : "開く"}</span>
            </button>
            {isExpanded && (
              <div className="grid grid-cols-3 gap-2 border-t p-3 sm:grid-cols-4 md:grid-cols-5">
                {sectionRows.map((row) => {
                  const count = quantities[row.id] ?? 0;
                  const isSelected = count > 0;
                  const cannotAdd =
                    total >= totalLimit ||
                    (ownedOnly && count >= row.owned_count);
                  return (
                    <div
                      key={row.id}
                      className={`rounded-xl border p-1.5 text-center shadow-sm transition ${
                        isSelected ? "bg-lime-200" : "bg-white"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => updateQuantity(row, count === 0 ? 1 : 0)}
                        className="w-full"
                        aria-label={`${selectionLabel}：${row.city_name}を${isSelected ? "選択解除" : "選択"}`}
                      >
                        <img
                          src={row.image_url || "/no-image.png"}
                          onError={(event) => {
                            event.currentTarget.src = "/no-image.png";
                          }}
                          alt=""
                          className="aspect-square w-full rounded-full object-cover"
                        />
                        <span className="mt-1 block truncate text-xs font-semibold text-gray-700">
                          {row.city_name}
                        </span>
                        {ownedOnly && (
                          <span className="block text-[10px] text-gray-500">所持 {row.owned_count}枚</span>
                        )}
                      </button>
                      <div className="mt-2 flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(row, count - 1)}
                          disabled={count === 0}
                          className="h-7 w-7 rounded-full border bg-white text-sm font-semibold disabled:opacity-35"
                          aria-label={`${selectionLabel}：${row.city_name}を1枚減らす`}
                        >
                          −
                        </button>
                        <span className="min-w-6 text-sm font-bold text-gray-700">{count}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(row, count + 1)}
                          disabled={cannotAdd}
                          className="h-7 w-7 rounded-full border bg-white text-sm font-semibold disabled:opacity-35"
                          aria-label={`${selectionLabel}：${row.city_name}を1枚増やす`}
                        >
                          ＋
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
