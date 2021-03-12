FROM node:14-alpine
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
COPY src ./src
COPY test ./test
COPY .en* ./
EXPOSE 4000

COPY tsconfig.json ./
COPY tsconfig.build.json ./
RUN npm run build
RUN apk add --no-cache bash

# SK: Using node instead of npm script to support graceful shutdown
CMD ["npm", "start"]


