"use client";

import { useMemo, useState } from "react";
import { PokefutaRow } from "../../lib/pokefuta/listData";
import { buildRegionSections, REGION_LABELS } from "../../utils/pokefutaGrouping";

export default function PokefutaSelector({
  rows,
  selectedIds,
  onChange,
  ownedOnly,
  selectionLabel,
  limit,
}: {
  rows: PokefutaRow[];
  selectedIds: number[];
  onChange: (next: number[]) => void;
  ownedOnly: boolean;
  selectionLabel: string;
  limit: number;
}) {
  const selectableRows = useMemo(
    () => (ownedOnly ? rows.filter((row) => row.owned_count > 0) : rows),
    [ownedOnly, rows]
  );
  const sections = useMemo(() => buildRegionSections(selectableRows), [selectableRows]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(
    () => new Set(sections.length > 0 ? [sections[0].regionId] : [])
  );

  const toggleItem = (id: number) => {
    if (selectedSet.has(id)) {
      onChange(selectedIds.filter((selectedId) => selectedId !== id));
      return;
    }
    if (selectedIds.length >= limit) return;
    onChange([...selectedIds, id]);
  };

  if (selectableRows.length === 0) {
    return (
      <p className="rounded-lg bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
        {ownedOnly ? "所持登録されているポケふたがありません。" : "選択できるポケふたがありません。"}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="sticky top-0 z-10 flex items-center justify-between rounded-lg border bg-white px-4 py-3 shadow-sm">
        <span className="text-sm font-semibold text-gray-700">選択中</span>
        <span className={`font-bold ${selectedIds.length >= limit ? "text-red-600" : "text-emerald-700"}`}>
          {selectedIds.length} / {limit}種類
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
              onClick={() =>
                setExpandedIds((previous) => {
                  const next = new Set(previous);
                  if (next.has(section.regionId)) next.delete(section.regionId);
                  else next.add(section.regionId);
                  return next;
                })
              }
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold hover:bg-gray-50"
            >
              <span>{REGION_LABELS[section.regionId]}</span>
              <span className="text-xs text-gray-500">{isExpanded ? "閉じる" : "開く"}</span>
            </button>
            {isExpanded && (
              <div className="grid grid-cols-3 gap-2 border-t p-3 sm:grid-cols-4 md:grid-cols-5">
                {sectionRows.map((row) => {
                  const isSelected = selectedSet.has(row.id);
                  const isDisabled = !isSelected && selectedIds.length >= limit;
                  return (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => toggleItem(row.id)}
                      disabled={isDisabled}
                      aria-pressed={isSelected}
                      aria-label={`${selectionLabel}：${row.city_name}を${isSelected ? "選択解除" : "選択"}`}
                      className={`relative rounded-xl border p-1.5 text-center shadow-sm transition ${
                        isSelected
                          ? "border-emerald-500 bg-lime-200 ring-2 ring-emerald-300"
                          : "bg-white hover:shadow-md disabled:cursor-not-allowed disabled:opacity-35"
                      }`}
                    >
                      <img
                        src={row.image_url || "/no-image.png"}
                        onError={(event) => { event.currentTarget.src = "/no-image.png"; }}
                        alt=""
                        className="aspect-square w-full rounded-full object-cover"
                      />
                      {isSelected && (
                        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">✓</span>
                      )}
                      <span className="mt-2 block truncate text-xs font-semibold text-gray-700">{row.city_name}</span>
                      {ownedOnly && <span className="block text-[10px] text-gray-500">所持済み</span>}
                    </button>
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
