FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN rm -rf node_modules package-lock.json && npm install --no-optional

COPY . .

EXPOSE 5000

CMD ["node", "src/server.js"]