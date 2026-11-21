FROM node:20-alpine
WORKDIR /app

# Security best practice: non-root user
RUN addgroup -S app && adduser -S app -G app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy app code
COPY --chown=app:app . .

USER app
EXPOSE 3000
CMD ["node", "server.js"]
