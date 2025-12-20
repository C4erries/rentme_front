export interface Conversation {
  id: string
  listing_id?: string
  participants: string[]
  created_at: string
  last_message_at?: string
  last_message_id?: string
  last_message_sender_id?: string
  last_message_text?: string
  has_unread?: boolean
}

export interface ConversationList {
  items: Conversation[]
  next_cursor?: string
}

export interface ChatMessage {
  id: string
  conversation_id: string
  sender_id: string
  text: string
  created_at: string
}

export interface ChatMessageList {
  items: ChatMessage[]
  next_cursor?: string
}
