FROM node:19-alpine3.16
LABEL org.opencontainers.image.description "Authentication server for Shlokas."
ARG AUTH_VERSION=dev

WORKDIR /app/shlokas-auth
COPY . .
RUN npm install
RUN echo "VERSION=${AUTH_VERSION}" > .container/meta

CMD [ "npm", "run", "start" ]
