# Архитектура проекта

**Кратко про нашу архитектуру:**
*Гексагональная архитектура, также известная как портово-адаптерная архитектура. Основная идея этой архитектуры
заключается в разделении приложения на ядро (сущность или домен) и внешние компоненты (порты и адаптеры).*

**Основные особенности гексагональной архитектуры:**
> - Ядро (Домен):
    Содержит основную бизнес-логику и правила приложения.
    Независимо от внешних систем и инфраструктуры. Получает доступ к слою адаптеров через параметры, может напрямую
    импортировать небольшие утилитные функции. В идеале не импортирует внешние зависимости и интерфейсы
> - Порты:
    Интерфейсы, через которые ядро взаимодействует с внешними системами.
    Служат для определения точек взаимодействия между ядром и внешним миром.
> - Адаптеры:
    Реализуют порты и обеспечивают интеграцию с конкретными внешними системами, такими как базы данных, пользовательские
    интерфейсы или внешние API.
    Могут быть входными (принимают данные от внешних источников) или выходными (отправляют данные во внешние системы).

**Плюсы гексагональной архитектуры:**
> - Изоляция бизнес-логики:
    Бизнес-логика изолирована от технических деталей, что упрощает тестирование и поддержку.
> - Гибкость и расширяемость:
    Легко добавлять или изменять адаптеры без влияния на основную логику.
    Поддержка различных интерфейсов и способов взаимодействия с приложением.
> - Простота тестирования:
    Упрощает юнит-тестирование благодаря изоляции бизнес-логики от внешних зависимостей.
> - Четкое разделение ответственности:
    Четкое разделение между бизнес-логикой и технической реализацией улучшает понимание и поддержку кода.
> - Легкость интеграции:
    Упрощает интеграцию с другими системами и позволяет легко заменять внешние компоненты.

---

## 1. Структура файлов и папок

```
./
├─ .hysky/               # Git-хуки: выполняют команды (lint, tests) перед коммитом
├─ .idea/                # Настройки IDE JetBrains
├─ .vscode/              # Настройки VS Code
├─ ci/                   # CI/CD-пайплайны (YAML для GitLab/GitHub)
├─ ci_scripts/           # Скрипты миграций и утилиты для CI
├─ config/               # Примеры конфигов и реальные (конфиденциальная информация): НЕ КОМИТИТЬ
├─ db/                   # Скрипты миграций и seed (prod/dev)
├─ dockerfiles/          # Dockerfile’ы для разных сервисов
├─ docker-compose.yml    # Оркестрация контейнеров
├─ .dockerignore         # Исключения для Docker-образов
├─ email-templates/      # Шаблоны писем (HTML/Markdown)
├─ geolocations/         # GeoIP-данные для определения страны по IP
├─ logs/                 # Логи по датам
├─ node_modules/         # Установленные зависимости
├─ pg_data/              # Том PostgreSQL для контейнера
├─ prisma/               # Prisma schema (энюмы, сущности, связи)
├─ redis.conf            # Конфигурация Redis
├─ redisdata/            # Бинарный дамп Redis для восстановления
├─ src/                  # Основной код приложения
│   ├─ adapter/          # реализация выходного порта
│   │   ├─ repository/   # Репозитории реализуют доступ к данным PostgreSQL через Prisma не содержат бизнес логику
│   │   └─ gateway/      # Реализация внешних зависимостей, управляемых нашим приложением
│   │  
│   ├─ config/           # Валидация config.yml с помощью Zod
│   │ 
│   ├─ delivery/         # HTTP-сервер (Express), события, маршруты и handlers
│   │   ├─ cron/         # Обработчики плановых задач, вызывают usecase или сервисы из domain
│   │   ├─ http/
│   │   │   ├─ server/   # Создание и конфигурация HTTP сервера
│   │   │   └─ v2/
│   │   │       ├─ errors/       # Наши кастомные типы ошибок
│   │   │       ├─ router/       # Подключение маршрутов
│   │   │       ├─ middlewares/  # Логирование, CORS, body-parsing и тп
│   │   │       ├─ handlers/     # Входные контроллеры, принимают запрос, валидирует данные и вызывает нужный useCase
│   │   │       └─ swager/       # Основные настройки свагера (api предоставленная в удобном виде)
│   │   │       
│   │   └─ queue/        # Очереди(сейчас используется для отправки писем по софт лимитам)
│   │   
│   ├─ domain/           # Бизнес-логика
│   │   ├─ entity/       # DTO и сущности домена
│   │   ├─ errors/       # Ошибки используемые в домене
│   │   ├─ service/      # Бизнес-функции,которые можно переиспользовать в нескольких useCase
│   │   └─ usecase/      # Входной порт, бизнес-логика, описывающая конкретный сценарий использования системы
│   │  
│   ├─ lib/            # Вспомогательные модули и клиенты
│   │   ├─ clients/      # Вспомогательные библиотеки, обёртки над внешними API
│   │   ├─ cryptoUtil/   # Шифрование, хэширование
│   │   ├─ jwt/          # JWT-токены
│   │   ├─ logger/       # Логирование
│   │   ├─ tokenizer/    # Токенизация текста
│   │   └─ utils/        # Общие утилиты
│   │   
│   ├─ queues/          # очередь (Bull/Redis)
│   ├─ shared/          # Константы, энумы и общий код
│   ├─ app.ts           # Точка входа: инициализация всех модулей
│   ├─ index.d.ts       # Расширение глобальных типов
│   └─ types.ts         # Общие TypeScript-типы
│  
├─ test/                 # Тесты (Jest) и тестовые данные
├─ .env                  # Секреты (конфиденциальная информация): НЕ КОМИТИТЬ
├─ .gitignore            # Исключения для Git
├─ .gitlab-ci.yml        # Пайплайны GitLab CI
├─ commitlint.config.ts  # Правила для сообщений коммитов
├─ eslint.config.js      # Настройки ESLint
├─ jest.config.js        # Настройки Jest
├─ Makefile              # Автоматизация команд
├─ package.json          # Скрипты и зависимости
├─ postBuild.sh          # Шаги после сборки
├─ README.md             # Инструкции по запуску
├─ tsconfig.json         # Настройки TypeScript
├─ tsconfig.eslint.json  # Настройки ESLint для TS
└─ bun.lock              # Lock-файл Bun
```

___

## 2. Сущности

Доменные сущности, описанные в `prisma/schema.prisma` с коротким описанием их назначения, основными полями и ключевыми
связями:

- **User**
    - **Описание**: представляет зарегистрированного/анонимного пользователя и хранит его учетные данные.
    - **Поля**: `id`, `email`, `name`, `password`,  `created_at`, `role`.
    - **Связи**: `employees`, `transactions`, `subscription`, `messages`, `chats`, `actions`.

- **Enterprise**
    - **Описание**: организация, объединяющая пользователей и их ресурсы, создается юзером с планом ELITE или админом.
    - **Поля**: `id`, `name`, `type`, `createdAt`.
    - **Связи**: `subscription`, `employees`, `transactions`, `actions`.

- **Plan**
    - **Описание**: тарифный план с набором ограничений и возможностей.
    - **Поля**: `id`, `type`, `price`, `currency`, `tokens`.
    - **Связи**: `subscriptions`, `transactions`, `planModels`.

- **Subscription**
    - **Описание**: подписка пользователя или организации на конкретный тарифный план.
    - **Поля**: `id`, `plan_id`, `user_id`, `enterprise_id`, `balance`, `hard_limit`, `soft_limit`,`system_limit`,
      `created_at`.
    - **Связи**: `plan`, `user`.

- **PlanModel**
    - **Описание**: связь тарифного плана с моделью и параметры её использования.
    - **Поля**: `id`, `plan_id`, `model_id`, `is_default_model`, `created_at`, `deleted_at`.
    - **Связи**: `plan`, `model`.

- **ReferralTemplate**
    - **Описание**: шаблон письма для реферальных приглашений.
    - **Поля**: `id`, `name`, `currency`, `tokens`, `plan_id`.
    - **Связи**: `plan`, `referal`, `transactions`.

- **Transaction**
    - **Описание**: записи об изменении балансов, приобретение планов, пополнения и траты капсов.
    - **Поля**: `id`, `provider`, `amount`, `currency`, `status`, `type`, `plan_id`, `user_id`, `from_user_id`,
      `referal_id`, `created_at`, `enterprise_id`, `deleted`.
        - **Связи**: `user`, `message`, `enterprise`, `action`.

- **PresetCategory**
    - **Описание**: категория для группировки шаблонов генерации.
    - **Поля**: `id`, `code`, `name`, `locale`, `created_at`.
    - **Связи**: `presets`.

- **Preset**
    - **Описание**: пользовательский шаблон запроса к LLM или API.
    - **Поля**: `id`, `name`, `description`, `model_id`, `usage_count`, `author`, `created_at`.
    - **Связи**: `model`, `user`, `presetCategory`.

- **PresetAttachment**
    - **Описание**: вложения (файлы) к шаблонам Preset.
    - **Поля**: `id`, `preset_id`, `file_id`, `is_nsfw`, `created_at`.
    - **Связи**: `preset`, `file`.

- **ModelAccount**
    - **Описание**: учетные данные и квоты для внешних моделей (OpenAI, Midjourney и др.).
    - **Поля**: `id`, `name`, `status`, `наши текущие модели`, `disabled`, `created_at`.
    - **Связи**: `modelAccountQueue`, `ModelAccountModel`.

- **Chat**
    - **Описание**: сессия взаимодействия пользователя с ботом или LLM.
    - **Поля**: `id`, `name`, `group_id`, `model_id`, `created_at`, `user_id`, `platform`, `total_caps`, `deleted`.
    - **Связи**: `group`, `model`, `chatSetings`, `message`, `user`.

- **Message**
    - **Описание**: отдельное сообщение в чате или системе уведомлений.
    - **Поля**: `id`, `role`, `status`, `model_id`, `content`, `chat_id`, `user_id`, `tokens`, `created_at`,
      `transaction_id`, `platform`.
    - **Связи**: `video`, `model`, `user`, `transaction`, `images`, `buttons`, `voices`, `videos`.

- **MessageButton**
    - **Описание**: интерактивная кнопка в сообщении.
    - **Поля**: `id`, `type`, `action`, `message_id`, `crated_at`.
    - **Связи**: `message`.

- **MessageImage**, **Voice**, **Video**
    - **Описание**: медиа-вложения (картинки, голосовые, видео) к сообщениям.
    - **Поля**:
        - **MessageImage**: `id`, `status`, `message_id`, `url`, `created_at`.
        - **Voice**: `id`, `content`, `file_id`.
        - **Video**: `id`, `content`, `file_id`.
    - **Связи**: все связаны с `message`.

- **File**
    - **Описание**: абстракция файловой системы для хранения загруженных данных.
    - **Поля**: `id`, `type`, `name`, `url`, `path`, `size`, `created_at`.
    - **Связи**: `messageImage`, `voice`, `video`, `model`.

- **ExcelProcessingTask**
    - **Описание**: фоновые задания по обработке Excel-файлов.
    - **Поля**: `id`, `user_id`, `description`, `chat_id`, `created_at`, `message_id`.
    - **Связи**: `chat`, `message`.

- **PaymentMethod**
    - **Описание**: способ оплаты пользователя (карта, крипта и т.п.).
    - **Поля**: `id`, `provider`, `user_id`, `created_at`.
    - **Связи**: `user`.

- **Action**
    - **Описание**: пользовательские действия системы для аудита и логирования.
    - **Поля**: `id`, `type`, `platform`, `model_id`, `user_id`, `enterprise_id`, `transaction_id`.
    - **Связи**: `user`, `enterprise`, `transaction`.

- **Strike**
    - **Описание**: предупреждения или санкции, наложенные на пользователя.
    - **Поля**: `id`, `user_id`, `message_id`, `content`, `reasson`.
    - **Связи**: `user`, `message`.

- **MidjourneyDiscordAccount**
    - **Описание**: привязка Discord-аккаунта пользователя для Midjourney.
    - **Поля**: `id`, `name`, `token`, `chanel_id`, `server_id`, `status`, `created_at`.

- **VerificationCode**
    - **Описание**: коды подтверждения для операций (смена почты, сброс пароля).
    - **Поля**: `id`, `code`, `user_id`, `expires_at`.
    - **Связи**: `user`.

- **Article**
    - **Описание**: статьи генерируемые easyWriter, настройки генерации и контент.
    - **Поля**: `id`, `user_id`, `model_id`, `language`, `content`, `chat_id`, `created_at`.
    - **Связи**: `user`, `model`, `chat`.

- **OldEmail**
    - **Описание**: история изменений email пользователя.
    - **Поля**: `id`, `email`, `user_id`, `created_at`.
    - **Связи**: `user`.

- **Report**
    - **Описание**: жалобы на сообщения.
    - **Поля**: `id`, `user_id`, `description`, `chat_id`, `created_at`, `message_id`.
    - **Связи**: `chat`, `message`.

---

## 3. Общие правила проекта

1. **Разделение слоёв**
    - `src/delivery` — этот слой инициирует взаимодействие с системой.
        - *handlers — HTTP-контроллеры, роуты*
        - *cron — задачи по расписанию*
        - *queue — очереди/воркеры*
    - `src/domain` — бизнес-логика: useCases, services, entities
        - *usecase — основной бизнес-код: что делает система*
        - *service — переиспользуемая бизнес-логика (вспомогательные бизнес-функции)*
    - `src/adapter` — выходные адаптеры: gateway, repository
        - *gateway — обёртки над внешними API, криптографией, Redis и т.п.*
        - *repository — специализированный adapter для доступа к данным*
            - *не содержит бизнес-логики — только доступ к данным (fetch, save, update и т.д.)*
            - *используется в useCase для получения и сохранения сущностей.*
    - `src/lib` — утилиты, клиенты, общие зависимости
        - *clients — клиенты сторонних библиотек (redis, prisma, axios, и т.п.)*
        - *utils — переиспользуемые функции*
        - *logger, jwt, cryptoUtil — утилиты*

2. **Именование**
    - Файлы/папки: **kebab-case**.
    - Код (переменные, функции): **camelCase**.
    - Поля БД: **snake_case**.

3. **Секреты и конфиденциальность**
    - Файлы `.env` и `config.yml` с секретами не коммитим.

4. **Коммиты и форматирование**
    - перед созданием коммита прогнать линтер и претир, убрать лишние комментарии, консольлоги и прочее
    - описание коммита должно начинаться на одно из разрешенных слов(feat: , fix: , refactor: , и прочие) после
      двоеточие пробел и краткое описание изменений

5. **Создание нового функционала**
    - **в проекте активно используется паттерн *Фабрика***
        - при создании нового хендлера, юзкейса, репозитория, клиента, сервиса или gateway пишется функция фабрика, которая возвращает методы
    - **handler создается в src/delivery/http/v2/handlers/"папка с названием домена"**
        - в папке index.ts реализуется фабрика собирающая методы
        - роуты реализуются каждый в своем файле, посредством паттерна фабрика
        - после создания роута желательно добавить правила и документацию для свагера
        - обращаться из хендлера можно к адаптерам и юзкейсам через DeliveryParams
    - **usecase создается в src/domain/usecase/"папка с названием домена"**
        - в папке index.ts реализуется фабрика собирающая методы 
        - юзкейсы реализуются каждый в своем файле, посредством паттерна фабрика
        - обращаться из юзкейса можно к адаптерам и сервисам через UseCaseParams
    - **service создается в src/domain/service/"папка с названием сервиса"**
        - в папке index.ts реализуется фабрика собирающая методы
        - методы сервиса реализуются каждый в своем файле, посредством паттерна фабрика
        - обращаться из сервиса можно к адаптерам и другим сервисам
    - **gateway создается в src/adapter/gateway/"папка с названием gateway"**
        - в папке index.ts реализуется фабрика собирающая методы
        - методы gateway реализуются каждый в своем файле, посредством паттерна фабрика
        - обращаться из gateway можно к клиентам через AdapterParams
    - **repository создается в src/adapter/repository/"папка с названием репозитория"**
        - в папке index.ts реализуется фабрика собирающая методы
        - методы репозитория реализуются каждый в своем файле, посредством паттерна фабрика
        - обращаться из репозитория можно к клиентам и базе данных через AdapterParams
    - **clients создается в src/lib/clients/"папка с названием клиента"**
        - в папке index.ts реализуется фабрика собирающая методы
        - методы клиента реализуются каждый в своем файле, посредством паттерна фабрика
        - обращаться из клиента можно к сторонним апи
    - **при создании новой сущности в базе данных**
        - нужно создать ее entity в src/domain/entity, и добавить ее в схему призмы в prisma/schema.prisma
        - обновить схему призмы с помощью команды
          ```sh
          bun prisma db push 
          ```
        - реализовать ее репозиторий
    - **при изменении полей сущности**
        - обновить схему призмы с помощью команды
          ```sh
          bun prisma db push 
          ```
        - необходимо реализовать данные изменения на всех уровнях, на которых они могли отразиться
