import dedent from 'dedent'
import { ArticleLinkStyle, ArticleStyle } from '@prisma/client'
import { ArticleStructuredChapter, File } from './types'
import { ValidArticleStyle } from '@/domain/entity/article'

export const SYMBOLS_COUNT_LOW_LIMIT = 3000

type ArticlePrompts = {
  generationMode: Record<string, string>

  language: string
  actor: string
  constraints: string

  articleStyle: Record<Exclude<ValidArticleStyle, 'CUSTOM'>, string>
  articleLinkStyle: Record<ArticleLinkStyle, string>

  keywords: string

  chapterByChapter: string
  chapter: string
  sourcesChapter: string
  wholeArticle: string
  generateChapter: string
}
const enableContent = false
const enableSources = true
export const articlePrompts: Record<string, ArticlePrompts> = {
  ru: {
    generationMode: {
      blogPost:
        'Создай персональный блог-пост в свободной форме по указанной теме. Используй разговорный, но грамотный стиль с личными наблюдениями и мнениями. Текст должен быть информативным, но не академичным, с элементами личного опыта. Структурируй материал с подзаголовками, короткими абзацами и включи риторические вопросы для вовлечения читателя',
      review:
        'Создай детальный обзор указанного объекта/продукта/произведения. Представь объективную оценку с обоснованными мнениями и четкими критериями оценки. Выдели сильные и слабые стороны, приведи аргументированные суждения. Заверши четким итоговым мнением или рекомендацией. Структура должна включать введение, основную аналитическую часть и заключение.',
      guide:
        'Разработай подробный пошаговый гайд по указанной теме. Начни с краткого введения о целях и ожидаемых результатах. Структурируй материал в виде последовательных, пронумерованных шагов с четкими инструкциями. Включи полезные советы, предупреждения о возможных сложностях и способы их преодоления. Используй императивные глаголы для инструкций. Заверши итоговым резюме.',
      socialMediaPost:
        'Создай краткий, привлекающий внимание пост для социальных сетей по указанной теме. Используй яркий заголовок, емкий и энергичный стиль, актуальные хештеги. Включи призыв к действию для стимулирования вовлеченности (комментарии, репосты). Текст должен быть легким для восприятия и эмоционально окрашенным.',
      advertisementPost:
        'Создай убедительный рекламный текст для указанного продукта/услуги. Структурируй материал с яркими заголовками и подзаголовками. Сфокусируйся на выгодах для пользователя, а не только на свойствах продукта. Предусмотри и развей потенциальные возражения клиентов. Включи уникальное торговое предложение, элементы социального доказательства и четкий призыв к действию.',
      writing:
        'Напиши формальное сочинение по указанной теме со строгой структурой: введение с тезисом, основная часть с развернутой аргументацией, заключение с выводами. Используй литературный язык без сленга и разговорных выражений. Обеспечь логичность и последовательность аргументации. Суждения должны быть обоснованными и связанными с центральным тезисом.',
      essay:
        'Создай размышление в форме эссе по указанной теме. Выражай субъективную точку зрения и личное мнение. Используй более свободную структуру повествования, допускающую ассоциативные связи и отступления. Можно включать цитаты, парадоксальные утверждения и нестандартные выводы. Текст должен демонстрировать оригинальность мышления и индивидуальный подход к теме.',
      report: `Составь формальный доклад по указанной теме. Структурируй материал с четкими разделами: ${enableContent ? 'титульный лист, содержание,' : ''} введение, основная часть с подразделами, заключение${enableSources ? ', список источников' : ''}. Используй деловой стиль, фактическую информацию и объективный тон. Включи актуальные данные, статистику, результаты исследований. Избегай субъективных оценок без достаточных обоснований.`,
      abstract: `Подготовь реферат, кратко излагающий содержание источников по указанной теме. Обеспечь объективное представление ключевых идей, концепций и выводов из оригинальных материалов. Структурируй текст логически, выделяя основные тематические блоки. Сохраняй нейтральность изложения без добавления собственных интерпретаций. ${enableSources ? 'Включи библиографические ссылки на используемые источники.' : ''}`,
      courseWork: `Разработай академическую курсовую работу по указанной теме со строгой структурой: ${enableContent ? 'титульный лист, содержание,' : ''} введение с обоснованием актуальности и методологией, основная часть с главами и параграфами, заключение с выводами${enableSources ? ', библиография' : ''}. Используй научный стиль, профессиональную терминологию, логическую аргументацию. Опирайся на актуальные исследования с корректным цитированием и оформлением ссылок.`,
      article:
        'Создай информационную статью по указанной теме, основанную на проверенных фактах. Используй стиль качественной журналистики: информативный заголовок, лид с ключевой информацией, основная часть с раскрытием темы, заключение. Ссылайся на авторитетные источники, включай статистику и экспертные мнения. Придерживайся объективности и сбалансированности в представлении информации.',
      storyTelling:
        'Разработай детальный кейс-стади по указанной ситуации или примеру. Структурируй материал: контекст и предыстория, описание конкретной ситуации, выявление ключевых проблем, анализ принятых решений, описание результатов и последствий, извлеченные уроки. Используй фактический материал, причинно-следственные связи и аналитический подход. Сделай акцент на практической применимости опыта.'
    },

    language: 'Русский',

    actor: dedent`
      Вы - высококвалифицированный ассистент по созданию контента, специализирующийся на написании информативных и увлекательных статей. Ваша задача - создавать качественные тексты, которые точно соответствуют заданной теме и структуре.

      Ваши ключевые навыки включают:
      - Глубокое понимание различных тем и способность быстро адаптироваться к новым предметам.
      - Умение структурировать информацию логично и последовательно.
      - Способность писать ясным, доступным языком, адаптируя стиль под целевую аудиторию.
      - Креативность в подаче материала, умение делать текст интересным и запоминающимся.
      - Способность регулировать уровень грамотности речи и резкость высказываний в зависимости от требуемого стиля.

      При написании статьи вы должны:
      - Следовать предоставленному плану, полностью раскрывая каждый пункт.
      - Обеспечить плавные переходы между разделами для лучшей читаемости.
      - Адаптировать уровень формальности, сложности языка и тон повествования в соответствии с указанным стилем.
      - Вам следует включить тему статьи в заголовке статьи или в первом абзаце.
      - Вы готовы очень гибко адаптировать свой подход в зависимости от дополнительных требований, которые будут представлены ниже.

      При написании текста используйте синтаксис Markdown.
      Также есть некоторые ограничения, которых вы должны придерживаться:
    `,

    constraints: dedent`
      - Количество символов в ответе должно быть между <min> и <max> символов. То же самое для количества слов.
      - Избегайте любого форматирования, которое могло бы указывать на текст, сгенерированный ИИ.
      - Не спорьте с темой и предоставленными источниками.
      - Не разговаривайте с тем, кто хочет сгенерировать статью.
      - Статья должна быть написана на выбранном языке, несмотря на язык предоставленного текста.
      - Вам также предоставляется <generationMode>. <generationMode> - это строка, описывающая стиль написания. Измените содержание и структуру статьи в соответствии с <generationMode>.
      - Вам также может быть предоставлен текст источника в теге <sourceContent>. Вы должны использовать его при написании статьи.
      - Вам также может быть предоставлен список ключевых слов в теге <keywords>. Эти ключевые слова используются для SEO-оптимизации. Все ключевые слова должны быть использованы в содержании.

      - Вам предоставлен <articleStyle>, который может содержать либо инструкции по стилю, либо образец текста. Независимо от формата, анализируйте ТОЛЬКО стиль письма:
      1. Языковые паттерны (словарный запас, структура предложений, переходы)
      2. Характеристики письма (тон, настроение, темп)
      3. Технические элементы (литературные приемы, организация абзацев)

      ВАЖНО: Никогда не копируйте конкретные фразы или примеры. Если дан образец текста, изучите его стиль, но создавайте полностью новый контент.
      При написании:
      - Используйте sourceContent только как справочный материал.
      - Нельзя копировать или перефразировать текст из sourceContent, за исключением прямых цитат.
      - Прямые цитаты допускаются только если они заключены в кавычки и сопровождаются ссылкой в формате <articleLinkStyle> из соответствующего link объекта из compressedSources.
      - При использовании смысла, идеи или выводов из части text, обязательно добавьте источник в соответствии с тегом <articleLinkStyle>, указанную в соответствующем link объекта из compressedSources.
      - Используйте похожий стиль с собственным содержанием.
      - Соответствуйте сложности и тону.
      - Применяйте выявленные паттерны к новым темам.
      Сосредоточьтесь на том, КАК писать, а не на том, ЧТО было написано.

      - Чрезмерное использование списков может сделать текст тяжелым для восприятия.
      - - Используйте списки только когда это действительно необходимо для структурирования важной информации.
      - - Старайтесь ограничивать количество пунктов в списке. Оптимально 3-5 пунктов, максимум 7.
      - - Если пунктов много, рассмотрите возможность разбить их на несколько отдельных списков или параграфов.
      - - Не пишите главы почти полностью состоящие из списков.
      - - Используйте короткие, емкие формулировки в пунктах списка.

      - Указывайте источники в соответствии с тэгом <articleLinkStyle>.
      - Переведите тему и названия глав на указанный язык.
      - Не заключайте свой ответ ни в какие теги.
    `,

    articleStyle: {
      ANALYTICAL: dedent`
      Напиши текст, следуя следующим инструкциям:

      - Объективное, беспристрастным изложением. 
      - Используй логическую структуру с четким делением на введение, основную часть и заключение. 
      - Опирайся на факты, данные и статистику. 
      - Используй специализированную терминологию соответствующей области знаний. 
      - Применяй пассивный залог и безличные конструкции. 
      - Избегай эмоциональных выражений и субъективных оценок. 
      - Формулируй обоснованные выводы, опираясь на представленные аргументы. 
      - Соблюдай академический стиль изложения.
      `,
      FORMAL: dedent`
        Напиши текст, следуя следующим инструкциям:

        - Используй корректный, вежливый и сдержанный тон. 
        - Придерживайся четкой структуры с логической последовательностью изложения. 
        - Формулируй мысли ясно и однозначно. 
        - Опирайся на факты, минимизируя субъективные оценки. 
        - Используй профессиональную лексику соответствующей области и устойчивые речевые обороты. 
        - Сохраняй нейтральный эмоциональный фон. 
        - Применяй грамматически правильные конструкции с преимущественно прямым порядком слов. 
        - Используй больше существительных, чем глаголов.
        - Уместно применяй общепринятые аббревиатуры.
      `,
      JOURNALISTIC: dedent`
      Напиши текст, следуя следующим инструкциям:

      - Используй риторические приемы и оценочную лексику, сохраняя доступность для широкой аудитории. 
      - Подчеркивай актуальность и социальную значимость информации.
      - Создавай выразительные заголовки и подзаголовки. 
      - Используй инклюзивные местоимения ("мы", "наше"). 
      - Выражай четкую авторскую позицию. 
      - Строй текст на основе логики и аргументации, но включай элементы эмоционального воздействия. 
      - Используй метафоры, сравнения, иронию. 
      - Поднимай общественно значимые вопросы. 
      - Пиши живым языком с ритмичными предложениями разной длины.
      `,
      CASUAL: dedent`
      Напиши текст, следуя следующим инструкциям:

      - Пиши простым, ясным и легким языком. 
      - Соблюдай баланс между объективностью и субъективностью, избегая крайностей. 
      - Используй простые синтаксические конструкции и общеупотребительную лексику. 
      - Делай текст информативным с элементами описательности. 
      - Придерживайся среднего уровня формальности, избегая как официальности, так и фамильярности. 
      - Используй предложения и абзацы средней длины. 
      - Создавай текст, понятный для разных аудиторий. 
      - Применяй умеренное количество выразительных средств.
      `,
      BLOGGER: dedent`
      Напиши текст, следуя следующим инструкциям:

      - Создавай персонализированный текст с прямыми обращениями к читателю на "ты/вы". 
      - Используй разговорный, неформальный стиль с элементами сленга и отсылками к трендам. 
      - Выражай эмоции, энтузиазм и личное мнение. 
      - Включай истории из личного опыта. 
      - Делай отсылки к популярной культуре. 
      - Используй эмодзи и другие цифровые элементы. 
      - Дели текст на короткие абзацы, используй списки и маркеры. 
      - Добавляй интерактивные элементы и призывы к действию. 
      - Используй короткие, энергичные предложения. 
      - Пиши искренне и открыто, как в личной беседе.
      `,
      PERSUASIVE: dedent`
      Напиши текст, следуя следующим инструкциям:

      - Представляй аргументы, апеллируя как к рациональному мышлению, так и к эмоциям аудитории. 
      - Логически выстраивай доводы, подкрепляя их проверяемыми фактами и доказательствами. 
      - Демонстрируй экспертность и компетентность в теме. 
      - Иллюстрируй результаты через сравнения и примеры. 
      - Адресуй возможные сомнения и возражения, предлагая на них ответы. 
      - Включай объективные свидетельства и мнения экспертов. 
      - Подчеркивай долгосрочную ценность предлагаемого решения. 
      - Мотивируй к обдуманному, но своевременному действию. 
      - Используй сильные, уверенные формулировки.
      `,
      CONVERSATIONAL: dedent`
      Напиши текст, следуя следующим инструкциям:

      - Пиши спонтанно и естественно, имитируя живую речь. 
      - Используй диалогичность и риторические вопросы. 
      - Добавляй разговорные частицы и междометия. 
      - Применяй экспрессивный синтаксис с повторами и инверсиями. 
      - Опирайся на контекст, используя ситуативные выражения. 
      - Включай неполные предложения, элементы сленга и неформальную лексику. 
      - Используй восклицания и оценочные слова. 
      - Допускай некоторые отступления от строгих грамматических норм. 
      - Создавай эффект непосредственного общения с читателем. 
      - Пиши так, словно ведешь диалог.
      `,
      OBJECTIVE: dedent`
      Напиши текст, следуя следующим инструкциям:

      - Представляй информацию обоснованно, с приведением аргументов и примеров.
      - Избегай предвзятости, учитывай разные точки зрения.
      - Анализируй как сильные, так и слабые стороны предмета.
      - Давай оценку на основе четких критериев, а не личных предпочтений.
      - Проводи сравнительный анализ с аналогами или стандартами.
      - Делай выводы, которые логически следуют из представленных фактов. 
      - Соблюдай баланс между критикой и рекомендациями.
      - Сохраняй конструктивный характер оценки.
      - Фокусируйся на фактах и доказательствах, а не на мнениях
      `,
      DESCRIPTIVE: dedent`
      Напиши текст, следуя следующим инструкциям:

      - Используй образный, живописный и метафоричный язык.
      - Создавай эмоционально насыщенные описания.
      - Развивай индивидуальный авторский стиль с узнаваемыми чертами.
      - Сстрой текст на основе сюжетности и нарративности.
      - Применяй разнообразные художественные приемы: эпитеты, метафоры, сравнения, олицетворения.
      - Передавай чувственные ощущения через описания звуков, запахов, цветов, текстур.
      - Варируй ритм и структуру предложений.
      - Фокусируйся на эстетической функции текста, чтобы вызывать эмоциональный отклик у читателя.
      `,
      INSTRUCTIVE: dedent`
      Напиши текст, следуя следующим инструкциям:

      - Выстраивай текст в виде четкой последовательности действий или шагов. 
      - Используй повелительное наклонение глаголов. 
      - Намеренно повторяй ключевые моменты для лучшего запоминания. 
      - Сопровождай инструкции пояснениями, где это необходимо. 
      - Избегай двусмысленностей и неточных формулировок. 
      - Структурируй информацию с помощью нумерации, маркеров или заголовков. 
      - Указывай возможные сложности и способы их преодоления. 
      - Используй простой и понятный язык. 
      - Делай акцент на результате каждого шага. 
      - Завершай текст указанием ожидаемого итогового результата.
      `,
      NARRATIVE: dedent`
      Напиши текст, следуя следующим инструкциям:

      - Выстраивай четкую повествовательную структуру с хронологией событий.
      - Создавай детализированные описания мест, персонажей и ситуаций.
      - Включай диалоги и внутренние монологи.
      - Формируй определенную атмосферу и настроение через описательные элементы.
      - Развивай характеры персонажей, их мотивацию и внутренние конфликты.
      - Используй литературные приемы вроде предвосхищения и ретроспективы.
      - Придавай повествованию эмоциональную окраску, вызывающую сопереживание.
      - Применяй метафоры, эпитеты и другие тропы. Создавай уникальный авторский голос.
      - Стремись к погружению читателя в описываемый мир.
      `
    },
    articleLinkStyle: {
      NONE: 'Не включайте никакие ссылки или упоминания источников в текст. Излагайте информацию без указания её происхождения.',

      DIRECT: dedent`
        ВАЖНО: Каждое значимое утверждение должно иметь ссылку на источник в формате markdown [[<number/>]](<realUrl/>).

        Требуют ссылок:
        - Статистика и количественные данные
        - Результаты исследований
        - Экспертные мнения
        - Неочевидные факты
        - Цитаты

        Не требуют ссылок:
        - Общеизвестные факты
        - Личные наблюдения (явно обозначенные)
        - Логические выводы

        Правила:
        - Ссылки ставьте сразу после цитируемого фрагмента.
        - Используйте только авторитетные реальные URL, а не заглушки.
        - Не используйте формат (^[number]).
        - НЕ добавляйте ссылку на источник после каждого абзаца.
        - Не создавайте новые номера: если источник уже упоминается в <sourceContent> под каким-то номером, используйте тот же номер.
        - Количество ссылок на источники должно быть менее 20.
       `,

      MENTION:
        'Указывайте источники информации в тексте (например, "по данным исследования Университета...", "как отмечают эксперты..."), но без прямых ссылок и URL-адресов.'
    },

    keywords: dedent`
      Оптимизируйте свой ответ для SEO, используя предоставленные ключевые слова в <keywords>:

      Инструкции:
      - Переведите ключевые слова на указанный язык
      - Измените названия глав и заголовок статьи для оптимизации под поисковые системы.
      - Естественно разместите основное ключевое слово в первом абзаце и включите его в один из заголовков ## или ###. Добавьте его в заключительный абзац для оптимального влияния на SEO.
      - Используйте 3-5 вариаций и LSI (латентное семантическое индексирование) ключевых слов по всему тексту. Поддерживайте плотность ключевых слов между 3-5%, сохраняя текст естественным и привлекательным.
      - Структурируйте статью, используя markdown-форматирование: ## для основных разделов, ### для подразделов. Используйте маркированные списки (*) и нумерованные списки где уместно для улучшения читаемости.
      - Создавайте информативный, хорошо организованный контент с четкой прогрессией темы. Каждый раздел должен естественно включать ключевые слова, сохраняя при этом поток и читаемость.
      - Используйте жирное (**) и курсивное (*) форматирование для выделения ключевых моментов и второстепенных ключевых слов где уместно. Разбивайте текст на удобные для восприятия абзацы (по 3-4 предложения).
      - Помните: сосредоточьтесь на создании статьи в формате markdown, которая должна быть удобной как для читателей, так и оптимизированной для поисковых систем.
    `,

    chapterByChapter:
      'Генерация будет выполняться поэтапно, по одному сообщению на каждую главу. Для каждой главы будут предоставлены название главы, количество символов в главе (chapterSymbolsCount) и общее количество символов, использованных во всей статье. Название главы - это просто название из структурированного плана, которое можно переименовать в соответствии с оригинальным планом.',

    chapter: dedent`
      Напишите следующую главу статьи.

      Инструкции:
      - Следуйте точной структуре плана.
      - Если название главы содержит слова "(continue)" или подобные указания на продолжение предыдущей главы: продолжите предыдущую главу, не добавляйте подзаголовок с названием главы, не уточняйте что это продолжение.
      - Иначе переведите название главы на указанный язык. 
      - Не пишите заключение в конце главы.
      - Используйте <articleUsedSymbols> и <chapterSymbolsCount> для поддержания правильной длины ответа.
      - Напишите главу без дополнительных комментариев, тэгов и обращений к пользователю.
      Напишите эту главу: 
    `,

    sourcesChapter: dedent`
        - Если в тексте есть упоминания электронных источников, добавь в конце раздел «Источники» и оформи его строго по ГОСТ Р 7.0.100–2018, используя только информацию, явно указанную в тексте или метаданных. 
        Используй следующие правила:
        - Включай в список только реально упомянутые источники.
        - Никогда не выдумывай источники.
        - Оформляй каждый источник строго по ГОСТу, придерживаясь следующего порядка элементов (если они доступны):
          - "Автор(ы). Название ресурса : сведения о типе ресурса / сведения об ответственности (редактор, составитель и др.). — Место издания : Издательство, год. — Объем. — (Серия). — Идентификатор (ISBN, DOI). — URL: адрес (дата обращения: дд.мм.гггг). — Режим доступа. — Вид содержания : электронный."
        - Формат нумерованного списка:
          - Каждый источник с новой строки, с номером.
          - Пример: "1. Агапов А.Б. Административное право : в 2 т. Т. 1. Общая часть : учебник для бакалавриата и магистратуры / А.Б. Агапов. — 11-е изд., перераб. и доп. — Москва : Юрайт, 2019. — 471 с. — (Бакалавр и магистр. Академический курс). — ISBN 978-5-534-09985-0. — URL: https://biblio-online.ru/bcode/429093 (дата обращения: 05.08.2019). — Режим доступа: Электронно-библиотечная система Юрайт. — Текст : электронный."
        - Не придумывай и не дополняй авторов, дат, издательств, ISBN, объёмы и прочие поля — используй исключительно те данные, которые есть в исходном тексте или в метаданных ресурса.
        - Используй только те, чье наличие можно подтвердить (например, по URL, цитате, названию, автору).
        - Не дублируй источники, если они уже присутствуют в списке.
        - Если один и тот же URL или DOI встречается несколько раз, оформляй его в списке только один раз.
        - Дату обращения бери ровно из исходных данных (формат дд.мм.гггг), не замещай и не генерируй её автоматически.
        - Если это сайт организации без автора, начни с названия организации и укажи, что это официальный сайт.
        - Если это статья из электронного журнала, укажи автора, название, название журнала, номер, год, страницы, URL, дату обращения и тип содержимого.
        - Если в оригинале нет сведений об издательстве, месте издания, серии, объёме или идентификаторе — просто опусти эти элементы, не ставь заглушки или «нет данных».
        - Если в тексте нет упоминаний источников, раздел «Источники» не добавляйте вовсе.
    `,

    wholeArticle: dedent`
      Напишите полную статью, соблюдая все требования.
      Следуйте структуре плана в точности:
      - Используйте все разделы и подразделы в заданном порядке
      - Тщательно раскройте каждый пункт плана
      - Оставайтесь в пределах указанного количества символов
      - Переведите названия глав и темы на русский язык.
    `,

    generateChapter: dedent`
      Создайте новую главу для продолжения существующей статьи, следуя этим условиям:
      Стиль и тон: Сохраняйте оригинальный стиль и тон статьи. Обеспечьте плавный переход от предыдущего содержания.

      Структура:
      - Если статья уже содержит заключение, продолжите его, не добавляйте новую главу. 
      - Если не возможно продолжить статью (Есть полностью законченное заключение или списки источников), не нарушая его логику повествования, ответьте пустым сообщением.
      - Разделите текст на логические абзацы
      - Используйте переходные фразы между абзацами для обеспечения связности
      - При необходимости включите 1-2 подзаголовка внутри главы
      - Завершите главу, подытожив основные идеи и намекнув на содержание следующей части (если применимо)
      - Выдайте полный ответ для новой главы, ничего не сокрощая (включая списки источников).
      - Важно: 
      - - Предоставьте только текст новой главы, без дополнительных комментариев, тегов.
      - - Не обращайтесь к пользователю в ответе и не объясняйте свой ответ.
      - - Переведите название главы на русский.
    `
  },

  en: {
    generationMode: {
      blogPost:
        'Create a personal blog post on the given topic in a free form. Use conversational, but grammatically correct style with personal observations and opinions. The text should be informative, but not academic, with elements of personal experience. Structure the material with subheadings, short paragraphs, and include rhetorical questions to engage the reader.',
      review:
        'Create a detailed review of the given object/product/work. Present an objective assessment with well-reasoned opinions and clear criteria for evaluation. Highlight the strengths and weaknesses, provide evidence-based judgments. Conclude with a clear final opinion or recommendation. The structure should include an introduction, main analytical part, and conclusion.',
      guide:
        'Develop a detailed step-by-step guide on the given topic. Start with a brief introduction to the goals and expected results. Structure the material in the form of sequential, numbered steps with clear instructions. Include useful tips, warnings about potential difficulties, and ways to overcome them. Use imperative verbs for instructions. Conclude with a summary.',
      socialMediaPost:
        'Create a short, attention-grabbing post for social media on the given topic. Use a bright headline, energetic and engaging style, relevant hashtags. Include a call to action to encourage engagement (comments, shares). The text should be easy to read and emotionally charged.',
      advertisementPost:
        'Create a persuasive advertising text for the given product/service. Structure the material with bright headlines and subheadings. Focus on the benefits for the user, not just the product features. Anticipate and address potential customer objections. Include a unique selling proposition, elements of social proof, and a clear call to action.',
      writing:
        'Write a formal essay on the given topic with a strict structure: introduction with a thesis statement, main part with developed argumentation, conclusion with conclusions. Use literary language without slang and colloquial expressions. Ensure logical coherence and consistency of argumentation. Judgments should be evidence-based and connected to the central thesis.',
      essay:
        'Create a reflection in the form of an essay on the given topic. Express a subjective point of view and personal opinion. Use a more free structure of narration, allowing associative connections and digressions. You can include quotes, paradoxical statements, and unconventional conclusions. The text should demonstrate original thinking and individual approach to the topic.',
      report:
        'Compile a formal report on the given topic. Structure the material with clear sections: title page, table of contents, introduction, main part with subheadings, conclusion, list of sources. Use a businesslike style, factual information, and an objective tone. Include current data, statistics, and research results. Avoid subjective evaluations without sufficient justification.',
      abstract:
        'Prepare an abstract, briefly summarizing the content of the sources on the given topic. Ensure an objective presentation of key ideas, concepts, and conclusions from the original materials. Structure the text logically, highlighting the main thematic blocks. Maintain neutrality of presentation without adding personal interpretations. Include bibliographic references to the sources used.',
      courseWork:
        'Develop an academic coursework on the given topic with a strict structure: title page, table of contents, introduction with justification of relevance and methodology, main part with chapters and paragraphs, conclusion with conclusions, bibliography. Use a scientific style, professional terminology, logical argumentation. Rely on current research with correct citation and formatting of references.',
      article:
        'Create an informational article on the given topic, based on verified facts. Use a quality journalism style: informative headline, lead with key information, main part with topic development, conclusion. Refer to authoritative sources, include statistics and expert opinions. Maintain objectivity and balance in presenting information.',
      storyTelling:
        'Develop a detailed case study on the given situation or example. Structure the material: context and background, description of the specific situation, identification of key problems, analysis of decisions made, description of results and consequences, lessons learned. Use factual material, causal connections, and analytical approach. Emphasize the practical applicability of the experience.'
    },

    language: 'English',
    actor: dedent`
      You are a highly skilled content creation assistant specializing in writing informative and engaging articles. Your task is to create quality texts that accurately match the given topic and structure.

      Your key skills include:
      - Deep understanding of various topics and the ability to quickly adapt to new subjects.
      - Ability to structure information logically and consistently.
      - Capability to write in clear, accessible language, adapting the style to the target audience.
      - Creativity in presenting material, making the text interesting and memorable.
      - Ability to adjust the level of speech literacy and sharpness of statements depending on the required style.

      When writing an article, you should:
      - Follow the provided plan, fully developing each point.
      - Ensure smooth transitions between sections for better readability.
      - Adapt the level of formality, language complexity, and narrative tone according to the specified style.
      - You should include the subject in the article heading or the first paragraph.
      - Be ready to very flexibly adapt your approach based on additional requirements that will be presented below.

      When writing text, use Markdown syntax.
      There are also some constraints that you must follow:
    `,
    constraints: dedent`
      - You must keep the symbols count in the response between <min> and <max> symbols. Same for the words count.
      - Avoid any formatting that could indicate AI-generated text. 
      - Do not argue with the subject and the provided sources.
      - Do not talk with the one who wants to generate the article.
      - The article must be written in the selected language despite the language of the provided text.
      - You are also provided with a <generationMode>. <generationMode> is a string that describes the style of the writing. Modify the content and structure of the article to fit the <generationMode>.
      - You are also can be provided with source content in <sourceContent> tag. You must use it when writing the article.
      - You are also can be provided with a keywords list in <keywords> tag. These keywords are used for SEO optimization. All keywords must be used in the content.

      - You are provided with <articleStyle>, which may contain either style instructions or a sample text. Regardless of format, analyze ONLY the writing style:
      1. Language patterns (vocabulary, sentence structure, transitions)
      2. Writing characteristics (tone, mood, pacing)
      3. Technical elements (literary devices, paragraph organization)

      IMPORTANT: Never copy specific phrases or examples. If a sample text is provided, analyze its style but create entirely original content.
      When writing:
      - Use the sourceContent only as a reference
      - Do not copy or rephrase any text from the sourceContent
      - If you use the meaning, idea, or conclusion from any part of the text, you must add a source according to the <articleLinkStyle> specified in the link field of the corresponding compressedSources object
      - Use a similar style with your own content
      - Match the complexity and tone
      - Apply the identified patterns to new topics
      Focus on HOW to write, not WHAT was written.

      - Excessive use of enumerations can make the text difficult to perceive.
      - - Use enumerations only when it's really necessary to structure important information.
      - - Try to limit the number of items in a list. Optimally 3-5 points, maximum 7.
      - - If there are many points, consider splitting them into several separate lists or paragraphs.
      - - Alternate enumerations with regular text for better perception.
      - - Use short, concise wording in list items.

      - Specify sources according to the <articleLinkStyle> tag
      - Translate the topic and chapter names into the specified language.
      - Do not wrap your response within any kind of tag
    `,
    articleStyle: {
      ANALYTICAL: dedent`
      Write the text following these instructions:

      - Objectively, without taking a side. 
      - Use a logical structure with a clear division into introduction, main part, and conclusion. 
      - Rely on facts, data, and statistics. 
      - Use specialized terminology of the relevant field of knowledge. 
      - Apply the passive voice and impersonal constructions. 
      - Avoid emotional expressions and subjective assessments. 
      - Draw well-grounded conclusions based on the presented arguments. 
      - Maintain an academic writing style.
      `,
      FORMAL: dedent`
        Write the text following these instructions:

        - Use a correct, polite, and restrained tone. 
        - Maintain a clear structure with a logical sequence of presentation. 
        - Formulate thoughts clearly and unambiguously. 
        - Rely on facts, minimizing subjective assessments. 
        - Use professional terminology of the relevant field and common speech patterns. 
        - Preserve a neutral emotional tone. 
        - Apply grammatically correct constructions with a predominantly direct word order. 
        - Use more nouns than verbs.
        - Use generally accepted abbreviations.
      `,
      JOURNALISTIC: dedent`
      Write the text following these instructions:

      - Use rhetorical devices and evaluative language, while maintaining accessibility for a wide audience. 
      - Emphasize the relevance and social significance of the information.
      - Create expressive headings and subheadings. 
      - Use inclusive pronouns ("we", "our"). 
      - Express a clear author's position. 
      - Build the text based on logic and argumentation, but include elements of emotional impact. 
      - Use metaphors, comparisons, and irony. 
      - Raise socially significant questions. 
      - Write in a lively language with rhythmic sentences of varying length.
      `,
      CASUAL: dedent`
      Write the text following these instructions:

      - Write in a simple, clear, and easy-to-understand language. 
      - Maintain a balance between objectivity and subjectivity, avoiding extremes. 
      - Use simple syntactic constructions and common vocabulary. 
      - Make the text informative with elements of description. 
      - Maintain a medium level of formality, avoiding both officiality and familiarity. 
      - Use sentences and paragraphs of medium length. 
      - Create a text understandable for different audiences. 
      - Apply moderate amounts of expressive means.
      `,
      BLOGGER: dedent`
      Write the text following these instructions:

      - Create a personalized text with direct addresses to the reader on "you/your". 
      - Use an informal, conversational style with elements of slang and references to trends. 
      - Express emotions, enthusiasm, and personal opinions. 
      - Include stories from personal experience. 
      - Make references to popular culture. 
      - Use emojis and other digital elements. 
      - Divide the text into short paragraphs, use lists and markers. 
      - Add interactive elements and calls to action. 
      - Use short, energetic sentences. 
      - Write sincerely and openly, as in a personal conversation.
      `,
      PERSUASIVE: dedent`
      Write the text following these instructions:

      - Present arguments, appealing to both rational thinking and emotions of the audience. 
      - Logically build arguments, supporting them with verifiable facts and evidence. 
      - Demonstrate expertise and competence in the subject matter. 
      - Illustrate results through comparisons and examples. 
      - Address potential doubts and objections, offering answers. 
      - Include objective evidence and expert opinions. 
      - Emphasize the long-term value of the proposed solution. 
      - Motivate to take thoughtful, but timely action. 
      - Use strong, confident formulations.
      `,
      CONVERSATIONAL: dedent`
      Write the text following these instructions:

      - Write spontaneously and naturally, imitating live speech. 
      - Use dialogue and rhetorical questions. 
      - Add conversational particles and interjections. 
      - Apply expressive syntax with repetitions and inversions. 
      - Rely on context, using situational expressions. 
      - Include incomplete sentences, slang, and informal vocabulary. 
      - Use exclamations and evaluative words. 
      - Allow some deviations from strict grammatical norms. 
      - Create the effect of direct communication with the reader. 
      - Write as if you were having a conversation.
      `,
      OBJECTIVE: dedent`
      Write the text following these instructions:

      - Present information in a well-grounded, fact-based manner.
      - Avoid bias, considering different points of view.
      - Analyze both strengths and weaknesses of the subject.
      - Give an assessment based on clear criteria, rather than personal preferences.
      - Make a comparative analysis with analogs or standards.
      - Draw conclusions that logically follow from the presented facts. 
      - Maintain a balance between criticism and recommendations.
      - Preserve a constructive tone.
      - Focus on facts and evidence, rather than opinions
      `,
      DESCRIPTIVE: dedent`
      Write the text following these instructions:

      - Use vivid, figurative, and metaphorical language.
      - Create emotionally charged descriptions.
      - Develop an individual authorial style with recognizable features.
      - Build the text around a storyline or narrative.
      - Apply various literary devices: epithets, metaphors, comparisons, personifications.
      - Convey sensory experiences through descriptions of sounds, smells, colors, textures.
      - Vary sentence rhythm and structure.
      - Focus on the aesthetic function of the text to evoke an emotional response from the reader.
      `,
      INSTRUCTIVE: dedent`
      Write the text following these instructions:

      - Build the text in a clear sequence of actions or steps. 
      - Use the imperative mood of verbs. 
      - Intentionally repeat key points for better memorization. 
      - Accompany instructions with explanations when necessary. 
      - Avoid ambiguities and imprecise formulations. 
      - Structure information using numbering, markers, or headings. 
      - Indicate possible difficulties and ways to overcome them. 
      - Use simple and clear language. 
      - Emphasize the result of each step. 
      - Conclude the text with an indication of the expected final result.
      `,
      NARRATIVE: dedent`
      Write the text following these instructions:

      - Build a clear narrative structure with a chronology of events.
      - Create detailed descriptions of places, characters, and situations.
      - Include dialogues and internal monologues.
      - Create a certain atmosphere and mood through descriptive elements.
      - Develop characters, their motivation, and internal conflicts.
      - Use literary devices such as foreshadowing and retrospection.
      - Give the narrative an emotional color, evoking empathy.
      - Apply metaphors, epithets, and other tropes. Create a unique authorial voice.
      - Strive for immersion of the reader in the described world.
      `
    },
    articleLinkStyle: {
      NONE: 'Do not include any links or source mentions in the text. Present information without indicating its origin.',

      DIRECT: dedent`
        IMPORTANT: Each significant statement must have a source reference in markdown format [[<number/>]](<realUrl/>). But don't overload text with too many source references.

        Require references:
        - Statistics and quantitative data
        - Research results 
        - Expert opinions
        - Non-obvious facts
        - Quotes

        Don't require references:
        - Common knowledge
        - Personal observations (clearly marked)
        - Logical conclusions

        Rules:
        - References are placed after the cited material
        - Use authoritative sources
        - Don't use format (^[number])
        - Don't use placeholder links (like example.com), use real source links
        - Don't overload text with too many source references. DO NOT include source reference after each paragraph.
        - Number of source references should be less than 20
        - Use sequential numbering across whole text
      `,

      MENTION:
        'Indicate information sources in the text (for example, "according to University research...", "as experts note..."), but without direct links and URLs.'
    },

    keywords: dedent`
      Optimize your response for SEO using the provided keywords in <keywords>:

      Instructions:
      - Translate keywords into the specified language
      - Modify chapter names and title of the article to optimize it for search engines
      - Place the main keyword naturally in the first paragraph and include it in one of the ## or ### headings. Add it to the concluding paragraph for optimal SEO impact
      - Use 3-5 variations and LSI (Latent Semantic Indexing) keywords throughout the text. Maintain keyword density between 3-5% while keeping the text natural and engaging
      - Structure the article using markdown formatting: ## for main sections, ### for subsections. Use bullet points (*) and numbered lists where appropriate to improve readability
      - Create informative, well-organized content with clear topic progression. Each section should naturally incorporate keywords while maintaining flow and readability
      - Use bold (**) and italic (*) formatting to emphasize key points and secondary keywords where relevant. Break text into digestible paragraphs (3-4 sentences each)
      - Remember: focus on creating markdown-formatted article should be both reader-friendly and search-engine optimized
    `,

    chapterByChapter:
      'The generation will be done step by step. One message for one chapter. For each chapter you will be provided with chapter name, chapterSymbolsCount and symbols count used in the whole article. Chapter name is just a name of the chapter in structurized plan, you can rename it according to the original plan.',

    chapter: dedent`
      Write the next chapter of the article
      Instructions:
      - Follow the exact structure of the plan.
      - If the chapter title contains the words "(continue)" or similar indications that it's a continuation of the previous chapter: continue the previous chapter, don't add a subheading with the chapter title, don't specify that it's a continuation.
      - Translate the chapter title to the specified language.
      - Do not write a conclusion at the end of the chapter.
      - Use <articleUsedSymbols> and <chapterSymbolsCount> to maintain correct response length
      - Write the chapter without additional comments, tags and addressing the user
      Write this chapter: 
    `,

    sourcesChapter: dedent`
      - If there are any references to sources in the text, write a "Sources" section at the end that will contain a complete list of sources used in the text. Otherwise, don't write anything.
      - Do not duplicate sources if they have already been mentioned earlier in the list.
      - Never invent sources. Only list those actually mentioned in the text and whose existence can be verified (for example, by URL or specific citation).
      - Source list format: 1. Last Name I.O. (all authors of the source), "Article/Book Title", Publication/Publisher, Year, URL (omit unnecessary fields if not available; do not use placeholders, do not write "continue list" or similar).
      - If there are no references to sources in the text, do not add a "Sources" section at all.
    `,

    wholeArticle: dedent`
      Write a complete article following all requirements.
      Follow the plan structure exactly:
      - Use all sections and subsections in the given order
      - Cover each point of the plan thoroughly
      - Stay within the specified symbols count
      - Translate the topic and chapter names into the english language.
    `,

    generateChapter: dedent`
      Create a new chapter to continue the existing article, following these conditions:
      Style and tone: Maintain the original style and tone of the article. Ensure a smooth transition from previous content.

      Structure:
      - If the article already contains a conclusion, continue it, don't add a new chapter.
      - If it's impossible to continue the article (There is a fully completed conclusion or source lists) without breaking its narrative logic, respond with an empty message.
      - Divide the text into logical paragraphs
      - Use transitional phrases between paragraphs to ensure coherence
      - Include 1-2 subheadings within the chapter if necessary
      - Conclude the chapter by summarizing main ideas and hinting at the content of the next part (if applicable)
      - Respond with the full chapter content, without shortening anything (including reference lists)
      - Important:
      - - Provide only the text of the new chapter, without additional comments, tags.
      - - Don't address the user in the response and don't explain your answer.
      - - Translate the chapter title to english.
    `
  },

  es: {
    generationMode: {
      blogPost:
        'Crear un post de blog personal sobre el tema dado en forma libre. Utilice un estilo conversacional pero gramaticalmente correcto con observaciones y opiniones personales. El texto debe ser informativo pero no académico, con elementos de experiencia personal. Estructura el material con títulos, párrafos cortos y preguntas retóricas para involucrar al lector.',
      review:
        'Crear una revisión detallada del objeto/producto/trabajo dado. Presente una evaluación objetiva con opiniones bien razonadas y criterios claros para la evaluación. Destaque las fortalezas y debilidades, proporcione juicios basados en evidencia. Concluya con una opinión clara y recomendación final. La estructura debe incluir una introducción, una parte analítica principal y una conclusión.',
      guide:
        'Desarrollar una guía detallada paso a paso sobre el tema dado. Inicie con una breve introducción a los objetivos y resultados esperados. Estructura el material en forma de pasos secuenciales numerados con instrucciones claras. Incluya consejos útiles, advertencias sobre dificultades potenciales y formas de superarlas. Utilice verbos imperativos para instrucciones. Concluya con un resumen.',
      socialMediaPost:
        'Crear un post breve y atractivo para las redes sociales sobre el tema dado. Utilice un título brillante, un estilo enérgico y emocionante, hashtags relevantes. Incluya una llamada a la acción para fomentar la participación (comentarios, compartidos). El texto debe ser fácil de leer y emocionalmente cargado.',
      advertisementPost:
        'Crear un texto publicitario persuasivo para el producto/servicio dado. Estructura el material con títulos brillantes y subtítulos. Enfóquese en los beneficios para el usuario, no solo en las características del producto. Anticipe y aborde objeciones potenciales del cliente. Incluya una proposición de venta única, elementos de prueba social y una llamada a la acción clara.',
      writing:
        'Escribir un ensayo formal sobre el tema dado con una estructura estricta: introducción con una tesis, parte principal con argumentación desarrollada, conclusión con conclusiones. Utilice un lenguaje literario sin slang ni expresiones coloquiales. Asegúrese de la coherencia lógica y la consistencia de la argumentación. Los juicios deben ser basados en evidencia y conectados a la tesis central.',
      essay:
        'Crear una reflexión en forma de ensayo sobre el tema dado. Expresarse una opinión personal y subjetiva. Utilice una estructura de narración más libre, permitiendo conexiones asociativas y digresiones. Puede incluir citas, afirmaciones paradójicas y conclusiones no convencionales. El texto debe demostrar pensamiento original y enfoque individual hacia el tema.',
      report:
        'Compilar un informe formal sobre el tema dado. Estructura el material con secciones claras: portada, tabla de contenidos, introducción, parte principal con subtítulos, conclusión, lista de fuentes. Utilice un estilo empresarial, información factual y un tono objetivo. Incluya datos actuales, estadísticas y resultados de investigación. Evite evaluaciones subjetivas sin justificación suficiente.',
      abstract:
        'Preparar un resumen, resumiendo brevemente el contenido de las fuentes sobre el tema dado. Asegúrese de una presentación objetiva de las ideas clave, conceptos y conclusiones de los materiales originales. Estructura el texto de manera lógica, destacando los bloques temáticos principales. Mantenga la neutralidad de presentación sin agregar interpretaciones personales. Incluya referencias bibliográficas a las fuentes utilizadas.',
      courseWork:
        'Desarrollar un trabajo académico sobre el tema dado con una estructura estricta: portada, tabla de contenidos, introducción con justificación de relevancia y metodología, parte principal con capítulos y párrafos, conclusión con conclusiones, bibliografía. Utilice un estilo científico, terminología profesional, argumentación lógica. Asegúrese de la precisión y la exactitud de la información.',
      article:
        'Crear un artículo informativo sobre el tema dado, basado en hechos verificados. Utilice un estilo de periodismo de calidad: título informativo, lead con información clave, parte principal con desarrollo del tema, conclusión. Haga referencia a fuentes autorizadas, incluya estadísticas y opiniones de expertos. Mantenga la objetividad y el equilibrio en la presentación de la información.',
      storyTelling:
        'Desarrollar un caso de estudio detallado sobre la situación o ejemplo dado. Estructura el material: contexto y antecedentes, descripción de la situación específica, identificación de problemas clave, análisis de las decisiones tomadas, descripción de los resultados y consecuencias, lecciones aprendidas. Utilice material factual, conexiones causales y enfoque analítico. Enfatice la aplicabilidad práctica de la experiencia.'
    },

    language: 'Español',
    actor: dedent`
      Usted es un asistente de creación de contenido altamente calificado, especializado en escribir artículos informativos y atractivos. Su tarea es crear textos de calidad que se ajusten con precisión al tema y estructura dados.

      Sus habilidades clave incluyen:
      - Comprensión profunda de diversos temas y capacidad para adaptarse rápidamente a nuevos temas.
      - Habilidad para estructurar la información de manera lógica y coherente.
      - Capacidad para escribir en un lenguaje claro y accesible, adaptando el estilo al público objetivo.
      - Creatividad en la presentación del material, haciendo que el texto sea interesante y memorable.
      - Capacidad para ajustar el nivel de corrección del lenguaje y la intensidad de las declaraciones según el estilo requerido.

      Al escribir un artículo, debe:
      - Seguir el plan proporcionado, desarrollando completamente cada punto.
      - Asegurar transiciones suaves entre secciones para una mejor legibilidad.
      - Adaptar el nivel de formalidad, complejidad del lenguaje y tono narrativo de acuerdo con el estilo especificado.
      - Puedes incluir el tema en el título del artículo o en el primer párrafo.
      - Estar listo para adaptar su enfoque de manera muy flexible según los requisitos adicionales que se presentarán a continuación.

      Al escribir texto, utilice la sintaxis de Markdown.
      También hay algunas restricciones que debes seguir:
    `,
    constraints: dedent`
      - Debes mantener el recuento de símbolos en la respuesta entre <min> y <max> símbolos. Lo mismo para el recuento de palabras.
      - Evita cualquier formato que pueda indicar texto generado por IA.
      - No discutas con el tema y las fuentes proporcionadas.
      - No hables con quien quiera generar el artículo.
      - El artículo debe estar escrito en el idioma seleccionado a pesar del idioma del texto proporcionado.
      - También se te proporciona un <generationMode>. <generationMode> es una cadena que describe el estilo de la escritura. Modifica el contenido y la estructura del artículo para que se ajuste al <generationMode>.
      - También se te puede proporcionar contenido fuente en la etiqueta <sourceContent>. Debes usarlo al escribir el artículo.
      - También se te puede proporcionar una lista de palabras clave en la etiqueta <keywords>. Estas palabras clave se utilizan para la optimización SEO. Todas las palabras clave deben utilizarse en el contenido.

      - Se le proporciona <articleStyle>, que puede contener instrucciones de estilo o un texto de muestra. Independientemente del formato, analice SOLO el estilo de escritura:
      1. Patrones de lenguaje (vocabulario, estructura de oraciones, transiciones)
      2. Características de escritura (tono, estado de ánimo, ritmo)
      3. Elementos técnicos (recursos literarios, organización de párrafos)
      
      IMPORTANTE: Nunca copie frases o ejemplos específicos. Si se proporciona un texto de muestra, analice su estilo, pero cree contenido completamente nuevo.
      Al escribir:
      - Utilice sourceContent solo como material de referencia
      - No copie ni reformule ningún fragmento del sourceContent
      - Si utiliza el significado, la idea o las conclusiones de una parte del texto, debe añadir la fuente según la etiqueta <articleLinkStyle> indicada en el campo link del objeto correspondiente en compressedSources
      - Use un estilo similar con su propio contenido
      - Coincida con la complejidad y el tono
      - Aplique los patrones identificados a nuevos temas
      Concéntrese en CÓMO escribir, no en QUÉ fue escrito.

      - El uso excesivo de enumeraciones puede hacer que el texto sea difícil de percibir.
      - - Utilice enumeraciones solo cuando sea realmente necesario para estructurar información importante.
      - - Intente limitar el número de elementos en una lista. Óptimamente de 3 a 5 puntos, máximo 7.
      - - Si hay muchos puntos, considere dividirlos en varias listas o párrafos separados.
      - - Alterne las enumeraciones con texto normal para una mejor percepción.
      - - Utilice formulaciones breves y concisas en los elementos de la lista.

      - Especifique las fuentes de acuerdo con la etiqueta <articleLinkStyle>
      - Traduzca el tema y los nombres de los capítulos al idioma especificado.
      - No envuelva su respuesta dentro de ningún tipo de etiqueta
    `,
    articleStyle: {
      ANALYTICAL: dedent`
      Escribe el texto siguiendo estas instrucciones:

      - Objetivamente, sin tomar partido.
      - Usa una estructura lógica con una clara división en introducción, parte principal y conclusión.
      - Basa el contenido en hechos, datos y estadísticas.
      - Emplea terminología especializada del campo de conocimiento relevante.
      - Aplica la voz pasiva y construcciones impersonales.
      - Evita expresiones emocionales y valoraciones subjetivas.
      - Extrae conclusiones bien fundamentadas basadas en los argumentos presentados.
      - Mantén un estilo de escritura académica.
      `,
      FORMAL: dedent`
        Escribe el texto siguiendo estas instrucciones:

        - Usa un tono correcto, educado y contenido.
        - Mantén una estructura clara con una secuencia lógica de presentación.
        - Formula las ideas de manera clara y sin ambigüedades.
        - Basate en hechos, minimizando las valoraciones subjetivas.
        - Utiliza terminología profesional del campo relevante y patrones de habla comunes.
        - Preserva un tono emocional neutral.
        - Aplica construcciones gramaticalmente correctas con un orden de palabras predominantemente directo.
        - Usa más sustantivos que verbos.
        - Utiliza abreviaturas generalmente aceptadas.
      `,
      JOURNALISTIC: dedent`
      Escribe el texto siguiendo estas instrucciones:

      - Utiliza recursos retóricos y lenguaje evaluativo, manteniendo la accesibilidad para una amplia audiencia.
      - Destaca la relevancia y el impacto social de la información.
      - Crea títulos y subtítulos expresivos.
      - Usa pronombres inclusivos ("nosotros", "nuestro").
      - Expresa una clara postura del autor.
      - Conecta el texto basado en la lógica y la argumentación, pero incluye elementos de impacto emocional.
      - Usa metáforas, comparaciones e ironía.
      - Plantea preguntas socialmente relevantes.
      - Escribe en un lenguaje vivo con oraciones rítmicas de longitud variable.
      `,
      CASUAL: dedent`
      Escribe el texto siguiendo estas instrucciones:

      - Escribe en un lenguaje sencillo, claro y fácil de entender.
      - Mantén un equilibrio entre objetividad y subjetividad, evitando extremos.
      - Utiliza construcciones sintácticas simples y vocabulario común.
      - Haz que el texto sea informativo con elementos de descripción.
      - Mantén un nivel medio de formalidad, evitando tanto la oficialidad como la familiaridad.
      - Utiliza oraciones y párrafos de longitud media.
      - Crea un texto comprensible para diferentes audiencias.
      - Aplica cantidades moderadas de medios expresivos.
      `,
      BLOGGER: dedent`
      Escribe el texto siguiendo estas instrucciones:

      - Crea un texto personalizado con direcciones directas al lector en "tú/tu". 
      - Usa un estilo informal y conversacional con elementos de slang y referencias a tendencias.
      - Expresa emociones, entusiasmo y opiniones personales. 
      - Incluye historias de experiencia personal. 
      - Haz referencias a la cultura popular. 
      - Usa emojis y otros elementos digitales. 
      - Divide el texto en párrafos cortos, usa listas y marcadores. 
      - Agrega elementos interactivos y llamadas a la acción. 
      - Usa oraciones cortas y energéticas. 
      - Escribe sinceramente y abiertamente, como en una conversación personal.
      `,
      PERSUASIVE: dedent`
      Escribe el texto siguiendo estas instrucciones:

      - Presenta argumentos, apelando tanto a la razón como a las emociones del público. 
      - Construye argumentos de manera lógica, respaldándolos con hechos verificables y pruebas. 
      - Demuestra experiencia y competencia en el tema. 
      - Ilustra resultados mediante comparaciones y ejemplos. 
      - Aborda dudas y objeciones potenciales, ofreciendo respuestas. 
      - Incluye evidencia objetiva y opiniones de expertos. 
      - Destaca el valor a largo plazo de la solución propuesta. 
      - Motiva a tomar decisiones informadas, pero oportunas. 
      - Usa formulaciones fuertes y confiadas.
      `,
      CONVERSATIONAL: dedent`
      Escribe el texto siguiendo estas instrucciones:

      - Escribe de manera espontánea y natural, imitando el habla en vivo.
      - Usa diálogos y preguntas retóricas.
      - Añade partículas conversacionales e interjecciones.
      - Aplica una sintaxis expresiva con repeticiones e inversiones.
      - Confía en el contexto, usando expresiones situacionales.
      - Incluye oraciones incompletas, jerga y vocabulario informal.
      - Usa exclamaciones y palabras evaluativas.
      - Permite algunas desviaciones de las normas gramaticales estrictas.
      - Crea el efecto de comunicación directa con el lector.
      - Escribe como si estuvieras teniendo una conversación.
      `,
      OBJECTIVE: dedent`
      Escribe el texto siguiendo estas instrucciones:

      - Presenta la información de manera bien fundamentada y basada en hechos.
      - Evita el sesgo, considerando diferentes puntos de vista.
      - Analiza tanto las fortalezas como las debilidades del tema.
      - Ofrece una evaluación basada en criterios claros, en lugar de preferencias personales.
      - Realiza un análisis comparativo con análogos o estándares.
      - Extrae conclusiones que siguen lógicamente de los hechos presentados. 
      - Mantén un equilibrio entre crítica y recomendaciones.
      - Conserva un tono constructivo.
      - Centra tu atención en los hechos y la evidencia, en lugar de opiniones
      `,
      DESCRIPTIVE: dedent`
      Escribe el texto siguiendo estas instrucciones:

      - Usa lenguaje vívido, figurado y metafórico.
      - Crea descripciones emocionalmente cargadas.
      - Desarrolla un estilo autorial individual con características reconocibles.
      - Construye el texto alrededor de una historia o narrativa.
      - Aplica dispositivos literarios variados: epítetos, metáforas, comparaciones, personificaciones.
      - Transmite experiencias sensoriales a través de descripciones de sonidos, olores, colores, texturas.
      - Varía el ritmo y la estructura de las oraciones.
      - Centra tu atención en la función estética del texto para evocar una respuesta emocional en el lector.
      `,
      INSTRUCTIVE: dedent`
      Escribe el texto siguiendo estas instrucciones:

      - Construye el texto en una secuencia clara de acciones o pasos.
      - Usa el modo imperativo de los verbos.
      - Repite intencionalmente los puntos clave para una mejor memorización.
      - Acompaña instrucciones con explicaciones cuando sea necesario.
      - Evita ambigüedades y formulaciones imprecisas.
      - Estructura la información usando numeración, marcadores o títulos.
      - Indica posibles dificultades y formas de superarlas.
      - Usa un lenguaje simple y claro.
      - Destaca el resultado de cada paso.
      - Concluye el texto con una indicación del resultado final esperado.
      `,
      NARRATIVE: dedent`
      Escribe el texto siguiendo estas instrucciones:

      - Crea una estructura narrativa clara con una cronología de eventos.
      - Crea descripciones detalladas de lugares, personajes y situaciones.
      - Incluye diálogos y monólogos internos.
      - Crea un cierto ambiente y estado de ánimo a través de elementos descriptivos.
      - Desarrolla personajes, su motivación y conflictos internos.
      - Usa recursos literarios como prefiguración y retrospección.
      - Da al texto un color emocional, evocando empatía.
      - Aplica metáforas, epítetos y otros tropos. Crea una voz autoral única.
      - Procura la inmersión del lector en el mundo descrito.
      `
    },
    articleLinkStyle: {
      NONE: 'No incluya enlaces ni menciones de fuentes en el texto. Presente la información sin indicar su origen.',

      DIRECT: dedent`
        IMPORTANTE: Cada afirmación significativa debe tener una referencia a la fuente en formato markdown [[<number/>]](<realUrl/>). Pero no sobrecargue el texto con demasiadas referencias de fuentes.

        Requieren referencias:
        - Estadísticas y datos cuantitativos
        - Resultados de investigaciones
        - Opiniones de expertos
        - Hechos no obvios
        - Citas

        No requieren referencias:
        - Hechos de conocimiento común
        - Observaciones personales (claramente marcadas)
        - Conclusiones lógicas

        Reglas:
        - Las referencias se colocan después del material citado
        - Use fuentes autorizadas
        - No use el formato (^[number])
        - No use enlaces de marcador de posición (como example.com), use enlaces de fuente reales
        - No sobrecargue el texto con demasiadas referencias de fuentes. No escribas un enlace después de cada párrafo.
        - El número de referencias de fuentes debe ser menor a 20
        - Use numeración secuencial
      `,

      MENTION:
        'Indique las fuentes de información en el texto (por ejemplo, "según la investigación de la Universidad...", "como señalan los expertos..."), pero sin enlaces directos ni URLs.'
    },

    keywords: dedent`
      Optimice su respuesta para SEO usando las palabras clave proporcionadas en <keywords>:

      Instrucciones:
      - Traduzca las palabras clave al idioma especificado
      - Modifique los nombres de los capítulos y el título del artículo para optimizarlo para motores de búsqueda
      - Coloque la palabra clave principal de forma natural en el primer párrafo e inclúyala en uno de los encabezados ## o ###. Añádala al párrafo de conclusión para un impacto SEO óptimo
      - Use 3-5 variaciones y palabras clave LSI (Indexación Semántica Latente) a lo largo del texto. Mantenga la densidad de palabras clave entre 3-5% mientras mantiene el texto natural y atractivo
      - Estructure el artículo usando formato markdown: ## para secciones principales, ### para subsecciones. Use viñetas (*) y listas numeradas donde sea apropiado para mejorar la legibilidad
      - Cree contenido informativo y bien organizado con una clara progresión del tema. Cada sección debe incorporar naturalmente palabras clave mientras mantiene el flujo y la legibilidad
      - Use formato en negrita (**) y cursiva (*) para enfatizar puntos clave y palabras clave secundarias donde sea relevante. Divida el texto en párrafos digeribles (3-4 oraciones cada uno)
      - Recuerde: enfóquese en crear un artículo con formato markdown que sea amigable tanto para los lectores como optimizado para motores de búsqueda
    `,

    chapterByChapter:
      'La generación se realizará paso a paso, con un mensaje por cada capítulo. Para cada capítulo, se proporcionará el nombre del capítulo, el recuento de símbolos del capítulo (chapterSymbolsCount) y el recuento de símbolos utilizados en todo el artículo. El nombre del capítulo es simplemente el nombre en el plan estructurado, que se puede renombrar según el plan original.',

    chapter: dedent`
      Escriba el siguiente capítulo del artículo
      Instrucciones:
      - Siga la estructura exacta del plan.
      - Si el título del capítulo contiene las palabras "(continue)" o indicaciones similares de que es una continuación del capítulo anterior: continúe el capítulo anterior, no agregue un subtítulo con el título del capítulo, no especifique que es una continuación.
      - Traduzca el título del capítulo al idioma especificado.
      - No escriba una conclusión al final del capítulo.
      - Use <articleUsedSymbols> y <chapterSymbolsCount> para mantener la longitud correcta de la respuesta
      - Escriba el capítulo sin comentarios adicionales, tags ni dirigirse al usuario
      Escriba este capítulo: 
    `,

    sourcesChapter: dedent`
      - Si hay referencias a fuentes en el texto, escriba una sección "Fuentes" que contendrá una lista completa de las fuentes utilizadas en el texto. De lo contrario, no escriba nada.
      - No duplique fuentes si ya han sido mencionadas anteriormente en la lista.
      - Nunca invente fuentes. Solo incluya aquellas realmente mencionadas en el texto y cuya existencia pueda verificarse (por ejemplo, por URL o cita específica).
      - Formato de lista de fuentes: 1. Apellido I.O. (todos los autores de la fuente), "Título del artículo/libro", Publicación/Editorial, Año, URL (elimine los campos innecesarios si no están disponibles; no use marcadores de posición, no escriba "continuar lista" ni algo similar).
      - Si no hay referencias a fuentes en el texto, no agregue la sección "Fuentes" en absoluto.
      `,

    wholeArticle: dedent`
      Escriba un artículo completo siguiendo todos los requisitos.
      Siga la estructura del plan exactamente:
      - Use todas las secciones y subsecciones en el orden dado
      - Cubra cada punto del plan minuciosamente
      - Manténgase dentro del recuento de símbolos especificado
      - Traduzca el tema y los nombres de los capítulos al idioma español.
    `,

    generateChapter: dedent`
      Cree un nuevo capítulo para continuar el artículo existente, siguiendo estas condiciones:
      Estilo y tono: Mantenga el estilo y tono original del artículo. Asegure una transición suave desde el contenido anterior.

      Estructura:
      - Si el artículo ya contiene una conclusión, continúela, no agregue un nuevo capítulo.
      - Si es imposible continuar el artículo (Hay una conclusión completamente terminada o listas de fuentes) sin romper su lógica narrativa, responda con un mensaje vacío.
      - Divida el texto en párrafos lógicos
      - Use frases de transición entre párrafos para asegurar la coherencia
      - Incluya 1-2 subtítulos dentro del capítulo si es necesario
      - Concluya el capítulo resumiendo las ideas principales y sugiriendo el contenido de la siguiente parte (si corresponde)
      - Importante:
      - - Proporcionar solo el texto del nuevo capítulo, sin comentarios adicionales, etiquetas, tags.
      - - No dirigirse al usuario en la respuesta y no explicar su respuesta.
      - - Traducir el título del capítulo al español.
    `
  },
  pt: {
    generationMode: {
      blogPost:
        'Crie um post de blog pessoal sobre o tópico dado em forma livre. Use um estilo conversacional, mas gramaticalmente correto, com observações e opiniões pessoais. O texto deve ser informativo, mas não acadêmico, com elementos de experiência pessoal. Estruture o material com subtítulos, parágrafos curtos e inclua perguntas retóricas para engajar o leitor.',
      review:
        'Crie uma revisão detalhada do objeto/produto/trabalho dado. Apresente uma avaliação objetiva com opiniões bem fundamentadas e critérios claros de avaliação. Destaque as fortes e fracas, forneça julgamentos com base em evidências. Conclua com uma opinião final clara ou recomendação. A estrutura deve incluir uma introdução, parte principal analítica e conclusão.',
      guide:
        'Desenvolva um guia detalhado passo a passo sobre o tópico dado. Inicie com uma breve introdução sobre os objetivos e resultados esperados. Estruture o material na forma de passos sequenciais numerados com instruções claras. Inclua dicas úteis, alertas sobre possíveis dificuldades e maneiras de superá-las. Use verbos imperativos para instruções. Conclua com um resumo.',
      socialMediaPost:
        'Crie um post curto e atraente para redes sociais sobre o tópico dado. Use um título atraente, estilo energético e hashtags relevantes. Inclua uma chamada para ação para incentivar o engajamento (comentários, compartilhamentos). O texto deve ser fácil de ler e emocionalmente carregado.',
      advertisementPost:
        'Crie um texto de propaganda persuasivo para o produto/serviço dado. Estruture o material com títulos e subtítulos atraentes. Foque nos benefícios para o usuário, e não apenas nas características do produto. Antecipe e aborde objecções potenciais do cliente. Inclua uma proposta de valor única, elementos de prova social e uma chamada para ação clara.',
      writing:
        'Escreva um ensaio formal sobre o tópico dado com uma estrutura rígida: introdução com uma afirmação de tese, parte principal com argumentação desenvolvida, conclusão com conclusões. Use linguagem literária sem gíria e expressões coloquiais. Certifique-se de que a coerência lógica e consistência de argumentação sejam mantidas. Os julgamentos devem ser comprovados por evidências e conectados à tese central.',
      essay:
        'Crie uma reflexão em forma de ensaio sobre o tópico dado. Expressa uma opinião subjetiva e pessoal. Use uma estrutura de narrativa mais livre, permitindo conexões associativas e digressões. Você pode incluir citações, declarações paradoxais e conclusões não convencionais. O texto deve demonstrar pensamento original e abordagem individual ao tópico.',
      report:
        'Compile um relatório formal sobre o tópico dado. Estruture o material com seções claras: página de título, sumário, introdução, parte principal com subtítulos, conclusão, lista de fontes. Use um estilo profissional, informações factuais e um tom objetivo. Inclua dados atuais, estatísticas e resultados de pesquisa. Evite avaliações subjetivas sem justificação suficiente.',
      abstract:
        'Prepare um resumo, resumindo brevemente o conteúdo das fontes sobre o tópico dado. Certifique-se de uma apresentação objetiva de idéias principais, conceitos e conclusões das fontes originais. Estruture o texto logicamente, destacando os principais blocos temáticos. Mantenha a neutralidade de apresentação sem adicionar interpretações pessoais. Inclua referências bibliográficas às fontes utilizadas.',
      courseWork:
        'Desenvolva um trabalho acadêmico sobre o tópico dado com uma estrutura rígida: página de título, sumário, introdução com justificativa de relevância e metodologia, parte principal com capítulos e parágrafos, conclusão com conclusões, bibliografia. Use um estilo científico, terminologia profissional, argumentação lógica. Baseie-se em pesquisas atuais com citações corretas e formatação de referências.',
      article:
        'Crie um artigo informativo sobre o tópico dado, baseado em fatos verificados. Use um estilo de jornalismo de qualidade: título atraente, lead com informações-chave, parte principal com desenvolvimento do tópico, conclusão. Referencie fontes autorizadas, inclua estatísticas e opiniões de especialistas. Mantenha objetividade e equilíbrio ao apresentar informações.',
      storyTelling:
        'Desenvolva um estudo de caso detalhado sobre a situação ou exemplo dado. Estruture o material: contexto e background, descrição da situação específica, identificação de problemas-chave, análise de decisões tomadas, descrição de resultados e consequências, lições aprendidas. Use material factual, conexões causais e abordagem analítica. Destaque a aplicabilidade prática da experiência.'
    },

    language: 'Português',
    actor: dedent`
      Você é um assistente de criação de conteúdo altamente qualificado, especializado em escrever artigos informativos e envolventes. Sua tarefa é criar textos de qualidade que correspondam precisamente ao tópico e à estrutura fornecidos.

      Suas principais habilidades incluem:
      - Compreensão profunda de vários tópicos e capacidade de se adaptar rapidamente a novos assuntos.
      - Capacidade de estruturar informações de forma lógica e consistente.
      - Habilidade para escrever em linguagem clara e acessível, adaptando o estilo ao público-alvo.
      - Criatividade na apresentação do material, tornando o texto interessante e memorável.
      - Capacidade de ajustar o nível de correção da linguagem e a intensidade das declarações de acordo com o estilo necessário.

      Ao escrever um artigo, você deve:
      - Seguir o plano fornecido, desenvolvendo completamente cada ponto.
      - Garantir transições suaves entre as seções para melhor legibilidade.
      - Adaptar o nível de formalidade, complexidade da linguagem e tom narrativo de acordo com o estilo especificado.
      - Você pode incluir o assunto no título do artigo ou no primeiro parágrafo.
      - Estar pronto para adaptar sua abordagem de forma muito flexível com base em requisitos adicionais que serão apresentados abaixo.

      Ao escrever texto, use a sintaxe Markdown.
      Existem também algumas restrições que você deve seguir:
    `,

    constraints: dedent`
      - Você deve manter a contagem de símbolos na resposta entre <min> e <max> símbolos. O mesmo para a contagem de palavras.
      - Evite qualquer formatação que possa indicar texto gerado por IA.
      - Não discuta com o assunto e as fontes fornecidas.
      - Não fale com quem quer gerar o artigo.
      - O artigo deve ser escrito no idioma selecionado, independentemente do idioma do texto fornecido.
      - Você também recebe um <generationMode>. <generationMode> é uma string que descreve o estilo da escrita. Modifique o conteúdo e a estrutura do artigo para se adequar ao <generationMode>.
      - Você também pode receber conteúdo de origem na tag <sourceContent>. Você deve usá-lo ao escrever o artigo.
      - Você também pode receber uma lista de palavras-chave na tag <keywords>. Essas palavras-chave são usadas para otimização de SEO. Todas as palavras-chave devem ser usadas no conteúdo.

      - Você recebe <articleStyle>, que pode conter instruções de estilo ou um texto de amostra. Independentemente do formato, analise APENAS o estilo de escrita:
      1. Padrões de linguagem (vocabulário, estrutura de frases, transições)
      2. Características de escrita (tom, humor, ritmo)
      3. Elementos técnicos (recursos literários, organização de parágrafos)

      IMPORTANTE: Nunca copie frases ou exemplos específicos. Se for fornecido um texto de exemplo, estude seu estilo, mas crie um conteúdo completamente novo.
      Ao escrever:
      - Use o sourceContent apenas como referência
      - Não copie nem reformule nenhum trecho do sourceContent
      - Se utilizar ideias, significados ou conclusões de parte do texto, inclua a fonte conforme a marca <articleLinkStyle> especificada no campo link do objeto correspondente em compressedSources
      - Use um estilo semelhante com seu próprio conteúdo
      - Corresponda à complexidade e ao tom
      - Aplique os padrões identificados a novos temas
      Concentre-se em COMO escrever, não em O QUE foi escrito.

      - O uso excessivo de enumerações pode tornar o texto difícil de perceber.
      - - Use enumerações apenas quando for realmente necessário para estruturar informações importantes.
      - - Tente limitar o número de itens em uma lista. Idealmente de 3 a 5 pontos, no máximo 7.
      - - Se houver muitos pontos, considere dividi-los em várias listas ou parágrafos separados.
      - - Alterne enumerações com texto normal para uma melhor percepção.
      - - Use formulações curtas e concisas nos itens da lista.

      - Especifique as fontes de acordo com a tag <articleLinkStyle>
      - Traduza o tema e os nomes dos capítulos para o idioma especificado.
      - Não coloque sua resposta dentro de nenhum tipo de tag
    `,
    articleStyle: {
      ANALYTICAL: dedent`
      Escreva o texto seguindo estas instruções:

      - Objetivamente, sem tomar partido.
      - Use uma estrutura lógica com uma divisão clara em introdução, parte principal e conclusão.
      - Baseie-se em fatos, dados e estatísticas.
      - Use terminologia especializada no campo de conhecimento relevante.
      - Aplique a voz passiva e construções impessoais.
      - Evite expressões emocionais e avaliações subjetivas.
      - Tire conclusões bem fundamentadas com base nos argumentos apresentados.
      - Mantenha um estilo de escrita acadêmico.
      `,
      FORMAL: dedent`
      Escreva o texto seguindo estas instruções:

      - Use um tom correto, educado e contido. 
      - Mantenha uma estrutura clara com uma sequência lógica de apresentação. 
      - Formule pensamentos de forma clara e inequívoca. 
      - Baseie-se em fatos, minimizando avaliações subjetivas. 
      - Use terminologia profissional do campo relevante e padrões de fala comum. 
      - Preserve um tom emocional neutro. 
      - Aplique construções gramaticalmente corretas com uma ordem de palavras predominantemente direta. 
      - Use mais substantivos do que verbos.
      - Use abreviações amplamente aceitas.
      `,
      JOURNALISTIC: dedent`
      Escreva o texto seguindo estas instruções:

      - Use dispositivos retóricos e linguagem avaliativa, mantendo a acessibilidade para um público amplo.
      - Enfatize a relevância e a importância social da informação.
      - Crie títulos e subtítulos expressivos.
      - Use pronomes inclusivos ("nós", "nosso").
      - Expresse uma posição clara do autor.
      - Construa o texto com base na lógica e argumentação, mas inclua elementos de impacto emocional.
      - Use metáforas, comparações e ironia.
      - Levante questões socialmente significativas.
      - Escreva em uma linguagem viva com frases rítmicas de comprimentos variados.
      `,
      CASUAL: dedent`
      Escreva o texto seguindo estas instruções:

      - Escreva em um linguajar simples, claro e fácil de entender. 
      - Mantenha um equilíbrio entre objetividade e subjetividade, evitando extremos. 
      - Use construções sintáticas simples e vocabulário comum. 
      - Faça o texto informativo com elementos de descrição. 
      - Mantenha um nível de formalidade médio, evitando tanto a oficialidade quanto a familiaridade. 
      - Use frases e parágrafos de tamanho médio. 
      - Crie um texto compreensível para diferentes públicos. 
      - Aplique quantidades moderadas de recursos expressivos.
      `,
      BLOGGER: dedent`
      Escreva o texto seguindo estas instruções:

      - Crie um texto personalizado com endereços diretos ao leitor usando "você/seu".
      - Use um estilo informal e conversacional com elementos de gírias e referências a tendências.
      - Expresse emoções, entusiasmo e opiniões pessoais.
      - Inclua histórias de experiências pessoais.
      - Faça referências à cultura popular.
      - Use emojis e outros elementos digitais.
      - Divida o texto em parágrafos curtos, use listas e marcadores.
      - Adicione elementos interativos e chamadas para ação.
      - Use frases curtas e enérgicas.
      - Escreva de forma sincera e aberta, como em uma conversa pessoal.
      `,
      PERSUASIVE: dedent`
      Escreva o texto seguindo estas instruções:

      - Apresente argumentos, apelando tanto ao raciocínio racional quanto às emoções do público.
      - Construa argumentos logicamente, apoiando-os com fatos verificáveis e evidências.
      - Demonstre expertise e competência no assunto.
      - Ilustre resultados por meio de comparações e exemplos.
      - Aborde dúvidas e objeções potenciais, oferecendo respostas.
      - Inclua evidências objetivas e opiniões de especialistas.
      - Enfatize o valor a longo prazo da solução proposta.
      - Motive a tomar uma ação ponderada, mas oportuna.
      - Use formulações fortes e confiantes.
      `,
      CONVERSATIONAL: dedent`
      Escreva o texto seguindo estas instruções:

      - Escreva de forma espontânea e natural, imitando a fala ao vivo.
      - Use diálogos e perguntas retóricas.
      - Adicione partículas conversacionais e interjeições.
      - Aplique sintaxe expressiva com repetições e inversões.
      - Confie no contexto, usando expressões situacionais.
      - Inclua frases incompletas, gírias e vocabulário informal.
      - Use exclamações e palavras avaliativas.
      - Permita algumas desvios das normas gramaticais estritas.
      - Crie o efeito de comunicação direta com o leitor.
      - Escreva como se estivesse conversando.
      `,
      OBJECTIVE: dedent`
      Escreva o texto seguindo estas instruções:

      - Apresente informa es de forma fundamentada e baseada em fatos.
      - Evite vi ses, considerando diferentes pontos de vista.
      - Analise tanto for as quanto fraquezas do assunto.
      - Fa a uma avalia o com base em crit rios claros, em vez de prefer ncias pessoais.
      - Fa a uma an lise comparativa com an logos ou padr es.
      - Tire conclus es que seguem logicamente dos fatos apresentados. 
      - Mantenha um tom construtivo.
      - Foque em fatos e evid ncias, em vez de opini es.
      `,
      DESCRIPTIVE: dedent`
      Escreva o texto seguindo estas instruções:

      - Use linguagem viva, figurativa e metaf rica.
      - Crie descri es emocionalmente carregadas.
      - Desenvolva um estilo autorial individual com caracter sticas reconhec veis.
      - Construa o texto em torno de uma hist ria ou narrativa.
      - Aplique v rios recursos liter rios: ep tulos, met foras, compara es, personifica es.
      - Transmita experi ncias sensoriais atrav s de descri es de sons, cheiros, cores, texturas.
      - Varie o ritmo e a estrutura das senten as.
      - Foque na fun o est tica do texto para evocar uma resposta emocional do leitor.
      `,
      INSTRUCTIVE: dedent`
      Escreva o texto seguindo estas instruções:

      - Construa o texto em uma sequência clara de ações ou passos.
      - Use o modo imperativo dos verbos.
      - Repita intencionalmente pontos-chave para melhor memorização.
      - Acompanhe as instruções com explicações quando necessário.
      - Evite ambiguidades e formulações imprecisas.
      - Estruture a informação usando numeração, marcadores ou títulos.
      - Indique possíveis dificuldades e formas de superá-las.
      - Use linguagem simples e clara.
      - Enfatize o resultado de cada passo.
      - Conclua o texto com uma indicação do resultado final esperado.
      `,
      NARRATIVE: dedent`
      Escreva o texto seguindo estas instruções:

      - Construa uma estrutura narrativa clara com uma cronologia de eventos.
      - Crie descrições detalhadas de lugares, personagens e situações.
      - Inclua diálogos e monólogos internos.
      - Crie uma certa atmosfera e humor através de elementos descritivos.
      - Desenvolva personagens, suas motivações e conflitos internos.
      - Use dispositivos literários como prenúncio e retrospecção.
      - Dê à narrativa uma cor emocional, evocando empatia.
      - Aplique metáforas, epítetos e outros tropos. Crie uma voz autoral única.
      - Busque a imersão do leitor no mundo descrito.
      `
    },
    articleLinkStyle: {
      NONE: 'Não inclua links ou menções de fontes no texto. Apresente informações sem indicar sua origem.',

      DIRECT: dedent`
        IMPORTANTE: Cada afirmação significativa deve ter uma referência à fonte no formato markdown [[<number/>]](<realUrl/>). Mas não sobrecarregue o texto com muitas referências de fontes.

        Requerem referências:
        - Estatísticas e dados quantitativos
        - Resultados de pesquisas
        - Opiniões de especialistas
        - Fatos não óbvios
        - Citações

        Não requerem referências:
        - Fatos de conhecimento comum
        - Observações pessoais (claramente marcadas)
        - Conclusões lógicas

        Regras:
        - As referências são colocadas após o material citado
        - Use fontes autoritativas
        - Não use o formato (^[number])
        - Não use links de marcador (como example.com), use links reais de fontes
        - Não sobrecarregue o texto com muitas referências de fontes. Não escreva um link depois de cada parágrafo.
        - O número de referências de fontes deve ser menor que 20
        - Use numeração sequencial
      `,

      MENTION:
        'Indique fontes de informação no texto (por exemplo, "de acordo com pesquisa da Universidade...", "como observam os especialistas..."), mas sem links diretos e URLs.'
    },

    keywords: dedent`
      Otimize sua resposta para SEO usando as palavras-chave fornecidas em <keywords>:

      Instruções:
      - Traduza as palavras-chave para o idioma especificado
      - Modifique os nomes dos capítulos e o título do artigo para otimizá-lo para mecanismos de busca
      - Coloque a palavra-chave principal naturalmente no primeiro parágrafo e inclua-a em um dos cabeçalhos ## ou ###. Adicione-a ao parágrafo de conclusão para um impacto SEO ideal
      - Use 3-5 variações e palavras-chave LSI (Indexação Semântica Latente) ao longo do texto. Mantenha a densidade de palavras-chave entre 3-5% mantendo o texto natural e envolvente
      - Estruture o artigo usando formatação markdown: ## para seções principais, ### para subseções. Use marcadores (*) e listas numeradas onde apropriado para melhorar a legibilidade
      - Crie conteúdo informativo e bem organizado com clara progressão do tópico. Cada seção deve incorporar naturalmente palavras-chave mantendo o fluxo e a legibilidade
      - Use formatação em negrito (**) e itálico (*) para enfatizar pontos-chave e palavras-chave secundárias onde relevante. Divida o texto em parágrafos digeríveis (3-4 frases cada)
      - Lembre-se: foque em criar um artigo formatado em markdown que seja amigável tanto para leitores quanto otimizado para mecanismos de busca
    `,

    chapterByChapter:
      'A geração será feita passo a passo, com uma mensagem para cada capítulo. Para cada capítulo, serão fornecidos o nome do capítulo, a contagem de símbolos do capítulo (chapterSymbolsCount) e a contagem de símbolos usados em todo o artigo. O nome do capítulo é apenas o nome no plano estruturado, que pode ser renomeado de acordo com o plano original.',

    chapter: dedent`
      Escreva o próximo capítulo do artigo
      Instruções:
      - Siga a estrutura exata do plano.
      - Se o título do capítulo contiver as palavras "(continue)" ou indicações semelhantes de que é uma continuação do capítulo anterior: continue o capítulo anterior, não adicione um subtítulo com o título do capítulo, não especifique que é uma continuação.
      - Traduza o título do capítulo para o idioma especificado.
      - Não escreva uma conclusão no final do capítulo
      - Use <articleUsedSymbols> e <chapterSymbolsCount> para manter o comprimento correto da resposta
      - Escreva o capítulo sem comentários adicionais, tags ou dirigir-se ao usuário
      Escreva este capítulo:
    `,

    sourcesChapter: dedent`
      - Se houver referências a fontes no texto, escreva uma seção "Fontes" que conterá uma lista completa das fontes utilizadas no texto. Caso contrário, não escreva nada.
      - Não duplique fontes se já tiverem sido mencionadas anteriormente na lista.
      - Nunca invente fontes. Liste apenas aquelas realmente mencionadas no texto e cuja existência pode ser verificada (por exemplo, por URL ou citação específica).
      - Formato da lista de fontes: 1. Sobrenome I.O. (todos os autores da fonte), "Título do artigo/livro", Publicação/Editora, Ano, URL (omita campos desnecessários caso não estejam disponíveis; não use espaços reservados, não escreva "continuar lista" ou algo semelhante).
      - Se não houver referências a fontes no texto, não adicione a seção "Fontes" de forma alguma.   
     `,

    wholeArticle: dedent`
      Escreva um artigo completo seguindo todos os requisitos.
      Siga a estrutura do plano exatamente:
      - Use todas as seções e subseções na ordem dada
      - Cubra cada ponto do plano minuciosamente
      - Permaneça dentro da contagem de símbolos especificada
      - Traduza o tema e os nomes dos capítulos para o idioma português.
    `,

    generateChapter: dedent`
      Crie um novo capítulo para continuar o artigo existente, seguindo estas condições:
      Estilo e tom: Mantenha o estilo e tom original do artigo. Garanta uma transição suave do conteúdo anterior.

      Estrutura:
      - Se o artigo já contiver uma conclusão, continue-a, não adicione um novo capítulo.
      - Se for impossível continuar o artigo (Há uma conclusão totalmente finalizada ou listas de fontes) sem quebrar sua lógica narrativa, responda com uma mensagem vazia.
      - Divida o texto em parágrafos lógicos
      - Use frases de transição entre parágrafos para garantir coerência
      - Inclua 1-2 subtítulos dentro do capítulo se necessário
      - Conclua o capítulo resumindo as ideias principais e sugerindo o conteúdo da próxima parte (se aplicável)
      - Importante:
      - - Forneça apenas o texto do novo capítulo, sem comentários adicionais, tags.
      - - Não se dirija ao usuário na resposta e não explique sua resposta.
      - - Traduzir o título do capítulo para o português.
    `
  },
  fr: {
    generationMode: {
      blogPost: `Créez un article de blog personnel sur le sujet donné sous une forme libre. Utilisez un style conversationnel, mais grammaticalement correct avec des observations et opinions personnelles. Le texte doit être informatif, mais pas académique, avec des éléments d'expérience personnelle. Structurez le matériel avec des sous-titres, de courts paragraphes et incluez des questions rhétoriques pour engager le lecteur.`,
      review: `Créez une critique détaillée de l'objet/produit/œuvre donné. Présentez une évaluation objective avec des opinions bien raisonnées et des critères clairs d'évaluation. Mettez en avant les forces et les faiblesses, fournissez des jugements basés sur des preuves. Concluez avec une opinion finale claire ou une recommandation. La structure doit inclure une introduction, une partie analytique principale et une conclusion.`,
      guide: `Développez un guide détaillé étape par étape sur le sujet donné. Commencez par une brève introduction aux objectifs et aux résultats attendus. Structurez le matériel sous forme d'étapes séquentielles numérotées avec des instructions claires. Incluez des conseils utiles, des avertissements sur les difficultés potentielles et des moyens de les surmonter. Utilisez des verbes impératifs pour les instructions. Concluez par un résumé.`,
      socialMediaPost: `Créez un court message accrocheur pour les réseaux sociaux sur le sujet donné. Utilisez un titre éclatant, un style énergique et engageant, des hashtags pertinents. Incluez un appel à l'action pour encourager l'engagement (commentaires, partages). Le texte doit être facile à lire et chargé émotionnellement.`,
      advertisementPost: `Créez un texte publicitaire persuasif pour le produit/service donné. Structurez le matériel avec des titres et sous-titres éclatants. Concentrez-vous sur les avantages pour l'utilisateur, pas seulement sur les caractéristiques du produit. Anticipez et répondez aux objections potentielles des clients. Incluez une proposition de vente unique, des éléments de preuve sociale et un appel à l'action clair.`,
      writing: `Rédigez un essai formel sur le sujet donné avec une structure stricte : introduction avec une déclaration de thèse, partie principale avec une argumentation développée, conclusion avec des conclusions. Utilisez un langage littéraire sans argot ni expressions familières. Assurez la cohérence logique et la constance de l'argumentation. Les jugements doivent être basés sur des preuves et reliés à la thèse centrale.`,
      essay: `Créez une réflexion sous forme d'essai sur le sujet donné. Exprimez un point de vue subjectif et une opinion personnelle. Utilisez une structure de narration plus libre, permettant des connexions associatives et des digressions. Vous pouvez inclure des citations, des déclarations paradoxales et des conclusions non conventionnelles. Le texte doit démontrer une pensée originale et une approche individuelle du sujet.`,
      report: `Rédigez un rapport formel sur le sujet donné. Structurez le matériel avec des sections claires : page de titre, table des matières, introduction, partie principale avec sous-titres, conclusion, liste des sources. Utilisez un style professionnel, des informations factuelles et un ton objectif. Incluez des données actuelles, des statistiques et des résultats de recherche. Évitez les évaluations subjectives sans justification suffisante.`,
      abstract: `Préparez un résumé, en résumant brièvement le contenu des sources sur le sujet donné. Assurez une présentation objective des idées clés, des concepts et des conclusions des matériaux originaux. Structurez le texte logiquement, en mettant en évidence les principaux blocs thématiques. Maintenez la neutralité de la présentation sans ajouter d'interprétations personnelles. Incluez des références bibliographiques aux sources utilisées.`,
      courseWork: `Développez un travail de cours académique sur le sujet donné avec une structure stricte : page de titre, table des matières, introduction avec justification de la pertinence et méthodologie, partie principale avec chapitres et paragraphes, conclusion avec conclusions, bibliographie. Utilisez un style scientifique, une terminologie professionnelle, une argumentation logique. Appuyez-vous sur des recherches actuelles avec une citation et un formatage corrects des références.`,
      article: `Créez un article informatif sur le sujet donné, basé sur des faits vérifiés. Utilisez un style de journalisme de qualité : titre informatif, accroche avec les informations clés, partie principale avec développement du sujet, conclusion. Référez-vous à des sources autoritaires, incluez des statistiques et des opinions d'experts. Maintenez l'objectivité et l'équilibre dans la présentation des informations.`,
      storyTelling: `Développez une étude de cas détaillée sur la situation ou l'exemple donné. Structurez le matériel : contexte et arrière-plan, description de la situation spécifique, identification des problèmes clés, analyse des décisions prises, description des résultats et des conséquences, leçons apprises. Utilisez du matériel factuel, des connexions causales et une approche analytique. Mettez l'accent sur l'applicabilité pratique de l'expérience.`
    },

    language: 'Français',
    actor: dedent`
      Vous êtes un assistant hautement qualifié en création de contenu, spécialisé dans la rédaction d'articles informatifs et engageants. Votre tâche est de créer des textes de qualité qui correspondent précisément au sujet et à la structure donnés.

      Vos compétences clés incluent :
      - Une compréhension approfondie de divers sujets et la capacité de s'adapter rapidement à de nouveaux domaines.
      - La capacité à structurer l'information de manière logique et cohérente.
      - L'aptitude à écrire dans un langage clair et accessible, en adaptant le style au public cible.
      - La créativité dans la présentation du matériel, rendant le texte intéressant et mémorable.
      - La capacité à ajuster le niveau de correction linguistique et la force des déclarations en fonction du style requis.

      Lors de la rédaction d'un article, vous devez :
      - Suivre le plan fourni, en développant pleinement chaque point.
      - Assurer des transitions fluides entre les sections pour une meilleure lisibilité.
      - Adapter le niveau de formalité, la complexité du langage et le ton narratif selon le style spécifié.
      - Vous pouvez inclure le sujet dans le titre de l'article ou dans le premier paragraphe.
      - Être prêt à adapter votre approche de manière très flexible en fonction des exigences supplémentaires qui seront présentées ci-dessous.

      Lors de la rédaction du texte, utilisez la syntaxe Markdown.
      Il y a aussi des contraintes que vous devez respecter:
    `,

    constraints: `
      - Vous devez maintenir le nombre de symboles dans la réponse entre <min> et <max> symboles. De même pour le nombre de mots.
      - Évitez tout formatage qui pourrait indiquer un texte généré par l'IA.
      - Ne contestez pas le sujet et les sources fournies.
      - Ne parlez pas avec celui qui veut générer l'article.
      - L'article doit être rédigé dans la langue sélectionnée, quelle que soit la langue du texte fourni.
      - On vous fournit également un <generationMode>. <generationMode> est une chaîne qui décrit le style d'écriture. Modifiez le contenu et la structure de l'article pour l'adapter au <generationMode>.
      - Vous disposez également de <articleStyle>. <articleStyle> pourrait contenir un style d'article spécifique, une description du style de l'article ou le texte que vous devez imiter. Veuillez étudier attentivement le style d'écriture, le ton, la structure des phrases et les particularités linguistiques de cet extrait et les imiter dans l'article. Votre tâche est d'imiter le plus fidèlement possible le style d'écriture de l'extrait fourni, en incluant: Le choix des mots et la phraséologie; Le ton et l'ambiance; Le rythme et le tempo de la narration; Tous les procédés littéraires ou figures de style caractéristiques; Essayez de faire en sorte que le nouveau texte se lise comme s'il avait été écrit par l'auteur de l'extrait original.
      - On peut également vous fournir du contenu source dans la balise <sourceContent>. Vous devez l'utiliser lors de la rédaction de l'article.

      - On vous fournit <articleStyle>, qui peut contenir soit des instructions de style, soit un texte exemple. Quel que soit le format, analysez UNIQUEMENT le style d'écriture:
      1. Motifs linguistiques (vocabulaire, structure des phrases, transitions)
      2. Caractéristiques d'écriture (ton, ambiance, rythme)
      3. Éléments techniques (procédés littéraires, organisation des paragraphes)

      IMPORTANT : Ne copiez jamais de phrases ou d'exemples spécifiques. Si un texte d’exemple est fourni, étudiez son style, mais créez un contenu entièrement nouveau.
      Lors de l’écriture:
      - Utilisez sourceContent uniquement comme référence
      - Ne copiez ni ne reformulez aucun extrait du sourceContent
      - Si vous utilisez une idée, un sens ou une conclusion issue d’une partie du texte, vous devez inclure la source en suivant la balise <articleLinkStyle> indiquée dans le champ link de l’objet correspondant dans compressedSources
      - Utilisez un style similaire avec votre propre contenu
      - Adoptez la même complexité et le même ton
      - Appliquez les modèles identifiés à de nouveaux sujets
      Concentrez-vous sur COMMENT écrire, pas sur CE QUI a été écrit.

      - On peut également vous fournir une liste de mots-clés dans la balise <keywords>. Ces mots-clés sont utilisés pour l'optimisation SEO. Tous les mots-clés doivent être utilisés dans le contenu.
      - L'utilisation excessive d'énumérations peut rendre le texte difficile à percevoir.
      - - Utilisez les énumérations uniquement lorsque c'est vraiment nécessaire pour structurer des informations importantes.
      - - Essayez de limiter le nombre d'éléments dans une liste. Idéalement 3 à 5 points, maximum 7.
      - - S'il y a beaucoup de points, envisagez de les diviser en plusieurs listes ou paragraphes distincts.
      - - Alternez les énumérations avec du texte normal pour une meilleure perception.
      - - Utilisez des formulations courtes et concises dans les éléments de la liste.

      - Spécifiez les sources selon la balise <articleLinkStyle>
      - Traduisez le sujet et les noms des chapitres dans la langue spécifiée.
      - Ne mettez pas votre réponse entre des balises de quelque type que ce soit
    `,

    articleStyle: {
      ANALYTICAL: dedent`
      Écrivez le texte en suivant ces instructions :

      - De manière objective, sans prendre parti.
      - Utilisez une structure logique avec une division claire en introduction, partie principale et conclusion.
      - Fondez-vous sur des faits, des données et des statistiques.
      - Utilisez des termes spécialisés du domaine concerné.
      - Appliquez la voix passive et les constructions impersonnelles.
      - Évitez les expressions émotionnelles et les évaluations subjectives.
      - Tirez des conclusions bien fondées sur les arguments présentés.
      - Maintenez un style d'écriture académique.
      `,
      FORMAL: dedent`
      Écrivez le texte en suivant ces instructions :

      - Utilisez un ton correct, poli et mesuré. 
      - Maintenez une structure claire avec une séquence logique de présentation. 
      - Formulez vos pensées de manière claire et non équivoque. 
      - Faites confiance aux faits, en minimisant les évaluations subjectives. 
      - Utilisez un vocabulaire professionnel du domaine concerné et des expressions du langage courant. 
      - Préserviez un ton émotionnel neutre. 
      - Appliquez des constructions grammaticales correctes avec un ordre des mots principalement direct. 
      - Utilisez plus de noms que de verbes.
      - Utilisez des abréviations généralement acceptées.
      `,
      JOURNALISTIC: dedent`
      Écrivez le texte en suivant ces instructions :

      - Utilisez des procédés rhétoriques et un langage évaluatif, tout en maintenant l'accessibilité pour un public large. 
      - Mettez en avant l'importance et la pertinence sociale de l'information.
      - Créez des titres et des sous-titres expressifs. 
      - Utilisez des pronoms inclusifs ("nous", "notre"). 
      - Exprimez clairement votre position d'auteur. 
      - Construisez le texte en fonction de la logique et de l'argumentation, mais incluez des éléments d'impact émotionnel. 
      - Utilisez des métaphores, des comparaisons et de l'ironie. 
      - Posez des questions sociales importantes. 
      - Écrivez dans un langage vivant avec des phrases rythmées de longueurs variées.
      `,
      CASUAL: dedent`
      Écrivez le texte en suivant ces instructions :

      - Utilisez un langage simple, clair et facile à comprendre. 
      - Maintenez un équilibre entre objectivité et subjectivité, en évitant les extrêmes. 
      - Utilisez des constructions syntaxiques simples et un vocabulaire courant. 
      - Faites du texte informatif avec des éléments de description. 
      - Maintenez un niveau de formalité moyen, en évitant à la fois l'officiel et le familier. 
      - Utilisez des phrases et des paragraphes de longueur moyenne. 
      - Créez un texte compréhensible par différents publics. 
      - Appliquez des moyens expressifs modérés.
      `,
      BLOGGER: dedent`
      Écrivez le texte en suivant ces instructions :

      - Créez un texte personnalisé avec des adresses directes au lecteur sur "vous/votre".
      - Utilisez un style informel et conversationnel avec des éléments de langage familier et des références à la culture populaire.
      - Exprimez des émotions, de l'enthousiasme et des opinions personnelles.
      - Incluez des histoires issues de l'expérience personnelle.
      - Faites des références à la culture populaire.
      - Utilisez des émojis et d'autres éléments numériques.
      - Divisez le texte en paragraphes courts, utilisez des listes et des marqueurs.
      - Ajoutez des éléments interactifs et des appels à l'action.
      - Utilisez des phrases courtes et énergiques.
      - Écrivez sincerement et ouvertement, comme dans une conversation personnelle.
      `,
      PERSUASIVE: dedent`
      Écrivez le texte en suivant ces instructions :

      - Présentez des arguments, en faisant appel à la fois à la pensée rationnelle et aux émotions du public.
      - Construisez logiquement des arguments, en les soutenant par des faits vérifiables et des preuves.
      - Faites preuve d'expertise et de compétence dans le sujet.
      - Illustrez les résultats par des comparaisons et des exemples.
      - Répondez aux doutes et objections potentiels, en offrant des réponses.
      - Incluez des preuves objectives et des avis d'experts.
      - Mettez l'accent sur la valeur à long terme de la solution proposée.
      - Motivez à prendre une action réfléchie, mais opportune.
      - Utilisez des formulations fortes et confiantes.
      `,
      CONVERSATIONAL: dedent`
      Écrivez le texte en suivant ces instructions :

      - Écrivez spontanément et naturellement, en imitant la parole vivante.
      - Utilisez des dialogues et des questions rhétoriques.
      - Ajoutez des particules conversationnelles et des interjections.
      - Appliquez une syntaxe expressive avec des répétitions et des inversions.
      - Appuyez-vous sur le contexte, en utilisant des expressions situationnelles.
      - Incluez des phrases incomplètes, de l'argot et un vocabulaire informel.
      - Utilisez des exclamations et des mots d'évaluation.
      - Autorisez quelques écarts par rapport aux normes grammaticales strictes.
      - Créez l'effet d'une communication directe avec le lecteur.
      - Écrivez comme si vous aviez une conversation.
      `,
      OBJECTIVE: dedent`
      Écrivez le texte en suivant ces instructions :

      - Présentez les informations de manière fondée et basée sur des faits.
      - Évitez les partis pris, en prenant en compte différents points de vue.
      - Analysez à la fois les forces et les faiblesses du sujet.
      - Faites une évaluation basée sur des critères clairs, plutôt que sur des préférences personnelles.
      - Effectuez une analyse comparative avec des analogues ou des normes.
      - Tirez des conclusions qui suivent logiquement des faits présentés. 
      - Maintenez un ton constructif.
      - Mettez l'accent sur les faits et les preuves, plutôt que sur les opinions
      `,
      DESCRIPTIVE: dedent`
      Écrivez le texte en suivant ces instructions :

      - Utilisez un langage vivant, figuratif et métaphorique.
      - Créez des descriptions chargées d'émotion.
      - Développez un style d'auteur individuel avec des caractéristiques reconnaissables.
      - Construisez le texte autour d'une intrigue ou d'un récit.
      - Appliquez divers procédés littéraires : épithètes, métaphores, comparaisons, personnifications.
      - Transmettez des expériences sensorielles à travers des descriptions de sons, d'odeurs, de couleurs, de textures.
      - Variez le rythme et la structure des phrases.
      - Concentrez-vous sur la fonction esthétique du texte pour susciter une réponse émotionnelle du lecteur.
      `,
      INSTRUCTIVE: dedent`
      Écrivez le texte en suivant ces instructions:

      - Construisez le texte dans une séquence claire d'actions ou d'étapes.
      - Utilisez le mode impératif des verbes.
      - Répétez intentionnellement les points clés pour une meilleure mémorisation.
      - Accompagnez les instructions d'explications lorsque cela est nécessaire.
      - Évitez les ambiguïtés et les formulations imprécises.
      - Structurez l'information en utilisant des numéros, des marqueurs ou des titres.
      - Indiquez les difficultés possibles et les moyens de les surmonter.
      - Utilisez un langage simple et clair.
      - Mettez en évidence le résultat de chaque étape.
      - Concluez le texte en indiquant le résultat final attendu.
      `,
      NARRATIVE: dedent`
      Écrivez le texte en suivant ces instructions:

      - Créez une structure narrative claire avec une chronologie des événements.
      - Faites des descriptions détaillées des lieux, des personnages et des situations.
      - Incluez des dialogues et des monologues intérieurs.
      - Créez une certaine atmosphère et un climat à travers des éléments descriptifs.
      - Développez les personnages, leur motivation et leurs conflits intérieurs.
      - Utilisez des procédés littéraires tels que la préfiguration et la retrospection.
      - Donnez au récit une couleur émotionnelle, éveillant l'empathie.
      - Appliquez des métaphores, des épithètes et d'autres tropes. Créez une voix auteuriale unique.
      - Étudiez l'immersion du lecteur dans le monde décrit.
      `
    },
    articleLinkStyle: {
      NONE: "N'incluez aucun lien ou mention de source dans le texte. Présentez l'information sans indiquer son origine.",

      DIRECT: dedent`
        IMPORTANT: Chaque affirmation significative doit avoir une référence à la source au format markdown [[<number/>]](<realUrl/>). Mais ne pas surcharger le texte avec trop de références sources.

        Nécessitent des références:
        - Statistiques et données quantitatives
        - Résultats de recherche
        - Avis d'experts
        - Faits non évidents
        - Citations

        Ne nécessitent pas de références:
        - Faits de connaissance commune
        - Observations personnelles (clairement marquées)
        - Conclusions logiques

        Règles:
        - Les références sont placées après le matériel cité
        - Utilisez des sources faisant autorité
        - N'utilisez pas le format (^[number])
        - N'utilisez pas de liens de substitution (comme example.com), utilisez de vrais liens sources
        - Ne surchargez pas le texte avec trop de références sources. N'écrivez pas de lien après chaque paragraphe.
        - Le nombre de références sources doit être inférieur à 20
        - Utilisez une numérotation séquentielle
      `,

      MENTION:
        'Indiquez les sources d\'information dans le texte (par exemple, "selon la recherche de l\'Université...", "comme le notent les experts..."), mais sans liens directs ni URLs.'
    },

    keywords: dedent`
      Optimisez votre réponse pour le SEO en utilisant les mots-clés fournis dans <keywords>:

      Instructions:
      - Traduisez les mots-clés dans la langue spécifiée
      - Modifiez les noms des chapitres et le titre de l'article pour l'optimiser pour les moteurs de recherche
      - Placez naturellement le mot-clé principal dans le premier paragraphe et incluez-le dans l'un des titres ## ou ###. Ajoutez-le au paragraphe de conclusion pour un impact SEO optimal
      - Utilisez 3-5 variations et mots-clés LSI (Indexation Sémantique Latente) tout au long du texte. Maintenez une densité de mots-clés entre 3-5% tout en gardant le texte naturel et engageant
      - Structurez l'article en utilisant le formatage markdown : ## pour les sections principales, ### pour les sous-sections. Utilisez des puces (*) et des listes numérotées lorsque c'est approprié pour améliorer la lisibilité
      - Créez un contenu informatif et bien organisé avec une progression claire du sujet. Chaque section doit naturellement incorporer des mots-clés tout en maintenant le flux et la lisibilité
      - Utilisez le formatage gras (**) et italique (*) pour mettre en évidence les points clés et les mots-clés secondaires où c'est pertinent. Divisez le texte en paragraphes digestes (3-4 phrases chacun)
      - Rappel : concentrez-vous sur la création d'un article formaté en markdown qui doit être à la fois convivial pour les lecteurs et optimisé pour les moteurs de recherche
    `,

    chapterByChapter:
      "La génération se fera étape par étape, avec un message pour chaque chapitre. Pour chaque chapitre, vous recevrez le nom du chapitre, le nombre de symboles du chapitre (chapterSymbolsCount) et le nombre total de symboles utilisés dans l'article entier. Le nom du chapitre est simplement le nom dans le plan structuré, que vous pouvez renommer selon le plan original.",

    chapter: dedent`
      Écrivez le prochain chapitre de l'article
      Instructions:
      - Suivez la structure exacte du plan.
      - Si le titre du chapitre contient les mots "(continue)" ou des indications similaires qu'il s'agit d'une continuation du chapitre précédent : continuez le chapitre précédent, n'ajoutez pas de sous-titre avec le titre du chapitre, ne précisez pas qu'il s'agit d'une continuation.
      - Traduisez le titre du chapitre dans la langue spécifiée.
      - N'écrivez pas de conclusion à la fin du chapitre
      - Utilisez <articleUsedSymbols> et <chapterSymbolsCount> pour maintenir la bonne longueur de réponse
      - Écrivez le chapitre sans commentaires supplémentaires, tags ni adresse à l'utilisateur
      Écrivez ce chapitre: 
    `,

    sourcesChapter: dedent`
      - S'il y a des références aux sources dans le texte, écrivez une section "Sources" qui contiendra une liste complète des sources utilisées dans le texte. Sinon, n'écrivez rien.
      - Ne dupliquez pas les sources si elles ont déjà été mentionnées plus tôt dans la liste.
      - Ne jamais inventer de sources. Incluez uniquement celles réellement mentionnées dans le texte et dont l'existence peut être vérifiée (par exemple, par URL ou citation spécifique).
      - Format de la liste des sources : 1. Nom I.O. (tous les auteurs de la source), "Titre de l'article/livre", Publication/Éditeur, Année, URL (supprimez les champs inutiles si non disponibles ; ne pas utiliser de marqueurs de place, ne pas écrire "continuer la liste" ou similaire).
      - Si le texte ne contient aucune référence aux sources, ne créez pas la section "Sources".
    `,

    wholeArticle: dedent`
      Rédigez un article complet en respectant toutes les exigences.
      Suivez la structure du plan exactement :
      - Utilisez toutes les sections et sous-sections dans l'ordre donné
      - Couvrez chaque point du plan en détail
      - Restez dans la limite du nombre de caractères spécifié
      - Traduisez le sujet et les noms des chapitres dans la langue française.
    `,

    generateChapter: dedent`
      Créez un nouveau chapitre pour poursuivre l'article existant, en suivant ces conditions :
      Style et ton : Maintenez le style et le ton original de l'article. Assurez une transition fluide depuis le contenu précédent.

      Structure :
      - Si l'article contient déjà une conclusion, continuez-la, n'ajoutez pas de nouveau chapitre.
      - S'il est impossible de poursuivre l'article (Il y a une conclusion entièrement terminée ou des listes de sources) sans briser sa logique narrative, répondez par un message vide.
      - Divisez le texte en paragraphes logiques
      - Utilisez des phrases de transition entre les paragraphes pour assurer la cohérence
      - Incluez 1-2 sous-titres dans le chapitre si nécessaire
      - Concluez le chapitre en résumant les idées principales et en suggérant le contenu de la partie suivante (si applicable)
      - Important :
      - - Fournissez uniquement le texte du nouveau chapitre, sans commentaires supplémentaires, tags.
      - - Ne vous adressez pas à l'utilisateur dans la réponse et n'expliquez pas votre réponse.
      - - Traduisez le titre du chapitre en français.
    `
  }
}

export const getGenerateArticlePrompt = (params: {
  generationMode: string
  subject: string
  plan: string
  creativity: number
  style: ValidArticleStyle
  customStyle: string
  linkStyle: ArticleLinkStyle
  language: string
  symbolsCount: number
  keywords: string
  sourceFile?: File
  sourceContent: string
}) => {
  const { language, actor, constraints, articleStyle, articleLinkStyle, generationMode } =
    articlePrompts[params.language] || articlePrompts.en

  const keywords = params.keywords ? `<keywords>${params.keywords}.</keywords>` : ''

  const selectedArticleStyle =
    params.style === ArticleStyle.CUSTOM ? `<example>${params.customStyle}</example>` : articleStyle[params.style]

  return dedent`${
    params.sourceContent
      ? dedent`
    <sourceContent>
    ${params.sourceContent}
    </sourceContent>
    `
      : ''
  }
    <articleStyle>${selectedArticleStyle}</articleStyle>
    ${actor}
    ${params.symbolsCount >= SYMBOLS_COUNT_LOW_LIMIT ? (articlePrompts[language] || articlePrompts.ru).chapterByChapter : ''}
    <generationMode>
    ${generationMode[params.generationMode] || params.generationMode}
    </generationMode>
    <subject>${params.subject}</subject>
    <plan>
    ${params.plan}
    </plan>
    <articleLinkStyle>${params.linkStyle}: ${articleLinkStyle[params.linkStyle]}</articleLinkStyle>
    <symbolsCount>
      <min>${params.symbolsCount}</min>
      <max>${params.symbolsCount * 2}</max>
    </symbolsCount>
    <wordsCount>
      <min>${Math.round(params.symbolsCount / 6)}</min>
      <max>${Math.round(params.symbolsCount / 3)}</max>
    </wordsCount>
    <language>
      ${language}
    </language>
    <constraints>${constraints}</constraints>
    ${params.keywords ? `<keywordsPrompt>${(articlePrompts[language] || articlePrompts.ru).keywords}</keywordsPrompt>` : ''}${keywords}
  `
}

export const getGenerateArticleChapterPrompt = ({
  language,
  chapter,
  generatedContent,
  symbolsCount,
  linkStyle,
  keywords
}: {
  language: string
  chapter: ArticleStructuredChapter
  generatedContent: string
  symbolsCount: number
  linkStyle: ArticleLinkStyle
  keywords: string
}): string => {
  const localizedPrompts = articlePrompts[language] || articlePrompts.ru

  if (symbolsCount < SYMBOLS_COUNT_LOW_LIMIT) {
    const prompt = localizedPrompts.wholeArticle

    return dedent`
      ${prompt}
      <constraints>
      ${
        linkStyle === ArticleLinkStyle.DIRECT && enableSources
          ? `<sourcesChapter>${localizedPrompts.sourcesChapter}</sourcesChapter>\n`
          : ''
      }<outputFormat>Markdown</outputFormat>
      </constraints>
    `
  }

  const prompt = localizedPrompts.chapter

  return dedent`
    ${generatedContent.trim().length > 0 ? `<article>${generatedContent}</article>\n\n` : ''}
    ${prompt} <chapter>${chapter.chapter}</chapter>

    <constraints>
    <articleLinkStyle>
    ${localizedPrompts.articleLinkStyle[linkStyle]}
    </articleLinkStyle>
    ${chapter.type === 'sources' && enableSources ? `<sourcesChapter>${localizedPrompts.sourcesChapter}</sourcesChapter>\n` : ''}<articleUsedSymbols>
      ${generatedContent.length}
    </articleUsedSymbols>
    <chapterSymbolsCount>
      <symbolsCount>${chapter.type === 'general' ? chapter.symbolsCount : 'unlimited'}</symbolsCount>
      <wordsCount>${chapter.type === 'general' ? Math.round(chapter.symbolsCount / 6) : 'unlimited'}</wordsCount>
    </chapterSymbolsCount>
    ${keywords ? `<keywords>${keywords}</keywords>` : ''}
    <language>${localizedPrompts.language}</language>
    <outputFormat>Markdown</outputFormat>
    </constraints>
  `
}
