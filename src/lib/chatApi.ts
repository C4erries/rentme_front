import { apiGet, apiPost } from './api'
import type { ChatMessageList, Conversation, ConversationList } from '../types/chat'

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return
    }
    const trimmed = typeof value === 'string' ? value.trim() : String(value)
    if (trimmed.length > 0) {
      search.set(key, trimmed)
    }
  })
  const query = search.toString()
  return query ? `?${query}` : ''
}

export function getMyChats(params: { cursor?: string; limit?: number } = {}) {
  const query = buildQuery({
    cursor: params.cursor,
    limit: params.limit,
  })
  return apiGet<ConversationList>(`/me/chats${query}`)
}

export function getChatMessages(conversationId: string, params: { cursor?: string; limit?: number } = {}) {
  const query = buildQuery({
    cursor: params.cursor,
    limit: params.limit,
  })
  return apiGet<ChatMessageList>(`/chats/${conversationId}/messages${query}`)
}

export function sendChatMessage(conversationId: string, text: string) {
  return apiPost(`/chats/${conversationId}/messages`, { text })
}

export function markChatRead(conversationId: string, lastReadMessageId?: string) {
  const payload = lastReadMessageId ? { last_read_message_id: lastReadMessageId } : {}
  return apiPost<{ read_at?: string }>(`/chats/${conversationId}/read`, payload)
}

export function createDirectConversation(userId: string) {
  return apiPost<Conversation>('/chats', { user_id: userId })
}
