import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChatWindow } from '../components/ChatWindow';

export const ChatPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get('conversationId');

  return (
    <div className="max-w-6xl mx-auto py-2">
      <ChatWindow initialConversationId={conversationId} />
    </div>
  );
};
