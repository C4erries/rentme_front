import { createContext, useContext, type PropsWithChildren } from 'react'

const ChatBadgeContext = createContext(false)

export function ChatBadgeProvider({ value, children }: PropsWithChildren<{ value: boolean }>) {
  return <ChatBadgeContext.Provider value={value}>{children}</ChatBadgeContext.Provider>
}

export function useChatBadge(): boolean {
  return useContext(ChatBadgeContext)
}
