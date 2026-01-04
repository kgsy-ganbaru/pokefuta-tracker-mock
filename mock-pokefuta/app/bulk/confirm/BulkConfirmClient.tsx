"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  getPrefectureName,
  REGION_LABELS,
  REGION_ORDER,
} from "../../utils/pokefutaGrouping";
import {
  bulkUpdateOwnershipAction,
  BulkOwnershipSelection,
} from "@/app/actions/ownership";

type BulkSelection = {
  id: number;
  region_id: number;
  prefecture_id: number | null;
  city_name: string;
  image_url: string | null;
  pokemon_names: string;
  count: number;
};

export default function BulkConfirmClient() {
  const router = useRouter();
  const [rows, setRows] = useState<BulkSelection[]>([]);
  const [submitError, setSubmitError] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored =
      window.localStorage.getItem("bulkUpdateSelections");
    if (!stored) {
      setRows([]);
      return;
    }
    try {
      const parsed = JSON.parse(stored) as BulkSelection[];
      setRows(Array.isArray(parsed) ? parsed : []);
    } catch {
      setRows([]);
    }
  }, []);

  const groupedRows = useMemo(() => {
    const grouped = new Map<
      number,
      Map<number, BulkSelection[]>
    >();

    rows.forEach((row) => {
      const regionId = row.region_id;
      const prefectureId = row.prefecture_id ?? 0;
      if (!grouped.has(regionId)) {
        grouped.set(regionId, new Map());
      }
      const prefectureMap = grouped.get(regionId);
      if (!prefectureMap?.has(prefectureId)) {
        prefectureMap?.set(prefectureId, []);
      }
      prefectureMap?.get(prefectureId)?.push(row);
    });

    grouped.forEach((prefectureMap) => {
      prefectureMap.forEach((entries) => {
        entries.sort((a, b) => a.id - b.id);
      });
    });

    return grouped;
  }, [rows]);

  const totalCount = useMemo(() => rows.length, [rows]);

  const handleSubmit = () => {
    if (typeof window === "undefined") return;
    if (rows.length === 0 || isPending) return;
    const confirmed = window.confirm("更新しますか？");
    if (!confirmed) return;
    const payload: BulkOwnershipSelection[] = rows.map((row) => ({
      id: row.id,
      count: row.count,
    }));
    setSubmitError("");
    startTransition(async () => {
      const result = await bulkUpdateOwnershipAction(payload);
      if (result?.error) {
        setSubmitError(result.error);
        return;
      }
      window.localStorage.removeItem("bulkUpdateSelections");
      router.push("/");
    });
  };

  return (
    <main className="max-w-7xl mx-auto px-4 pb-16">
      <section className="mt-6">
        <h1 className="text-xl font-semibold mb-2">
          一括更新の確認
        </h1>
        <p className="text-sm text-gray-500">
          これから登録するポケフタの一覧を確認してください。
        </p>
        <p className="text-sm font-semibold text-gray-700 mt-2">
          更新対象 {totalCount} 件
        </p>
      </section>

      <section className="mt-8">
        {rows.length === 0 ? (
          <div className="rounded-2xl border bg-white p-8 text-center text-sm text-gray-500">
            更新対象のデータがありません。
          </div>
        ) : (
          <div className="space-y-6">
            {REGION_ORDER.map((regionId) => {
              const prefectureMap =
                groupedRows.get(regionId);
              if (!prefectureMap) return null;
              const prefectureIds = Array.from(
                prefectureMap.keys()
              ).sort((a, b) => a - b);
              if (prefectureIds.length === 0) return null;
              return (
                <div
                  key={regionId}
                  className="rounded-2xl border bg-white p-4"
                >
                  <h2 className="text-sm font-semibold text-blue-700 mb-3">
                    {REGION_LABELS[regionId]}
                  </h2>
                  <div className="space-y-5">
                    {prefectureIds.map((prefectureId) => {
                      const entries =
                        prefectureMap.get(prefectureId) ?? [];
                      if (entries.length === 0) return null;
                      return (
                        <div key={prefectureId}>
                          <h3 className="text-xs font-semibold text-gray-600 mb-2">
                            {getPrefectureName(
                              prefectureId === 0
                                ? null
                                : prefectureId
                            )}
                          </h3>
                          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8">
                            {entries.map((row) => (
                              <div
                                key={row.id}
                                className="border rounded-xl p-2 text-center shadow-sm bg-white"
                              >
                                <img
                                  src={
                                    row.image_url || "/no-image.png"
                                  }
                                  onError={(e) =>
                                    ((e.currentTarget as HTMLImageElement).src =
                                      "/no-image.png")
                                  }
                                  className="w-full aspect-square rounded-full object-cover"
                                  alt=""
                                />
                                <div className="mt-2 text-xs font-semibold text-gray-700">
                                  {row.city_name}
                                </div>
                                <div className="mt-2 text-xs font-semibold text-emerald-600">
                                  登録数: {row.count}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={() => router.push("/bulk")}
          className="w-48 rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          前の画面に戻る
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={rows.length === 0 || isPending}
          className="w-48 rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isPending ? "更新中..." : "更新する"}
        </button>
      </div>
      {submitError && (
        <p className="mt-4 text-center text-sm text-red-600">
          {submitError}
        </p>
      )}
    </main>
  );
}
