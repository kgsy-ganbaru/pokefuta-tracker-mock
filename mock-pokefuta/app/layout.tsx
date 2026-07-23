import "./globals.css";
import Header from "./components/Header";
import { getCachedAuthProfile } from "./lib/supabase/auth";
import { createClient } from "./lib/supabase/server";
import { getUnreadNotificationCount } from "./lib/notifications";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const user = await getCachedAuthProfile();
  const unreadNotificationCount = supabase && user
    ? await getUnreadNotificationCount(supabase, user.id)
    : 0;

  return (
    <html lang="ja">
      <body>
        <Header user={user} unreadNotificationCount={unreadNotificationCount} />
        {children}
      </body>
    </html>
  );
}
