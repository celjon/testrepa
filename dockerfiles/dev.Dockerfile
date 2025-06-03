FROM node:22.14.0

WORKDIR /app
RUN npm -g install bun
COPY package*.json ./
COPY bun.lock ./

RUN bun install --verbose

COPY prisma ./prisma/

RUN npx prisma generate

COPY . ./

CMD [ "bun", "run" , "start:dev" ]

