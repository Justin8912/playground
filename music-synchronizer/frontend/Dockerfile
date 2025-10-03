FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY web-dev-server.config.js ./
COPY web-test-runner.config.js ./
COPY index.html ./
COPY rollup.config.js ./
COPY favicon.png ./

RUN npm ci

COPY src/ ./src/
COPY dev/ ./dev/

RUN npm run build:all

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 8000

ENV NODE_ENV=production

CMD ["npm", "run", "start"]
