import { useState, useMemo } from 'react';
import { MorfaBrain } from './neural/MorfaBrain';
import { Chat } from './components/Chat';
import NeuronCanvas from './components/NeuronCanvas';
import TokenView from './components/TokenView';
import './App.css';

type Tab = 'neurons' | 'chat' | 'tokens';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  
  // Создаем мозг один раз
  const brain = useMemo(() => new MorfaBrain(), []);

  return (
    <div className="app">
      {/* Фон с нейронами */}
      <div className="background">
        <NeuronCanvas />
      </div>

      {/* Навигация */}
      <nav className="nav">
        <button
          className={activeTab === 'neurons' ? 'active' : ''}
          onClick={() => setActiveTab('neurons')}
        >
          Нейроны
        </button>
        <button
          className={activeTab === 'chat' ? 'active' : ''}
          onClick={() => setActiveTab('chat')}
        >
          Чат
        </button>
        <button
          className={activeTab === 'tokens' ? 'active' : ''}
          onClick={() => setActiveTab('tokens')}
        >
          Токены
        </button>
      </nav>

      {/* Контент */}
      <main className="content">
        {activeTab === 'neurons' && (
          <div className="neurons-info">
            <h2>Нейронная сеть Морфа</h2>
            <p>Нейроны отображаются на фоне.</p>
            <p>Они связаны между собой и передают сигналы.</p>
            <div className="stats-block">
              <div>Нейронов: {brain.getStats().neurons}</div>
              <div>Связей: {brain.getStats().connections}</div>
              <div>Памяти: {brain.getStats().memories}</div>
              <div>Знаний: {brain.getStats().knowledge}</div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && <Chat brain={brain} />}

        {activeTab === 'tokens' && <TokenView />}
      </main>
    </div>
  );
}
