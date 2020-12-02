FROM node:15.3.0-alpine AS development
WORKDIR /usr/src/app
COPY package*.json ./
RUN \
  apk --update add curl bash nano tzdata && \
  cp -r /usr/share/zoneinfo/${TZ} /etc/localtime && \
  echo "${TZ}" > /etc/timezone && \
  apk del tzdata && \
  rm -r /var/cache/apk/* && \
  mkdir -p /usr/share/zoneinfo/Europe && \
  ln -s /etc/localtime /usr/share/zoneinfo/${TZ} && \
  npm install --only=development
COPY . .

FROM node:15.3.0-alpine AS debug
WORKDIR /usr/src/app
COPY package*.json ./
RUN \
  apk --update add curl bash nano tzdata && \
  cp -r /usr/share/zoneinfo/${TZ} /etc/localtime && \
  echo "${TZ}" > /etc/timezone && \
  apk del tzdata && \
  rm -r /var/cache/apk/* && \
  mkdir -p /usr/share/zoneinfo/Europe && \
  ln -s /etc/localtime /usr/share/zoneinfo/${TZ} && \
  npm install --only=development
COPY . .

FROM node:15.3.0-alpine AS production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/app
COPY package*.json ./
RUN \
  apk --update add curl bash nano tzdata && \
  cp -r /usr/share/zoneinfo/${TZ} /etc/localtime && \
  echo "${TZ}" > /etc/timezone && \
  apk del tzdata && \
  rm -r /var/cache/apk/* && \
  mkdir -p /usr/share/zoneinfo/Europe && \
  ln -s /etc/localtime /usr/share/zoneinfo/${TZ} && \
  npm install --only=production
COPY . .
COPY --from=development /usr/src/app/dist ./dist
CMD ["node", "dist/main"]
