import { useEffect, useRef, useState } from "react"
import { useGetNotificationPreferences } from "@/store/queries/settings"
import { useUpdateNotificationPreferences } from "@/store/mutations/settings"
import { showAlert } from "@/store/alerts"
import type { NotificationPreferenceGroup, NotificationChannels } from "@/types/settings"
import { SectionLoading } from "./shared"

const CHANNEL_LABELS: Record<keyof NotificationChannels, string> = {
  email: "Email",
  sms: "SMS",
  push: "Push",
  in_app: "In-App",
}

const CHANNELS = Object.keys(CHANNEL_LABELS) as (keyof NotificationChannels)[]

type Props = {
  registerSave: (fn: () => void) => void
  registerDirty: (dirty: boolean) => void
}

export default function NotificationsSection({ registerSave, registerDirty }: Props) {
  const { data, isLoading } = useGetNotificationPreferences()
  const updateNotificationPreferences = useUpdateNotificationPreferences()

  const [groups, setGroups] = useState<NotificationPreferenceGroup[]>([])
  const originalRef = useRef<NotificationPreferenceGroup[]>([])

  useEffect(() => {
    if (data?.groups) {
      setGroups(data.groups)
      originalRef.current = data.groups
    }
  }, [data])

  const toggle = (groupCode: string, eventCode: string, channel: keyof NotificationChannels) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.code !== groupCode
          ? group
          : {
              ...group,
              items: group.items.map((item) =>
                item.event_code !== eventCode
                  ? item
                  : { ...item, channels: { ...item.channels, [channel]: !item.channels[channel] } },
              ),
            },
      ),
    )
  }

  const groupsRef = useRef(groups)
  groupsRef.current = groups

  useEffect(() => {
    const isDirty = JSON.stringify(groups) !== JSON.stringify(originalRef.current)
    registerDirty(isDirty)
  }, [groups, registerDirty])

  useEffect(() => {
    registerSave(() => {
      const items = groupsRef.current.flatMap((group) =>
        group.items.map((item) => ({
          event_code: item.event_code,
          channels: item.channels,
        })),
      )
      updateNotificationPreferences.mutate(
        { request: { items } },
        {
          onSuccess: () =>
            showAlert({ variant: "success", message: "Notification preferences saved" }),
          onError: (e) => showAlert({ variant: "error", message: e.message }),
        },
      )
    })
  }, [registerSave])

  if (isLoading) return <SectionLoading />

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <div
          key={group.code}
          className="border-borderSubtle overflow-hidden rounded-xl border bg-white"
        >
          <div className="border-borderSubtle border-b px-6 py-4">
            <h2 className="font-jakarta text-brand text-sm font-semibold">{group.label}</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-borderSubtle border-b">
                  <th className="font-jakarta text-brand/50 px-6 py-3 text-left text-xs font-semibold">
                    Event
                  </th>
                  {CHANNELS.map((ch) => (
                    <th
                      key={ch}
                      className="font-jakarta text-brand/50 w-20 px-2 py-3 text-center text-xs font-semibold"
                    >
                      {CHANNEL_LABELS[ch]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {group.items.map((item) => (
                  <tr key={item.event_code} className="border-borderSubtle border-b last:border-0">
                    <td className="font-jakarta text-brand px-6 py-3.5 text-sm">{item.label}</td>
                    {CHANNELS.map((ch) => (
                      <td key={ch} className="px-2 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={item.channels[ch]}
                          onChange={() => toggle(group.code, item.event_code, ch)}
                          className="accent-primary h-4 w-4 cursor-pointer"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
