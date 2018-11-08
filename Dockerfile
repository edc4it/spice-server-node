FROM node:8.12-jessie

WORKDIR /usr/src/app

COPY package*.json ./
COPY *.lock ./
RUN yarn install

COPY . .

EXPOSE 5000

CMD ["yarn", "start" ]