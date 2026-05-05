import { type RootState } from '@/stores';

export const selectIsOpen = (state: RootState) => state.chatbot.isOpen;
export const selectMessages = (state: RootState) => state.chatbot.messages;
