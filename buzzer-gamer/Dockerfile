FROM node:20-alpine

WORKDIR /app

ARG VITE_APP_HOST
ENV VITE_APP_HOST=$VITE_APP_HOST

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["node", "src/server/index.js"]
