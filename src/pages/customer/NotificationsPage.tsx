import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Bell,
  Check,
  CheckCheck,
  Inbox,
  Loader2,
  ArrowUpRight,
} from "lucide-react";

import {
  fetchCustomerNotifications,
  markAllCustomerNotificationsRead,
  markCustomerNotificationRead,
  markCustomerNotificationUnread,
} from "@/features/auth/customerAuth";
import type { CustomerNotification } from "@/features/auth/customerAuth";
import { EmptyState, PageHeading } from "./components/PortalUi";

export function NotificationsPage() {
  const [filter, setFilter] = useState<"All" | "Unread">("All");
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadNotifications();
  }, []);

  async function loadNotifications() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchCustomerNotifications();
      setNotifications(data.notifications);
    } catch {
      setError("Notifications could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  const visible = notifications.filter(
    (notice) => filter === "All" || !notice.read,
  );

  const unread = notifications.filter((notice) => !notice.read).length;

  async function markAllAsRead() {
    setNotifications((items) => items.map((notice) => ({ ...notice, read: true })));
    await markAllCustomerNotificationsRead();
  }

  async function toggleRead(notice: CustomerNotification) {
    setNotifications((items) =>
      items.map((item) =>
        item.id === notice.id ? { ...item, read: !item.read } : item,
      ),
    );

    if (notice.read) {
      await markCustomerNotificationUnread(notice.id);
    } else {
      await markCustomerNotificationRead(notice.id);
    }
  }

  return (
    <>
      <PageHeading
        title="Notifications"
        text="Stay in the loop with appointments, subscriptions, billing, and elder profile updates."
        action={
          <button
            type="button"
            disabled={!unread}
            onClick={() => void markAllAsRead()}
            className="button-outline disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CheckCheck size={17} aria-hidden="true" />
            Mark all as read
          </button>
        }
      />

      <div className="mb-6 flex items-end justify-between gap-5 border-b border-brand-100">
        <div className="flex" role="group" aria-label="Notification filter">
          {(["All", "Unread"] as const).map((item) => {
            const selected = filter === item;

            return (
              <button
                key={item}
                type="button"
                aria-pressed={selected}
                onClick={() => setFilter(item)}
                className={
                  "relative flex items-center gap-2 px-1 pb-4 pr-7 text-sm font-semibold transition-colors " +
                  (selected ? "text-primary" : "text-slate-400 hover:text-brand-900")
                }
              >
                {item}
                {item === "Unread" && unread > 0 && (
                  <span
                    className={
                      "flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold " +
                      (selected ? "bg-brand-100 text-primary" : "bg-slate-100 text-slate-500")
                    }
                  >
                    {unread}
                  </span>
                )}
                {selected && (
                  <span
                    className="absolute bottom-[-1px] left-0 h-0.5 w-[calc(100%-28px)] rounded-full bg-primary"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>

        <p className="hidden pb-4 text-xs text-slate-400 sm:block">
          {unread ? `${unread} unread ${unread === 1 ? "update" : "updates"}` : "You're all caught up"}
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-3 rounded-[24px] border border-brand-100 bg-white p-6 text-sm text-slate-500">
          <Loader2 className="animate-spin text-primary" size={18} />
          Loading notifications...
        </div>
      )}

      {!loading && visible.length > 0 && (
        <section
          aria-label="Notification feed"
          className="overflow-hidden rounded-[24px] border border-brand-100 bg-white"
        >
          {visible.map((notice, index) => (
            <article
              key={notice.id}
              className={
                "group relative px-5 py-5 transition-colors sm:px-6 sm:py-6 " +
                (index !== visible.length - 1 ? "border-b border-brand-100 " : "") +
                (!notice.read ? "bg-brand-50/30" : "bg-white hover:bg-brand-50/20")
              }
            >
              {!notice.read && (
                <span
                  className="absolute bottom-0 left-0 top-0 w-[3px] bg-primary"
                  aria-hidden="true"
                />
              )}

              <div className="flex items-start gap-4 sm:gap-5">
                <span
                  className={
                    "flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors sm:size-11 " +
                    (!notice.read
                      ? "bg-brand-100 text-primary"
                      : "bg-slate-50 text-slate-400 group-hover:bg-brand-50 group-hover:text-primary")
                  }
                >
                  <Bell size={19} strokeWidth={1.6} aria-hidden="true" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                          {notice.category}
                        </p>
                        {!notice.read && (
                          <>
                            <span className="size-1 rounded-full bg-slate-300" aria-hidden="true" />
                            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-primary">
                              New
                            </span>
                          </>
                        )}
                      </div>

                      <h2
                        className={
                          "mt-2 text-[15px] leading-6 text-brand-900 sm:text-base " +
                          (!notice.read ? "font-semibold" : "font-medium")
                        }
                      >
                        {notice.title}
                      </h2>
                    </div>

                    <p className="shrink-0 text-[11px] text-slate-400">
                      {notice.created_at || "Just now"}
                    </p>
                  </div>

                  <p className="mt-2 max-w-3xl text-sm font-normal leading-7 text-slate-500">
                    {notice.message}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-5">
                    <button
                      type="button"
                      onClick={() => void toggleRead(notice)}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-primary transition-colors hover:text-brand-900"
                    >
                      {notice.read ? (
                        <>
                          <span className="size-1.5 rounded-full border border-current" />
                          Mark unread
                        </>
                      ) : (
                        <>
                          <Check size={14} strokeWidth={2} aria-hidden="true" />
                          Mark as read
                        </>
                      )}
                    </button>

                    {notice.url && (
                      <Link
                        to={notice.url}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-primary transition-colors hover:text-brand-900"
                      >
                        View related page
                        <ArrowUpRight size={13} aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {!loading && !visible.length && (
        <div className="overflow-hidden rounded-[24px] border border-brand-100 bg-white">
          <div className="flex justify-center pt-8">
            <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-primary">
              <Inbox size={20} strokeWidth={1.6} aria-hidden="true" />
            </span>
          </div>
          <div className="px-5 pb-6">
            <EmptyState
              text={
                filter === "Unread"
                  ? "You're all caught up. No unread updates."
                  : "There are no notifications to show."
              }
            />
          </div>
        </div>
      )}
    </>
  );
}
