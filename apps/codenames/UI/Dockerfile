FROM node:20-alpine

ARG SSL_KEY_PATH=""
ARG SSL_CERT_PATH=""
ARG PORT=""

WORKDIR /app 
COPY . .

RUN npm install
RUN npm run build

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000
ENV NODE_ENV=production

CMD ["npm", "run", "serve"]