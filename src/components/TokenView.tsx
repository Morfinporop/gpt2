import { useState } from 'react';
import { textToNumbers } from '../neural/SymbolBase';

export default function TokenView() {
  const [text, setText] = useState('Привет, Морфа!');
  
  const tokens = textToNumbers(text);
  
  return (
    <div className="token-container">
      <h2>Токенизация текста</h2>
      <p>Каждый символ преобразуется в число</p>
      
      <textarea
        className="token-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Введите текст..."
      />
      
      <div className="token-result">
        {text.split('').map((char, i) => (
          <div key={i} className="token">
            <span className="token-char">{char === ' ' ? '␣' : char}</span>
            <span className="token-num">{tokens[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
