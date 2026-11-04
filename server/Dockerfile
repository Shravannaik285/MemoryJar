# Memory Jar Notification Backend Dockerfile
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000
ENV DATA_DIR=/app/data

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Create durable data volume directory
RUN mkdir -p /app/data && chown -R node:node /app

# Use non-root node user for container security
USER node

# Expose HTTP port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start the Node.js server with persistent node-cron scheduler
CMD ["node", "server.js"]
