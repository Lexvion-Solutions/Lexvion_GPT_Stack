FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy manifest and install production deps
COPY package*.json ./
RUN npm install --omit=dev

# Copy application files
COPY . .

# Expose the port defined by the platform
ENV PORT=${PORT:-3000}
EXPOSE $PORT

# Start the application
CMD ["npm", "start"]
