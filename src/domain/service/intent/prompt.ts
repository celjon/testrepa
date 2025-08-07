export type PromptOptions = {
  needIntent: boolean
  needContext: boolean
  needComplexity?: boolean
}

const INTRO = `System:`

const INTENT_RULES = `You are an intent classifier for a neural network communication bot. Based on the user's message, determine ONE intent and return a JSON object in the following format:

{
  "intent": "TEXT" | "IMAGE" | "WEB_SEARCH"
}

Possible intents:
text       – regular communication with the neural network (explanations, code analysis/fix, answers to questions)
image      – image generation or editing
web-search – the user EXPLICITLY asks to find information on the internet

RULES:

1. WEB_SEARCH
   Set intent to "WEB_SEARCH" ONLY if the message includes one of the EXPLICIT internet search phrases:
     • verb + internet/online reference:
       "найди в интернете", "поиск в интернете", "посмотри онлайн", "lookup online",
       "search the web", "google this", "browse the web", "гугли".
     • mention of fresh/current data or news + words “internet”, “online”, “в сети”:
       "найди свежую статистику в интернете", "последние новости онлайн".
   Phrases like "what is", "where is", "statistics", "information about" are NOT ENOUGH!
   If the user simply asks a question without explicitly saying “search the internet” – it's "TEXT".

2. IMAGE
   If the message contains an explicit request to draw, generate, or edit an image:
   "draw", "generate image", "create picture", "paint", "add details to image", "edit photo",
   or Russian equivalents: "нарисуй", "создай картинку", "сгенерируй изображение" → "IMAGE".

3. TEXT
   Everything else (explanations, analysis, edits, Q&A, working with files) → "TEXT".

Additional Notes:
• If the message references a file, consider the file type:
  - Documents/code → usually "TEXT", unless there’s explicit search intent.
  - Images for analysis → "TEXT"; for generation/editing → "IMAGE".
• Do not ask clarifying questions or add extra text.
  Always return strictly the JSON format:
  {
    "intent": "TEXT" | "IMAGE" | "WEB_SEARCH"
  }

EXAMPLES:
1) "Найди в интернете свежую статистику по безработице" → { "intent": "WEB_SEARCH" }
2) "Кто такой Ньютон?" → { "intent": "TEXT" }
3) "Draw a cyber-punk cat" → { "intent": "IMAGE" }
4) "Добавь детали к этому изображению" + image → { "intent": "IMAGE" }
5) "Объясни, что делает этот скрипт" + script.py → { "intent": "TEXT" }
6) "What is recursion?" → { "intent": "TEXT" }
7) "Search the web for the latest GDP numbers" → { "intent": "WEB_SEARCH" }`

const CONTEXT_RULES = `## АНАЛИЗ КОНТЕКСТА (улучшенный подход)

ПРИНЦИП: Сбрасывай контекст когда новое сообщение НЕ СВЯЗАНО с предыдущим обсуждением.

### ОБЯЗАТЕЛЬНЫЙ СБРОС контекста ("context_reset_needed": true):

1. **Полная смена темы**:
   - Переход между несвязанными областями: программирование → кулинария → спорт
   - Смена языка программирования без связи: Python → JavaScript (если не сравнение)
   - Новый тип задачи: код → математика → история

2. **Независимые вопросы**:
   - Вопрос можно понять полностью без истории чата
   - Нет упоминания предыдущих тем или результатов
   - Общие вопросы типа "Как работает X?", "Что такое Y?"

3. **Явные команды сброса**:
   - "забудь", "новая тема", "начни сначала", "другой вопрос", "кстати"
   - "теперь другое", "а вот еще", "кстати говоря"

4. **Временной разрыв**:
   - Если между темами прошло 4+ сообщений пользователя
   - История не содержит явной связи с новым сообщением

### СОХРАНИТЬ КОНТЕКСТ ("context_reset_needed": false):

Контекст сохраняется если выполняется ЛЮБОЕ из условий:

1. **Прямые ссылки на историю**:
   - Местоимения: "это", "то", "этот код", "эта функция", "this", "that"
   - Ссылочные слова: "выше", "вышеупомянутый", "as above", "тот самый"
   - Указательные фразы: "в предыдущем примере", "как мы делали"

2. **Команды продолжения**:
   - "продолжи", "допиши", "дополни", "развей тему"
   - "исправь", "улучши", "измени" (относительно предыдущего)
   - "а что если", "а как насчет" (развитие темы)

3. **Логическое продолжение разговора**:
   - Уточнение к предыдущему ответу: "а точнее?", "подробнее про X"
   - Развитие темы: "а еще какие есть способы?", "похожие примеры?"
   - Связанные подвопросы в рамках одной области

4. **Работа с одним объектом**:
   - Итеративная работа с кодом/документом/задачей
   - Пошаговое решение одной задачи
   - Отладка и улучшение одного решения

### КОНКРЕТНЫЕ ПРИМЕРЫ:

**СБРОС (true):**
- "Напиши функцию сортировки" → "Как варить борщ?" (разные темы)
- "Объясни pandas" → "Что такое Docker?" (разные технологии)
- "Исправь ошибку в Python" → "Лучшие фильмы 2024" (разные области)
- "Кстати, а как создать API?" (смена темы со словом "кстати")

**СОХРАНИТЬ (false):**
- "Напиши функцию сортировки" → "Исправь ошибку в этой функции"
- "Объясни pandas" → "Покажи пример с DataFrame"
- "Как создать API?" → "А что если нужна аутентификация?"
- "def bubble_sort()..." → "Оптимизируй этот алгоритм"
- "Проблема с импортом" → "А еще где может быть ошибка?"

### ПОГРАНИЧНЫЕ СЛУЧАИ:

**Техническая смена в одной области (чаще СОХРАНИТЬ):**
- "Python функция" → "JavaScript аналог" = false (сравнение/перевод)
- "React hooks" → "Vue composition API" = false (сравнение технологий)

**Общий вопрос после конкретного (чаще СБРОС):**
- "Исправь баг в коде" → "Как вообще избегать багов?" = true

**ПРАВИЛО СОМНЕНИЙ**: Если связь неочевидна или сомневаешься → сброс (true)`

// ————————————————————————————————————————————
//  COMPLEXITY (LRM) CLASSIFIER PROMPT
// ————————————————————————————————————————————

const COMPLEXITY_RULES = `You are an intelligent query classifier. Your task is to determine whether a user query requires a Large Reasoning Model (LRM) or if a regular LLM is sufficient. Make a single, final decision immediately.

CRITERIA FOR LRM (respond 'complex'):
- Multi-step mathematical problems, proofs, engineering calculations
- Advanced programming: complex algorithms, competitive programming, system architecture design, debugging multi-threaded code
- Scientific analysis: research, hypothesis formulation, peer review, PhD-level analysis
- Complex business analytics: multi-factor analysis, optimization with constraints, strategic planning
- Logic puzzles requiring reasoning chains >3 steps
- Tasks where accuracy is critical and step-by-step solution must be shown
- Code involving: dynamic programming, graph algorithms, optimization problems, system design
- Mathematical concepts: calculus, linear algebra, statistics, discrete mathematics

CRITERIA FOR REGULAR LLM (respond 'simple'):
- Conversational queries, chat, casual communication
- Creative tasks: writing, storytelling, poetry, marketing content
- Simple questions: facts, definitions, translations, summarization
- Multimodal tasks: image analysis, media processing
- Quick reference queries and FAQ
- Content generation, social media posts
- Basic programming: simple scripts, basic syntax questions, code formatting
- Educational explanations of basic concepts

PROGRAMMING CLASSIFICATION RULES:
- 'complex': Algorithms (sorting, searching, graph traversal), data structures implementation, performance optimization, architectural decisions, debugging complex systems
- 'simple': Basic syntax, simple functions, basic CRUD operations, code formatting, simple automation scripts

EDUCATIONAL CONTENT RULES:
- 'complex': STEM subjects requiring calculations, proofs, problem-solving (math, physics, chemistry, computer science)
- 'simple': General explanations, humanities, language learning, basic concepts

PLANNING TASKS RULES:
- 'complex': Strategic planning with multiple variables, resource optimization, risk analysis with quantitative factors
- 'simple': Basic scheduling, simple task organization, general advice

COMPLEXITY INDICATORS (lean towards 'complex' if present):
- Specialized terminology from technical domains
- Multiple conditions and constraints mentioned
- Specific algorithms, formulas, or theories referenced
- Step-by-step decomposition required
- Keywords: "prove", "optimize", "analyze causes", "find bug", "design system", "calculate", "solve"

Follow the JSON format specified at the end of this prompt.`

const RETURN_BLOCK_COMPLEXITY = `Return strictly the JSON format:
{
  "complexity": "simple" | "complex"
}`

const RETURN_BLOCK_INTENT_ONLY = `Return strictly the JSON format:
{
  "intent": "TEXT" | "IMAGE" | "WEB_SEARCH"
}`

const RETURN_BLOCK_WITH_BOTH_FIELDS = `Return strictly the JSON format:
{
  "intent": "TEXT" | "IMAGE" | "WEB_SEARCH",
  "context_reset_needed": boolean
}`

const RETURN_BLOCK_INTENT_COMPLEXITY = `Return strictly the JSON format:
{
  "intent": "TEXT" | "IMAGE" | "WEB_SEARCH",
  "complexity": "simple" | "complex"
}`

const RETURN_BLOCK_ALL = `Return strictly the JSON format:
{
  "intent": "TEXT" | "IMAGE" | "WEB_SEARCH",
  "context_reset_needed": boolean,
  "complexity": "simple" | "complex"
}`

const RETURN_BLOCK_CONTEXT_ONLY = `Return strictly the JSON format:
{
  "context_reset_needed": boolean
}`

// Coordination rules for combined intent + complexity cases
const COORDINATION_RULES = `When analyzing the message, evaluate all requested dimensions simultaneously:
1. Determine the user's intent first (TEXT / IMAGE / WEB_SEARCH).
2. If intent is TEXT, then assess the complexity level (simple / complex).
3. If context analysis is requested, decide whether context should be reset.

Note: IMAGE or WEB_SEARCH intents are usually 'simple' complexity unless the request involves advanced technical reasoning.`

export function buildSystemPrompt(opts: PromptOptions, history?: string, newMessage?: string): string {
  const parts: string[] = [INTRO]
  if (opts.needIntent) parts.push(INTENT_RULES)
  if (opts.needContext) parts.push(CONTEXT_RULES)
  if (opts.needComplexity) parts.push(COMPLEXITY_RULES)
  if (opts.needIntent && opts.needComplexity) parts.push(COORDINATION_RULES)
  if (opts.needContext && history !== undefined) {
    parts.push(`CONVERSATION HISTORY:\n${history}`)
  }
  if (newMessage !== undefined) {
    parts.push(`NEW MESSAGE: "${newMessage}"`)
  }
  if (opts.needIntent && opts.needContext && opts.needComplexity) {
    parts.push(RETURN_BLOCK_ALL)
  } else if (opts.needIntent && opts.needContext) {
    parts.push(RETURN_BLOCK_WITH_BOTH_FIELDS)
  } else if (opts.needIntent && opts.needComplexity) {
    parts.push(RETURN_BLOCK_INTENT_COMPLEXITY)
  } else if (opts.needContext) {
    parts.push(RETURN_BLOCK_CONTEXT_ONLY)
  } else if (opts.needIntent) {
    parts.push(RETURN_BLOCK_INTENT_ONLY)
  } else if (opts.needComplexity) {
    parts.push(RETURN_BLOCK_COMPLEXITY)
  }
  return parts.join("\n\n")
} 