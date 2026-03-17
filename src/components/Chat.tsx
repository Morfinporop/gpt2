import { useState, useRef, useEffect } from 'react';
import { MorfaBrain, WorkMode } from '../neural/MorfaBrain';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  thinkingProcess?: string[];
  stats?: string[];
}

interface Props {
  brain: MorfaBrain;
}

export function Chat({ brain }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [currentThinking, setCurrentThinking] = useState<string[]>([]);
  const [currentResponse, setCurrentResponse] = useState('');
  const [mode, setMode] = useState<WorkMode>('normal');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentResponse, currentThinking]);

  useEffect(() => {
    brain.setMode(mode);
  }, [mode, brain]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isThinking) return;

    const userMessage: Message = {
      id: Date.now(),
      text,
      isUser: true
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);
    setCurrentThinking([]);
    setCurrentResponse('');

    const baseTime = mode === 'think' ? 2000 : mode === 'code' ? 1000 : 500;
    const thinkTime = baseTime + Math.random() * 500;

    const thinkingSteps = mode === 'think' ? 8 : mode === 'code' ? 5 : 3;
    const stepDelay = thinkTime / thinkingSteps;

    const { text: responseText, thinkingProcess } = brain.generateResponse(text);

    for (let i = 0; i < Math.min(thinkingProcess.length, thinkingSteps); i++) {
      await new Promise(resolve => setTimeout(resolve, stepDelay));
      setCurrentThinking(prev => [...prev, thinkingProcess[i]]);
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    setCurrentThinking([]);

    let displayed = '';
    for (let i = 0; i < responseText.length; i++) {
      displayed += responseText[i];
      setCurrentResponse(displayed);
      
      const char = responseText[i];
      let delay = 15 + Math.random() * 25;
      if (char === '.' || char === '!' || char === '?') {
        delay = 80 + Math.random() * 80;
      } else if (char === ',') {
        delay = 50 + Math.random() * 50;
      } else if (char === ' ') {
        delay = 20 + Math.random() * 30;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    const stats = brain.getStats();
    const botMessage: Message = {
      id: Date.now() + 1,
      text: responseText,
      isUser: false,
      thinkingProcess,
      stats: [
        `нейронов: ${stats.neurons}`,
        `связей: ${stats.connections}`,
        `память: ${stats.memories}`
      ]
    };

    setMessages(prev => [...prev, botMessage]);
    setCurrentResponse('');
    setIsThinking(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const stats = brain.getStats();

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-title">Морфа</div>
        <div className="chat-stats">
          {stats.neurons} нейронов | {stats.memories} памяти
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-welcome">
            <p>Я Морфа - нейросеть которая учится.</p>
            <p>Напиши мне что-нибудь, я запомню и буду учиться.</p>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.isUser ? 'user' : 'bot'}`}>
            <div className="message-text">{msg.text}</div>
            {msg.stats && !msg.isUser && (
              <div className="message-stats">
                {msg.stats.map((s, i) => (
                  <span key={i}>{s}</span>
                ))}
              </div>
            )}
          </div>
        ))}

        {isThinking && (
          <div className="message bot">
            {currentThinking.length > 0 && (
              <div className="thinking-process">
                {currentThinking.map((t, i) => (
                  <div key={i} className="thinking-step">{t}</div>
                ))}
              </div>
            )}
            <div className="message-text">
              {currentResponse || (
                <span className="thinking-dots">
                  {mode === 'think' ? 'глубоко думаю' : mode === 'code' ? 'анализирую код' : 'думаю'}
                </span>
              )}
              {currentResponse && <span className="cursor">|</span>}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <div className="mode-buttons">
          <button 
            className={`mode-btn ${mode === 'normal' ? 'active' : ''}`}
            onClick={() => setMode('normal')}
            title="Обычный режим"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            </svg>
          </button>
          <button 
            className={`mode-btn ${mode === 'code' ? 'active' : ''}`}
            onClick={() => setMode('code')}
            title="Режим кода"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
            </svg>
          </button>
          <button 
            className={`mode-btn ${mode === 'think' ? 'active' : ''}`}
            onClick={() => setMode('think')}
            title="Режим глубокого размышления"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </button>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            mode === 'code' 
              ? 'Напиши код или вопрос о коде...' 
              : mode === 'think'
              ? 'Задай сложный вопрос...'
              : 'Напиши сообщение...'
          }
          disabled={isThinking}
          className="chat-input"
        />
        <button
          onClick={handleSend}
          disabled={isThinking || !input.trim()}
          className="chat-send"
        >
          {isThinking ? '...' : '>'}
        </button>
      </div>
    </div>
  );
}
