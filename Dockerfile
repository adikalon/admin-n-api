ARG tag

FROM node:$tag AS development
ARG uid
ARG gid
RUN \
  apk add --no-cache shadow \
  && usermod -u $uid node \
  && groupmod -g $gid node \
  && mkdir -p /home/node/app \
  && chown -R node:node /home/node/app \
  && mkdir -p /home/node/app/.adminbro \
  && chown -R node:node /home/node/app/.adminbro
WORKDIR /home/node/app
USER node
COPY --chown=node:node package*.json ./
RUN npm install
COPY --chown=node:node . .
RUN npm run build

FROM node:$tag AS debug
ARG uid
ARG gid
RUN \
  apk add --no-cache shadow \
  && usermod -u $uid node \
  && groupmod -g $gid node \
  && mkdir -p /home/node/app \
  && chown -R node:node /home/node/app \
  && mkdir -p /home/node/app/.adminbro \
  && chown -R node:node /home/node/app/.adminbro
WORKDIR /home/node/app
USER node
COPY --chown=node:node package*.json ./
RUN npm install
COPY --chown=node:node --from=development /home/node/app .

FROM node:$tag AS production
ARG uid
ARG gid
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
RUN \
  apk add --no-cache shadow \
  && usermod -u $uid node \
  && groupmod -g $gid node \
  && mkdir -p /home/node/app \
  && chown -R node:node /home/node/app \
  && mkdir -p /home/node/app/.adminbro \
  && chown -R node:node /home/node/app/.adminbro
WORKDIR /home/node/app
USER node
COPY --chown=node:node package*.json ./
RUN npm install --only=production
COPY --chown=node:node . .
COPY --chown=node:node --from=development /home/node/app/dist ./dist
