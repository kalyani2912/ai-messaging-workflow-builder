
interface Message {
  id: number;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
}

interface ConversationHistoryProps {
  messages: Message[];
}

const ConversationHistory = ({ messages }: ConversationHistoryProps) => {
  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-100">
      <div className="space-y-6">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.sender === 'user' ? 'justify-start' : 'justify-end'}`}
          >
            <div 
              className={`max-w-[80%] md:max-w-[70%] p-4 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-gray-100 text-gray-800 rounded-bl-none'
                  : 'bg-brand-blue bg-opacity-10 text-gray-800 rounded-br-none'
              }`}
            >
              <p className="mb-2">{message.content}</p>
              <p className="text-xs text-gray-500 text-right">{message.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationHistory;
