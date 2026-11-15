# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies first for Docker cache optimization
COPY package*.json ./
RUN npm install --production

# Copy application source code
COPY . .

# Expose backend port
EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "server.js"]
