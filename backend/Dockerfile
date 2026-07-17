FROM node:20-alpine

WORKDIR /app

COPY package.json ./

RUN npm install --omit=dev

COPY server.js ./
COPY routes/ ./routes/
COPY lib/ ./lib/
COPY migrations/ ./migrations/

EXPOSE 3000

CMD ["node", "/app/server.js"]
