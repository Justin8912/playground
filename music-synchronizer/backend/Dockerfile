# Use Node.js 20 LTS as the base image
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci

COPY src/ ./src/

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 60000

ENV NODE_ENV=production
ENV PORT=60000

CMD ["npx", "tsx", "src/handler.ts"]
