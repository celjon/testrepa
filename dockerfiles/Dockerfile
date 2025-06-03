FROM node:22.14.0 AS builder

WORKDIR /builder

COPY package*.json ./
COPY bun.lock ./
COPY prisma ./prisma/

RUN npm -g install bun && \
    bun install --verbose --production && \
    bunx prisma generate && \
    bunx prisma migrate

COPY . ./
RUN bun run build:prod

FROM jrottenberg/ffmpeg:7.0-scratch AS ffmpeg

FROM node:22.14.0 AS runner

WORKDIR /app

COPY --from=builder /builder/node_modules ./node_modules
COPY --from=builder /builder/build ./build
COPY --from=builder /builder/config ./config
COPY --from=builder /builder/test ./test
COPY --from=builder /builder/email-templates ./email-templates
COPY --from=builder /builder/geolocations ./geolocations

COPY --from=ffmpeg /bin/ffmpeg /bin/ffprobe /usr/local/bin/
COPY --from=ffmpeg /lib /lib
COPY --from=ffmpeg /share /share

# RUN apt-get update && \
#     apt-get install -y python3-pip && \
#     rm -rf /var/lib/apt/lists/* && \
#     node ./build/src/lib/clients/clusterizer/utils/installDeps.js

ENV NODE_ENV=production
ENV NODE_OPTIONS=--max-old-space-size=6144

CMD [ "node", "build/src/app.js" ]
