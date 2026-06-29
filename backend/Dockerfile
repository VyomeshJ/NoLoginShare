FROM node:20

WORKDIR /app
ENV NODE_OPTIONS=--dns-result-order=ipv4first

COPY package*.json ./

RUN apt-get update \
  && apt-get install -y python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

RUN npm config set fetch-retries 5 \
  && npm config set fetch-retry-mintimeout 20000 \
  && npm config set fetch-retry-maxtimeout 120000 \
  && npm ci --build-from-source=sqlite3

COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
