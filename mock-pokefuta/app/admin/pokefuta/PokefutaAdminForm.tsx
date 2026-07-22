"use client";

import { useActionState, useState } from "react";
import { savePokefutaAction, type AdminPokefutaState } from "../../actions/admin";
import { PREFECTURE_IDS_BY_REGION_ID, PREFECTURE_LABELS, REGION_LABELS, REGION_ORDER } from "../../utils/pokefutaGrouping";
import LoadingOverlay from "../../components/LoadingOverlay";

type InitialValues = { id?: number; regionId?: number; prefectureId?: number; cityName?: string; address?: string; pokemonNames?: string; imageUrl?: string | null };

export default function PokefutaAdminForm({ initialValues = {} }: { initialValues?: InitialValues }) {
  const [state, action, pending] = useActionState<AdminPokefutaState, FormData>(savePokefutaAction, {});
  const [regionId, setRegionId] = useState(initialValues.regionId ?? 1);
  const [prefectureId, setPrefectureId] = useState(initialValues.prefectureId ?? 1);
  const prefectureIds = PREFECTURE_IDS_BY_REGION_ID[regionId] ?? [];
  return (
    <form action={action} className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm">
      {initialValues.id && <input type="hidden" name="pokefutaId" value={initialValues.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-gray-700">地方
          <select name="regionId" value={regionId} onChange={(event) => { const next = Number(event.target.value); setRegionId(next); setPrefectureId(PREFECTURE_IDS_BY_REGION_ID[next]?.[0] ?? 1); }} className="mt-2 w-full rounded-lg border bg-white px-3 py-3 font-normal" required>
            {REGION_ORDER.map((id) => <option key={id} value={id}>{REGION_LABELS[id]}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-gray-700">都道府県
          <select name="prefectureId" value={prefectureId} onChange={(event) => setPrefectureId(Number(event.target.value))} className="mt-2 w-full rounded-lg border bg-white px-3 py-3 font-normal" required>
            {prefectureIds.map((id) => <option key={id} value={id}>{PREFECTURE_LABELS[id]}</option>)}
          </select>
        </label>
      </div>
      <label className="block text-sm font-semibold text-gray-700">市区町村・設置場所名<input name="cityName" defaultValue={initialValues.cityName} maxLength={100} required className="mt-2 w-full rounded-lg border px-3 py-3 font-normal" /></label>
      <label className="block text-sm font-semibold text-gray-700">住所<input name="address" defaultValue={initialValues.address} maxLength={200} required className="mt-2 w-full rounded-lg border px-3 py-3 font-normal" /></label>
      <label className="block text-sm font-semibold text-gray-700">描かれているポケモン<textarea name="pokemonNames" defaultValue={initialValues.pokemonNames} required rows={3} placeholder="ピカチュウ、イーブイ" className="mt-2 w-full rounded-lg border px-3 py-3 font-normal" /><span className="mt-1 block text-xs font-normal text-gray-500">読点、カンマ、改行のいずれかで区切ってください。</span></label>
      {initialValues.imageUrl && <img src={initialValues.imageUrl} alt="現在のポケふた" className="h-28 w-28 rounded-full border object-cover" />}
      <label className="block text-sm font-semibold text-gray-700">画像{initialValues.id ? "（変更する場合のみ）" : ""}<input name="image" type="file" accept="image/jpeg,image/png,image/webp" required={!initialValues.id} className="mt-2 block w-full rounded-lg border p-2 text-sm font-normal" /><span className="mt-1 block text-xs font-normal text-gray-500">JPEG・PNG・WebP、5MB以内</span></label>
      {state.error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      <button type="submit" disabled={pending} className="pft-primary-button w-full rounded-full px-5 py-3 font-bold disabled:opacity-60">{initialValues.id ? "変更を保存する" : "ポケふたを登録する"}</button>
      {pending && <LoadingOverlay />}
    </form>
  );
}
