FROM node:20-alpine

WORKDIR /workspace

# Copy dependency mappings
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code files
COPY . .

EXPOSE 5173

# Vite requires hosting interface flags to listen from docker container interfaces
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
