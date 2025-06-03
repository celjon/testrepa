FROM node:22.14.0

WORKDIR /app

RUN npm -g install bun

COPY package*.json ./
COPY bun.lock ./

RUN bun add -D prisma
RUN bun add @prisma/client

COPY prisma ./prisma/

RUN bunx prisma generate

COPY db ./db
COPY config ./config
COPY src/config ./src/config
COPY tsconfig.json ./tsconfig.json

CMD ["./db/migrate.sh"]

