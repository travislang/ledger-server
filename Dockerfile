FROM node:13-buster-slim

EXPOSE 3000

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

WORKDIR /opt/ledger-server
COPY package*.json ./
RUN npm install --no-optional
ENV PATH /opt/ledger-server/node_modules/.bin:$PATH

HEALTHCHECK --interval=30s CMD node healthcheck.js

WORKDIR /opt/ledger-server/app
COPY . .

CMD ["npm", "docker:start"]
