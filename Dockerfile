FROM node:14-alpine

RUN npm install pm2 -g

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY ./package.json ./yarn.lock ./

RUN yarn install --pure-lockfile

COPY . /usr/src/app

CMD ["pm2-runtime", "src/index.js"]
