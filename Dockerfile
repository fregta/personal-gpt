# Use Node.js LTS (Light) as base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build the application
RUN npm run build

# Install a lightweight server
RUN npm install -g serve

# Expose port
EXPOSE 42069

# Start command
CMD ["serve", "-s", "dist", "-p", "42069"]
