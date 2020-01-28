FROM node:13-buster-slim

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

ARG PORT=3000
ENV PORT $PORT

ENV EMAIL_PASSWORD $EMAIL_PASSWORD

RUN echo ${EMAIL_PASSWORD}

EXPOSE $PORT

WORKDIR /opt/ledger-server
COPY package*.json ./
RUN npm install --no-optional
ENV PATH /opt/ledger-server/node_modules/.bin:$PATH

HEALTHCHECK --interval=30s CMD node healthcheck.js

WORKDIR /opt/ledger-server/app
COPY . .

CMD ["npm", "start"]
