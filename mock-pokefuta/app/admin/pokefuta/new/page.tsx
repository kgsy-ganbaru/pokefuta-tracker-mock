import PageBackLink from "../../../components/PageBackLink";
import { requireAdmin } from "../../../lib/admin";
import PokefutaAdminForm from "../PokefutaAdminForm";

export default async function NewPokefutaPage() {
  await requireAdmin();
  return <main className="mx-auto max-w-2xl space-y-5 p-4 pb-28 sm:p-6"><PageBackLink href="/admin/pokefuta" label="ポケふた管理に戻る" /><header><h1 className="text-2xl font-bold text-gray-900">ポケふたを登録</h1><p className="mt-2 text-sm text-gray-600">登録すると、ホーム・一括登録・掲示板へすぐに反映されます。</p></header><PokefutaAdminForm /></main>;
}
