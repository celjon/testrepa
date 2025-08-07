FROM node:22.14.0

WORKDIR /app

COPY package*.json ./
COPY bun.lock ./
COPY prisma ./prisma/
COPY src/config ./src/config
COPY src/lib ./src/lib
COPY src/adapter ./src/adapter
COPY ci_scripts ./ci_scripts
COPY tsconfig.json ./tsconfig.json

RUN npm -g install bun tsx && \
    bun add -D prisma && \
    bun add @prisma/client && \
    bunx prisma generate

CMD ["./ci_scripts/run_scripts.sh"]
