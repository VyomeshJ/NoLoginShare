FROM node:20

WORKDIR /app
ENV NODE_OPTIONS=--dns-result-order=ipv4first

COPY package*.json ./

RUN npm config set fetch-retries 5 \
  && npm config set fetch-retry-mintimeout 20000 \
  && npm config set fetch-retry-maxtimeout 120000 \
  && npm ci

COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
