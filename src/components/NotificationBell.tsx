"use client"

import { useEffect, useState } from "react"
import {
  Bell,
  X,
  Check,
  ExternalLink,
  ShoppingBag,
  Info,
  Tag,
} from "lucide-react"

interface Notification {
  _id: string
  title: string
  message: string
  read: boolean
  createdAt: string
  link?: string
  type?: "order" | "system" | "promo"
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchNotifications()

    const interval = setInterval(() => {
      fetchNotifications()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications", {
        cache: "no-store",
      })

      if (!res.ok) {
        return
      }

      const data = await res.json()

      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    }
  }

  const markAsRead = async (notification: Notification) => {
    // Already read
    if (notification.read) {
      setSelectedNotification(notification)
      return
    }

    try {
      setLoading(true)

      // Update UI immediately
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notification._id
            ? { ...item, read: true }
            : item
        )
      )

      setUnreadCount((prev) => Math.max(0, prev - 1))

      // Open notification details
      setSelectedNotification({
        ...notification,
        read: true,
      })

      const res = await fetch(
        `/api/notifications/${notification._id}`,
        {
          method: "PUT",
        }
      )

      if (!res.ok) {
        // If API fails, restore unread state
        setNotifications((prev) =>
          prev.map((item) =>
            item._id === notification._id
              ? { ...item, read: false }
              : item
          )
        )

        setUnreadCount((prev) => prev + 1)

        setSelectedNotification(notification)
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error)

      // Restore UI if request failed
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notification._id
            ? { ...item, read: false }
            : item
        )
      )

      setUnreadCount((prev) => prev + 1)
    } finally {
      setLoading(false)
    }
  }

  const getNotificationIcon = (type?: string) => {
    if (type === "order") {
      return <ShoppingBag className="w-5 h-5 text-blue-600" />
    }

    if (type === "promo") {
      return <Tag className="w-5 h-5 text-purple-600" />
    }

    return <Info className="w-5 h-5 text-gray-600" />
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const closeDetails = () => {
    setSelectedNotification(null)
  }

  const openNotificationLink = () => {
    if (!selectedNotification?.link) {
      return
    }

    window.location.href = selectedNotification.link
  }

  return (
    <div className="relative">
      {/* Notification button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev)
          setSelectedNotification(null)
        }}
        className="relative p-2 text-gray-700 hover:text-blue-600 transition"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Background overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setIsOpen(false)
              setSelectedNotification(null)
            }}
          />

          {/* Notification panel */}
          <div className="absolute right-0 mt-2 w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
            {!selectedNotification ? (
              <>
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Notifications
                    </h3>

                    <p className="text-xs text-gray-500 mt-0.5">
                      {unreadCount > 0
                        ? `${unreadCount} unread notification${
                            unreadCount > 1 ? "s" : ""
                          }`
                        : "You're all caught up"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Notification list */}
                <div className="max-h-[420px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />

                      <p className="text-gray-500 text-sm">
                        No notifications yet
                      </p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        type="button"
                        key={notification._id}
                        onClick={() => markAsRead(notification)}
                        className={`w-full text-left px-4 py-3 border-b transition hover:bg-gray-50 ${
                          !notification.read
                            ? "bg-blue-50"
                            : "bg-white"
                        }`}
                      >
                        <div className="flex gap-3">
                          {/* Icon */}
                          <div
                            className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                              notification.read
                                ? "bg-gray-100"
                                : "bg-blue-100"
                            }`}
                          >
                            {getNotificationIcon(notification.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p
                                className={`text-sm ${
                                  notification.read
                                    ? "font-medium text-gray-700"
                                    : "font-semibold text-gray-900"
                                }`}
                              >
                                {notification.title}
                              </p>

                              {!notification.read && (
                                <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
                              )}
                            </div>

                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>

                            <p className="text-[11px] text-gray-400 mt-2">
                              {formatDate(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </>
            ) : (
              /* Notification details */
              <div>
                {/* Details header */}
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <button
                    type="button"
                    onClick={closeDetails}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    ← Back
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedNotification(null)
                      setIsOpen(false)
                    }}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Details content */}
                <div className="p-5">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    {getNotificationIcon(
                      selectedNotification.type
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedNotification.title}
                  </h3>

                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(selectedNotification.createdAt)}
                  </p>

                  <div className="mt-5 p-4 rounded-lg bg-gray-50 border">
                    <p className="text-sm leading-6 text-gray-700">
                      {selectedNotification.message}
                    </p>
                  </div>

                  {/* Read status */}
                  <div className="flex items-center gap-2 mt-4 text-xs text-green-600">
                    <Check className="w-4 h-4" />
                    <span>Read</span>
                  </div>

                  {/* Related page */}
                  {selectedNotification.link && (
                    <button
                      type="button"
                      onClick={openNotificationLink}
                      className="mt-5 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition"
                    >
                      View Related Page
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}