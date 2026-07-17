FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev && ls node_modules | head -5

COPY server.js ./
COPY migrations/ ./migrations/

EXPOSE 3000

CMD ["node", "/app/server.js"]
