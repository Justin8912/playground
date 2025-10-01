# Use Node.js 20 LTS as the base image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including devDependencies since tsx is needed for runtime)
RUN npm ci

# Copy the source code
COPY src/ ./src/

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of the app directory to the nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose the port that the app runs on
EXPOSE 60000

# Set default environment variables (non-secrets only)
ENV NODE_ENV=production
ENV PORT=60000

# Note: Secret environment variables should be passed at runtime, not built into the image
# Example: docker run -e DATABASE_URL=secret -e API_KEY=secret music-synchronizer-backend

# Start the application using tsx
CMD ["npx", "tsx", "src/handler.ts"]
