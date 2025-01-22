'use client'

import React, { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNotificationsStore } from '@/store/notification'
import { useWebSocket } from '@/providers/socket-provider'
import moment from 'moment'

export default function NotificationsCard() {
  const { notifications, addNotification, getApiNotifications } = useNotificationsStore()
  const { socket } = useWebSocket()

  useEffect(() => {
    getApiNotifications()

    const handleMessage = (data: any) => {
      const receivedData = JSON.parse(data)
      const notification = {
        id: receivedData?.id,
        title: receivedData?.title,
        message: receivedData?.message,
        tag: receivedData?.tag,
        created_at: receivedData?.created_at,
        isRead: false,
      }
      addNotification(notification)
    }

    if (socket) {
      socket.onmessage = (event) => {
        handleMessage(event.data)
      }
    }

    return () => {
      // Cleanup if needed
    }
  }, [addNotification, getApiNotifications, socket])

  const unreadCount = notifications.filter(n => !n.isRead).length

  const markAsRead = (id: number) => {
    // Implement the logic to mark a notification as read
    // This should update the notification in the store
  }

  const filterNotifications = (tab: string) => {
    switch (tab) {
      case 'read':
        return notifications.filter(n => n.isRead)
      case 'unread':
        return notifications.filter(n => !n.isRead)
      default:
        return notifications
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative inline-flex items-center justify-center">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-xs text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end" side="bottom" alignOffset={-5} sideOffset={5}>
        <Card className="border-none shadow-none">
          <Tabs defaultValue="unread">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="read">Read</TabsTrigger>
            </TabsList>
            {['all', 'unread', 'read'].map((tab) => (
              <TabsContent key={tab} value={tab} className="max-h-64 overflow-y-auto" style={{scrollbarWidth: "none"}}>
                {filterNotifications(tab).length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No notifications</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {filterNotifications(tab).slice(0, 5).map((notification) => (
                      <li key={notification.id} className="py-4 px-2 hover:bg-accent hover:text-accent-foreground">
                        <div className="flex items-start space-x-4">
                          <div className={`w-10 h-10 flex rounded-full bg-yellow-500 bg-opacity-25 items-center justify-center`}>
                            {notification.title.charAt(0).toUpperCase()}
                          </div>
                          <div className="space-y-1 flex-1">
                            <div className="flex justify-between">
                              <p className={`text-sm font-medium ${notification.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                                {notification.title}
                              </p>
                              {!notification.isRead && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-xs"
                                >
                                  Mark as read
                                </Button>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                            <p className="text-xs text-muted-foreground">
                              {moment(notification.created_at).fromNow()}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </Card>
      </PopoverContent>
    </Popover>
  )
}

