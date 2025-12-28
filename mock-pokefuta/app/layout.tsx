import "./globals.css";
import Header from "./components/Header";
import { getAuthProfile } from "./lib/supabase/auth";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthProfile();

  return (
    <html lang="ja">
      <body>
        <Header user={user} />
        {children}
      </body>
    </html>
  );
}