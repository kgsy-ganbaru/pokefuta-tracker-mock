import Link from "next/link";
import type { AppNotification } from "../lib/notifications";

function formatNotificationDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function NotificationIcon({ type }: { type: string }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg" aria-hidden="true">
      {type === "board_comment" ? "💬" : "🔔"}
    </span>
  );
}

export default function NotificationList({ notifications }: { notifications: AppNotification[] }) {
  return (
    <section aria-labelledby="notifications-heading" className="rounded-2xl border border-emerald-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-emerald-100 px-4 py-3">
        <h2 id="notifications-heading" className="font-semibold text-gray-800">通知</h2>
        <span className="text-xs text-gray-500">最新30件</span>
      </div>

      {notifications.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <span className="text-2xl" aria-hidden="true">🔔</span>
          <p className="mt-2 text-sm text-gray-500">新しい通知はありません。</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {notifications.map((notification) => {
            const content = (
              <div className="flex gap-3 px-4 py-4 transition hover:bg-emerald-50/60">
                <NotificationIcon type={notification.type} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-800">{notification.title}</p>
                    {!notification.readAt && <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" aria-label="未読" />}
                  </div>
                  {notification.body && <p className="mt-1 text-sm leading-5 text-gray-600">{notification.body}</p>}
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <time className="text-xs text-gray-400">{formatNotificationDate(notification.createdAt)}</time>
                    {notification.href && <span className="text-xs font-semibold text-emerald-700">投稿を確認する</span>}
                  </div>
                </div>
              </div>
            );

            return notification.href ? (
              <Link key={notification.id} href={notification.href} className="block">{content}</Link>
            ) : (
              <div key={notification.id}>{content}</div>
            );
          })}
        </div>
      )}
    </section>
  );
}

