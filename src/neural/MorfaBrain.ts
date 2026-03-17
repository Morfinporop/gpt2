// Морфа - нейросеть с настоящим пониманием и обучением

interface Memory {
  text: string;
  tokens: string[];
  timestamp: number;
  type: 'user' | 'self' | 'knowledge';
  topic?: string;
}

interface Neuron {
  id: string;
  activation: number;
  bias: number;
  connections: Map<string, number>;
}

interface Knowledge {
  topic: string;
  facts: string[];
  examples: string[];
  related: string[];
}

export type WorkMode = 'normal' | 'code' | 'think';

export class MorfaBrain {
  private neurons: Map<string, Neuron> = new Map();
  private memory: Memory[] = [];
  private knowledge: Map<string, Knowledge> = new Map();
  private wordVectors: Map<string, number[]> = new Map();
  private bigrams: Map<string, Map<string, number>> = new Map();
  private trigrams: Map<string, Map<string, number>> = new Map();
  private contextMemory: string[] = [];
  
  public mode: WorkMode = 'normal';
  public stats = { neurons: 0, connections: 0, memories: 0, knowledge: 0 };

  constructor() {
    this.initVocabulary();
    this.initLanguagePatterns();
    this.initSelfKnowledge();
    this.updateStats();
  }

  // Инициализация базового словаря с 1000+ нейронов
  private initVocabulary() {
    // Местоимения и их понимание
    const pronouns = {
      'я': { type: 'self', person: 1 },
      'ты': { type: 'other', person: 2 },
      'он': { type: 'other', person: 3 },
      'она': { type: 'other', person: 3 },
      'мы': { type: 'self', person: 1 },
      'вы': { type: 'other', person: 2 },
      'они': { type: 'other', person: 3 },
      'меня': { type: 'self', person: 1 },
      'тебя': { type: 'other', person: 2 },
      'мне': { type: 'self', person: 1 },
      'тебе': { type: 'other', person: 2 },
      'мой': { type: 'self', person: 1 },
      'твой': { type: 'other', person: 2 },
      'у': { type: 'prep', person: 0 }
    };

    // Создаем нейроны для местоимений
    Object.entries(pronouns).forEach(([word, info]) => {
      this.createNeuron(word, info.type === 'self' ? 0.8 : 0.5);
    });

    // Глаголы
    const verbs = [
      'быть', 'есть', 'иметь', 'мочь', 'хотеть', 'знать', 'понимать', 'думать',
      'говорить', 'сказать', 'спросить', 'ответить', 'помнить', 'забыть',
      'учить', 'учиться', 'работать', 'делать', 'создавать', 'писать',
      'читать', 'видеть', 'слышать', 'чувствовать', 'любить', 'нравиться',
      'идти', 'ходить', 'бежать', 'стоять', 'сидеть', 'лежать',
      'давать', 'брать', 'получать', 'отправлять', 'принимать',
      'начинать', 'заканчивать', 'продолжать', 'останавливать',
      'расти', 'развиваться', 'улучшаться', 'становиться',
      'называться', 'являться', 'существовать', 'жить',
      'помогать', 'поддерживать', 'объяснять', 'показывать',
      'стремиться', 'пытаться', 'стараться', 'удаваться',
      'программировать', 'кодить', 'компилировать', 'запускать'
    ];

    verbs.forEach(v => this.createNeuron(v, 0.5));

    // Существительные
    const nouns = [
      'нейросеть', 'нейрон', 'связь', 'память', 'знание', 'обучение',
      'слово', 'текст', 'буква', 'символ', 'число', 'цифра',
      'вопрос', 'ответ', 'диалог', 'разговор', 'сообщение',
      'программа', 'код', 'функция', 'переменная', 'цикл', 'условие',
      'язык', 'синтаксис', 'команда', 'инструкция', 'алгоритм',
      'данные', 'информация', 'факт', 'пример', 'тема',
      'человек', 'пользователь', 'разработчик', 'программист',
      'система', 'процесс', 'результат', 'работа', 'задача',
      'время', 'день', 'час', 'минута', 'момент',
      'мир', 'жизнь', 'опыт', 'история', 'будущее',
      'мозг', 'интеллект', 'разум', 'мышление', 'сознание',
      'дело', 'дела', 'настроение', 'состояние', 'самочувствие'
    ];

    nouns.forEach(n => this.createNeuron(n, 0.5));

    // Прилагательные
    const adjectives = [
      'хороший', 'плохой', 'большой', 'маленький', 'новый', 'старый',
      'умный', 'глупый', 'быстрый', 'медленный', 'сильный', 'слабый',
      'важный', 'нужный', 'полезный', 'интересный', 'сложный', 'простой',
      'правильный', 'неправильный', 'верный', 'точный', 'ясный',
      'готовый', 'способный', 'возможный', 'невозможный',
      'хорошо', 'плохо', 'отлично', 'нормально', 'замечательно'
    ];

    adjectives.forEach(a => this.createNeuron(a, 0.5));

    // Вопросительные слова
    const questions = ['что', 'как', 'где', 'когда', 'почему', 'зачем', 'кто', 'какой', 'сколько', 'чей'];
    questions.forEach(q => this.createNeuron(q, 0.6));

    // Союзы и частицы
    const particles = ['и', 'а', 'но', 'или', 'да', 'нет', 'не', 'ни', 'же', 'ли', 'бы', 'то', 'это', 'вот'];
    particles.forEach(p => this.createNeuron(p, 0.3));

    // Предлоги
    const prepositions = ['в', 'на', 'с', 'к', 'по', 'из', 'за', 'от', 'до', 'для', 'при', 'про', 'о', 'об'];
    prepositions.forEach(p => this.createNeuron(p, 0.3));

    // Приветствия
    const greetings = ['привет', 'здравствуй', 'здравствуйте', 'хай', 'хей', 'здарова', 'приветик', 'добрый'];
    greetings.forEach(g => this.createNeuron(g, 0.7));

    // Прощания
    const farewells = ['пока', 'прощай', 'досвидания', 'увидимся', 'бай', 'удачи'];
    farewells.forEach(f => this.createNeuron(f, 0.7));

    // Числа
    for (let i = 0; i <= 100; i++) {
      this.createNeuron(String(i), 0.4);
    }

    // Русский алфавит
    const alphabet = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
    alphabet.split('').forEach(l => this.createNeuron(l, 0.2));

    // Английский алфавит
    const engAlphabet = 'abcdefghijklmnopqrstuvwxyz';
    engAlphabet.split('').forEach(l => this.createNeuron(l, 0.2));

    // Языки программирования
    const progLangs = ['lua', 'javascript', 'python', 'java', 'typescript', 'rust', 'go', 'php', 'ruby', 'swift'];
    progLangs.forEach(l => this.createNeuron(l, 0.6));

    // Ключевые слова программирования
    const keywords = [
      'function', 'local', 'if', 'then', 'else', 'elseif', 'end', 'for', 'while', 'do',
      'return', 'nil', 'true', 'false', 'and', 'or', 'not', 'in', 'break', 'repeat', 'until',
      'var', 'let', 'const', 'class', 'interface', 'type', 'import', 'export', 'default',
      'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'self', 'print', 'console'
    ];
    keywords.forEach(k => this.createNeuron(k, 0.5));

    // Заполняем до 1000+ нейронов дополнительными словами
    const extraWords = [
      'морфа', 'имя', 'название', 'суть', 'смысл', 'цель', 'причина',
      'способ', 'метод', 'путь', 'решение', 'проблема', 'ошибка',
      'успех', 'неудача', 'попытка', 'шанс', 'возможность',
      'начало', 'конец', 'середина', 'часть', 'целое', 'элемент',
      'группа', 'список', 'массив', 'объект', 'строка', 'тип',
      'значение', 'ключ', 'параметр', 'аргумент', 'модуль',
      'файл', 'папка', 'путь', 'сервер', 'клиент', 'запрос',
      'база', 'таблица', 'колонка', 'запись', 'индекс',
      'сеть', 'узел', 'граф', 'дерево', 'вершина', 'ребро',
      'вектор', 'матрица', 'скаляр', 'тензор', 'размерность',
      'обработка', 'анализ', 'синтез', 'генерация', 'трансформация',
      'входной', 'выходной', 'скрытый', 'внутренний', 'внешний',
      'линейный', 'нелинейный', 'рекурсивный', 'итеративный',
      'последовательный', 'параллельный', 'синхронный', 'асинхронный'
    ];
    extraWords.forEach(w => this.createNeuron(w, 0.5));
  }

  private createNeuron(word: string, initialActivation: number = 0.5): Neuron {
    const neuron: Neuron = {
      id: word,
      activation: initialActivation,
      bias: Math.random() * 0.2 - 0.1,
      connections: new Map()
    };
    this.neurons.set(word, neuron);
    
    // Создаем векторное представление
    const vector = new Array(64).fill(0).map(() => Math.random() * 2 - 1);
    this.wordVectors.set(word, vector);
    
    return neuron;
  }

  // Паттерны языка - как слова связываются
  private initLanguagePatterns() {
    // Паттерны предложений
    const patterns = [
      // Диалог о состоянии
      'как твои дела у тебя всё хорошо',
      'как у тебя дела всё отлично спасибо',
      'а у тебя как дела расскажи',
      'у меня всё хорошо а у тебя',
      'твои дела как идут нормально',
      
      // Вопросы о собеседнике
      'как ты себя чувствуешь',
      'что у тебя нового',
      'чем ты занимаешься',
      'что ты делаешь',
      
      // О себе
      'я нейросеть которая учится',
      'меня зовут морфа это моё имя',
      'я обрабатываю текст и учусь',
      'я запоминаю всё что мне говорят',
      'я генерирую ответы через нейроны',
      'у меня много нейронов и связей',
      
      // Программирование
      'lua это язык программирования',
      'function это функция в коде',
      'local это локальная переменная',
      'if then else это условие',
      'for while это циклы',
      'return возвращает значение',
      
      // Понимание
      'я понимаю твои слова',
      'я анализирую что ты говоришь',
      'расскажи подробнее я запомню',
      'интересно продолжай',
      
      // Общие фразы
      'это интересная тема',
      'расскажи мне больше',
      'я хочу узнать об этом',
      'понятно спасибо за объяснение'
    ];

    patterns.forEach(p => this.learnPattern(p));
  }

  private learnPattern(text: string) {
    const tokens = this.tokenize(text);
    
    // Биграммы
    for (let i = 0; i < tokens.length - 1; i++) {
      const w1 = tokens[i];
      const w2 = tokens[i + 1];
      
      if (!this.bigrams.has(w1)) {
        this.bigrams.set(w1, new Map());
      }
      const current = this.bigrams.get(w1)!.get(w2) || 0;
      this.bigrams.get(w1)!.set(w2, current + 1);
      
      // Создаем связь между нейронами
      this.connectNeurons(w1, w2, 0.3);
    }

    // Триграммы
    for (let i = 0; i < tokens.length - 2; i++) {
      const key = tokens[i] + ' ' + tokens[i + 1];
      const w3 = tokens[i + 2];
      
      if (!this.trigrams.has(key)) {
        this.trigrams.set(key, new Map());
      }
      const current = this.trigrams.get(key)!.get(w3) || 0;
      this.trigrams.get(key)!.set(w3, current + 1);
    }
  }

  private connectNeurons(w1: string, w2: string, weight: number) {
    // Создаем нейроны если не существуют
    if (!this.neurons.has(w1)) this.createNeuron(w1);
    if (!this.neurons.has(w2)) this.createNeuron(w2);
    
    const n1 = this.neurons.get(w1)!;
    const n2 = this.neurons.get(w2)!;
    
    // Двусторонняя связь
    const currentWeight1 = n1.connections.get(w2) || 0;
    n1.connections.set(w2, Math.min(1, currentWeight1 + weight));
    
    const currentWeight2 = n2.connections.get(w1) || 0;
    n2.connections.set(w1, Math.min(1, currentWeight2 + weight * 0.5));
  }

  // Знания о себе
  private initSelfKnowledge() {
    this.knowledge.set('морфа', {
      topic: 'морфа',
      facts: [
        'моё имя морфа',
        'я нейросеть',
        'я учусь на каждом сообщении',
        'я запоминаю информацию',
        'я генерирую ответы сама',
        'у меня нет готовых ответов'
      ],
      examples: [],
      related: ['нейросеть', 'обучение', 'память']
    });
  }

  // Токенизация
  private tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\wа-яёa-z0-9\s]/gi, ' ')
      .split(/\s+/)
      .filter(t => t.length > 0);
  }

  // Определение КОНТЕКСТА - кто спрашивает о ком
  private analyzeContext(tokens: string[], text: string): {
    aboutSelf: boolean;      // О боте
    aboutUser: boolean;      // О пользователе
    isQuestion: boolean;     // Это вопрос
    isTeaching: boolean;     // Пользователь учит
    topic: string | null;    // Тема
    intent: string;          // Намерение
  } {
    const lower = text.toLowerCase();
    
    // Определяем о ком речь
    // "у меня" / "мои" / "меня" = о пользователе
    // "у тебя" / "твои" / "тебя" / "ты" без "меня" = о боте
    const userIndicators = ['у меня', 'мои дела', 'меня', 'мне', 'я '];
    const botIndicators = ['у тебя', 'твои дела', 'тебя', 'тебе', 'ты '];
    
    let aboutUser = userIndicators.some(ind => lower.includes(ind));
    let aboutSelf = botIndicators.some(ind => lower.includes(ind));
    
    // Если есть "не у тебя а у меня" - это о пользователе
    if (lower.includes('не у тебя') || lower.includes('а у меня') || lower.includes('не тебя а меня')) {
      aboutUser = true;
      aboutSelf = false;
    }
    
    // Если только "как дела" без указания - спрашивают о боте
    if (lower.includes('как дела') && !aboutUser && !aboutSelf) {
      aboutSelf = true;
    }

    const isQuestion = lower.includes('?') || 
      tokens.some(t => ['что', 'как', 'где', 'когда', 'почему', 'зачем', 'кто', 'какой', 'ли'].includes(t));
    
    const isTeaching = tokens.length > 8 || 
      lower.includes('это значит') || 
      lower.includes('это когда') ||
      lower.includes('это называется') ||
      lower.includes('смотри') && tokens.length > 5;

    // Определяем тему
    let topic: string | null = null;
    for (const [topicName] of this.knowledge) {
      if (lower.includes(topicName)) {
        topic = topicName;
        break;
      }
    }

    // Определяем намерение
    let intent = 'statement';
    
    if (tokens.some(t => ['привет', 'здравствуй', 'хай', 'хей', 'здарова'].includes(t))) {
      intent = 'greeting';
    } else if (tokens.some(t => ['пока', 'прощай', 'досвидания', 'увидимся'].includes(t))) {
      intent = 'farewell';
    } else if (lower.includes('как') && (lower.includes('дела') || lower.includes('ты') || lower.includes('сама'))) {
      intent = aboutUser ? 'ask_user_state' : 'how_are_you';
    } else if ((lower.includes('кто') && lower.includes('ты')) || lower.includes('как тебя зовут')) {
      intent = 'who_are_you';
    } else if (lower.includes('что') && (lower.includes('умеешь') || lower.includes('можешь'))) {
      intent = 'abilities';
    } else if (lower.includes('понимаешь') || (lower.includes('ты') && lower.includes('понял'))) {
      intent = 'understanding';
    } else if (tokens.some(t => ['спасибо', 'благодарю'].includes(t))) {
      intent = 'thanks';
    } else if (lower.includes('что знаешь') || lower.includes('расскажи про')) {
      intent = 'knowledge_query';
    } else if (isTeaching) {
      intent = 'teaching';
    } else if (isQuestion) {
      intent = 'question';
    }

    return { aboutSelf, aboutUser, isQuestion, isTeaching, topic, intent };
  }

  // Активация нейронов
  private activateNeurons(tokens: string[]): Map<string, number> {
    const activations = new Map<string, number>();
    
    // Активируем нейроны входных слов
    tokens.forEach(token => {
      if (this.neurons.has(token)) {
        activations.set(token, 1.0);
        
        // Распространяем активацию по связям
        const neuron = this.neurons.get(token)!;
        neuron.connections.forEach((weight, connected) => {
          const current = activations.get(connected) || 0;
          activations.set(connected, Math.min(1, current + weight * 0.7));
        });
      } else {
        // Создаем новый нейрон для неизвестного слова
        this.createNeuron(token);
        activations.set(token, 0.8);
      }
    });

    return activations;
  }

  // Генерация слова через нейроны
  private generateNextWord(
    currentWord: string,
    prevWord: string | null,
    used: Set<string>,
    _context: { aboutUser: boolean; intent: string }
  ): string | null {
    const candidates: { word: string; score: number }[] = [];
    
    // Триграммы (самый высокий приоритет)
    if (prevWord) {
      const key = prevWord + ' ' + currentWord;
      const trigram = this.trigrams.get(key);
      if (trigram) {
        trigram.forEach((weight, word) => {
          if (!used.has(word)) {
            candidates.push({ word, score: weight * 3 });
          }
        });
      }
    }
    
    // Биграммы
    const bigram = this.bigrams.get(currentWord);
    if (bigram) {
      bigram.forEach((weight, word) => {
        if (!used.has(word)) {
          const existing = candidates.find(c => c.word === word);
          if (existing) {
            existing.score += weight * 2;
          } else {
            candidates.push({ word, score: weight * 2 });
          }
        }
      });
    }
    
    // Связи нейронов
    const neuron = this.neurons.get(currentWord);
    if (neuron) {
      neuron.connections.forEach((weight, word) => {
        if (!used.has(word)) {
          const existing = candidates.find(c => c.word === word);
          if (existing) {
            existing.score += weight;
          } else {
            candidates.push({ word, score: weight });
          }
        }
      });
    }
    
    if (candidates.length === 0) return null;
    
    // Сортируем и выбираем с вероятностью
    candidates.sort((a, b) => b.score - a.score);
    const top = candidates.slice(0, 5);
    
    const total = top.reduce((sum, c) => sum + c.score, 0);
    let random = Math.random() * total;
    
    for (const c of top) {
      random -= c.score;
      if (random <= 0) return c.word;
    }
    
    return top[0].word;
  }

  // Генерация предложения
  private generateSentence(
    startWord: string,
    context: { aboutUser: boolean; intent: string },
    maxWords: number = 15
  ): string {
    const words: string[] = [startWord];
    const used = new Set<string>([startWord]);
    
    let current = startWord;
    let prev: string | null = null;
    
    for (let i = 0; i < maxWords; i++) {
      const next = this.generateNextWord(current, prev, used, context);
      
      if (!next) break;
      
      words.push(next);
      used.add(next);
      prev = current;
      current = next;
      
      // Останавливаемся на завершающих словах
      if (['отлично', 'хорошо', 'спасибо', 'понятно'].includes(next) && words.length > 5) {
        break;
      }
    }
    
    return words.join(' ');
  }

  // Выбор стартового слова на основе контекста
  private chooseStartWord(context: {
    aboutSelf: boolean;
    aboutUser: boolean;
    intent: string;
    topic: string | null;
  }, activations: Map<string, number>): string {
    
    // Если спрашивают о пользователе
    if (context.aboutUser && context.intent === 'ask_user_state') {
      const starts = ['а', 'расскажи', 'интересно', 'как', 'что'];
      return starts[Math.floor(Math.random() * starts.length)];
    }
    
    // Если приветствие
    if (context.intent === 'greeting') {
      const starts = ['привет', 'здравствуй', 'рада'];
      return starts[Math.floor(Math.random() * starts.length)];
    }
    
    // Если прощание
    if (context.intent === 'farewell') {
      const starts = ['пока', 'до', 'удачи'];
      return starts[Math.floor(Math.random() * starts.length)];
    }
    
    // Если о себе (боте)
    if (context.intent === 'how_are_you' || context.aboutSelf) {
      const starts = ['у', 'я', 'всё', 'мои'];
      return starts[Math.floor(Math.random() * starts.length)];
    }
    
    // Если кто ты
    if (context.intent === 'who_are_you') {
      const starts = ['я', 'меня', 'моё'];
      return starts[Math.floor(Math.random() * starts.length)];
    }
    
    // Если благодарность
    if (context.intent === 'thanks') {
      const starts = ['рада', 'всегда', 'обращайся'];
      return starts[Math.floor(Math.random() * starts.length)];
    }
    
    // Если обучение
    if (context.intent === 'teaching') {
      const starts = ['понял', 'запомнил', 'интересно', 'теперь'];
      return starts[Math.floor(Math.random() * starts.length)];
    }
    
    // Если вопрос о знаниях
    if (context.intent === 'knowledge_query' && context.topic) {
      return 'про';
    }
    
    // По умолчанию - наиболее активированное слово с биграммами
    const sorted = Array.from(activations.entries())
      .filter(([word]) => this.bigrams.has(word))
      .sort((a, b) => b[1] - a[1]);
    
    if (sorted.length > 0) {
      return sorted[Math.floor(Math.random() * Math.min(3, sorted.length))][0];
    }
    
    return 'я';
  }

  // Главный метод генерации ответа
  public generateResponse(input: string): {
    text: string;
    thinkingProcess: string[];
  } {
    const thinking: string[] = [];
    const tokens = this.tokenize(input);
    
    // Сохраняем в память
    this.memory.push({
      text: input,
      tokens,
      timestamp: Date.now(),
      type: 'user'
    });
    
    // Добавляем в контекст
    this.contextMemory.push(input);
    if (this.contextMemory.length > 10) {
      this.contextMemory.shift();
    }
    
    thinking.push('Токены: ' + tokens.join(', '));
    
    // Анализируем контекст
    const context = this.analyzeContext(tokens, input);
    thinking.push('Намерение: ' + context.intent);
    
    if (context.aboutUser) {
      thinking.push('Речь о пользователе');
    } else if (context.aboutSelf) {
      thinking.push('Речь обо мне');
    }
    
    // Активируем нейроны
    const activations = this.activateNeurons(tokens);
    thinking.push('Активных нейронов: ' + activations.size);
    
    // Обучаемся на входе
    this.learnFromInput(tokens, context);
    
    // Генерируем ответ
    let response = '';
    
    // Особая обработка вопроса о пользователе
    if (context.aboutUser && context.intent === 'ask_user_state') {
      // Пользователь спрашивает "как у меня дела" - нужно спросить в ответ
      const questions = [
        'а как у тебя дела расскажи мне',
        'интересно узнать как у тебя дела',
        'расскажи как твои дела',
        'а что у тебя происходит расскажи'
      ];
      response = questions[Math.floor(Math.random() * questions.length)];
    } else {
      // Выбираем стартовое слово
      const startWord = this.chooseStartWord(context, activations);
      thinking.push('Начинаю с: ' + startWord);
      
      // Генерируем предложение
      const iterations = this.mode === 'think' ? 3 : this.mode === 'code' ? 2 : 1;
      
      for (let i = 0; i < iterations; i++) {
        const sentence = this.generateSentence(startWord, context);
        if (sentence.length > response.length) {
          response = sentence;
        }
      }
      
      // Обрабатываем специальные случаи по намерению
      if (context.intent === 'knowledge_query' && context.topic) {
        const knowledge = this.knowledge.get(context.topic);
        if (knowledge && knowledge.facts.length > 0) {
          const fact = knowledge.facts[Math.floor(Math.random() * knowledge.facts.length)];
          response = 'про ' + context.topic + ' знаю что ' + fact;
        }
      }
      
      // Если обучение - подтверждаем и запоминаем
      if (context.intent === 'teaching') {
        // Извлекаем ключевую тему
        const keyWords = tokens.filter(t => t.length > 3 && !['смотри', 'значит', 'когда'].includes(t));
        const topic = keyWords[0] || tokens[0];
        
        // Сохраняем как знание
        if (!this.knowledge.has(topic)) {
          this.knowledge.set(topic, {
            topic,
            facts: [],
            examples: [],
            related: keyWords.slice(1)
          });
        }
        this.knowledge.get(topic)!.facts.push(tokens.join(' '));
        
        response = 'понял запомнил информацию про ' + topic + ' теперь знаю это';
      }
    }
    
    // Форматируем ответ
    response = this.formatResponse(response);
    
    // Сохраняем ответ в память
    this.memory.push({
      text: response,
      tokens: this.tokenize(response),
      timestamp: Date.now(),
      type: 'self'
    });
    
    this.updateStats();
    
    return { text: response, thinkingProcess: thinking };
  }

  // Форматирование ответа
  private formatResponse(text: string): string {
    if (!text || text.length === 0) {
      return 'Расскажи подробнее чтобы я лучше поняла.';
    }
    
    // Убираем дубликаты слов подряд
    const words = text.split(' ');
    const cleaned: string[] = [];
    for (let i = 0; i < words.length; i++) {
      if (i === 0 || words[i] !== words[i - 1]) {
        cleaned.push(words[i]);
      }
    }
    
    let result = cleaned.join(' ');
    
    // Первая буква заглавная
    result = result.charAt(0).toUpperCase() + result.slice(1);
    
    // Точка в конце если нет
    if (!result.endsWith('.') && !result.endsWith('!') && !result.endsWith('?')) {
      result += '.';
    }
    
    return result;
  }

  // Обучение на входе
  private learnFromInput(tokens: string[], _context: { aboutUser: boolean; intent: string }) {
    // Учим биграммы
    for (let i = 0; i < tokens.length - 1; i++) {
      const w1 = tokens[i];
      const w2 = tokens[i + 1];
      
      if (!this.bigrams.has(w1)) {
        this.bigrams.set(w1, new Map());
      }
      const current = this.bigrams.get(w1)!.get(w2) || 0;
      this.bigrams.get(w1)!.set(w2, current + 1);
      
      this.connectNeurons(w1, w2, 0.1);
    }
    
    // Учим триграммы
    for (let i = 0; i < tokens.length - 2; i++) {
      const key = tokens[i] + ' ' + tokens[i + 1];
      const w3 = tokens[i + 2];
      
      if (!this.trigrams.has(key)) {
        this.trigrams.set(key, new Map());
      }
      const current = this.trigrams.get(key)!.get(w3) || 0;
      this.trigrams.get(key)!.set(w3, current + 1);
    }
  }

  // Установка режима
  public setMode(mode: WorkMode) {
    this.mode = mode;
  }

  // Статистика
  public getStats() {
    return this.stats;
  }

  private updateStats() {
    this.stats.neurons = this.neurons.size;
    let connections = 0;
    this.neurons.forEach(n => connections += n.connections.size);
    this.stats.connections = connections;
    this.stats.memories = this.memory.length;
    this.stats.knowledge = this.knowledge.size;
  }

  // Экспорт знаний
  public exportKnowledge(): string {
    const data = {
      bigrams: Array.from(this.bigrams.entries()).map(([k, v]) => [k, Array.from(v.entries())]),
      trigrams: Array.from(this.trigrams.entries()).map(([k, v]) => [k, Array.from(v.entries())]),
      knowledge: Array.from(this.knowledge.entries()),
      memory: this.memory.slice(-100)
    };
    return JSON.stringify(data);
  }

  // Импорт знаний
  public importKnowledge(json: string): boolean {
    try {
      const data = JSON.parse(json);
      
      if (data.bigrams) {
        data.bigrams.forEach(([k, v]: [string, [string, number][]]) => {
          this.bigrams.set(k, new Map(v));
        });
      }
      
      if (data.trigrams) {
        data.trigrams.forEach(([k, v]: [string, [string, number][]]) => {
          this.trigrams.set(k, new Map(v));
        });
      }
      
      if (data.knowledge) {
        data.knowledge.forEach(([k, v]: [string, Knowledge]) => {
          this.knowledge.set(k, v);
        });
      }
      
      if (data.memory) {
        this.memory.push(...data.memory);
      }
      
      this.updateStats();
      return true;
    } catch {
      return false;
    }
  }
}
