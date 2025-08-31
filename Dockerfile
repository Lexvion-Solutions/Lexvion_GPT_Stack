FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy application files
COPY package.json package-lock.json* ./
COPY . .

# Install production dependencies only
RUN npm ci --omit=dev

# Expose the port defined by the platform
ENV PORT=${PORT:-3000}
EXPOSE $PORT

# Start the application
CMD ["npm", "start"]