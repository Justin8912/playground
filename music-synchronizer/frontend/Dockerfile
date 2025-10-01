# Use Node.js 20 LTS as the base image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY web-dev-server.config.js ./
COPY web-test-runner.config.js ./
COPY index.html ./
COPY rollup.config.js ./

# Install dependencies
RUN npm ci

# Copy source code and configuration files
COPY src/ ./src/
COPY dev/ ./dev/

# Build the application
RUN npm run build:all

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of the app directory to the nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose the port that Web Dev Server runs on (default 8000)
EXPOSE 8000

# Set environment variables
ENV NODE_ENV=production

# Start the application using Web Dev Server
CMD ["npm", "run", "start"]
