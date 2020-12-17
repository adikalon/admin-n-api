ARG tag

FROM node:$tag AS development
WORKDIR /home/node/app
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
RUN npm run build

FROM node:$tag AS debug
WORKDIR /home/node/app
RUN \
  apk --update add curl bash nano tzdata && \
  cp -r /usr/share/zoneinfo/${TZ} /etc/localtime && \
  echo "${TZ}" > /etc/timezone && \
  apk del tzdata && \
  rm -r /var/cache/apk/* && \
  mkdir -p /usr/share/zoneinfo/Europe && \
  ln -s /etc/localtime /usr/share/zoneinfo/${TZ} && \
  npm install --only=development
COPY --from=development /home/node/app .

FROM node:$tag AS production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /home/node/app
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
COPY --from=development /home/node/app/dist ./dist
