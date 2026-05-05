import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { CHATBOT_PERSIST_KEY, WELCOME_MESSAGE } from './constants';

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: number;
}

export interface ChatbotState {
  isOpen: boolean;
  messages: ChatMessage[];
}

const initialState: ChatbotState = {
  isOpen: false,
  messages: [
    {
      id: 'welcome',
      role: 'bot',
      content: WELCOME_MESSAGE,
      timestamp: Date.now(),
    },
  ],
};

const chatbotSlice = createSlice({
  name: 'chatbot',
  initialState,
  reducers: {
    toggleOpen: (state) => {
      state.isOpen = !state.isOpen;
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    setMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = action.payload;
    },
  },
});

const persistConfig = {
  key: CHATBOT_PERSIST_KEY,
  storage,
  whitelist: ['isOpen', 'messages'],
};

export const chatbotReducer = persistReducer(persistConfig, chatbotSlice.reducer);
export { chatbotSlice };
