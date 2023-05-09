FROM node:19-alpine3.16
LABEL org.opencontainers.image.description "Authentication server for Shlokas."

# ---------------------------------------------------------------------------- #
#                                   Arguments                                  #
# ---------------------------------------------------------------------------- #

# Service version (default: dev)
ARG AUTH_VERSION=dev

# Github token for private repos (required)
ARG GITHUB_TOKEN


# ---------------------------------------------------------------------------- #
#                                     Build                                    #
# ---------------------------------------------------------------------------- #

WORKDIR /app/shlokas-auth
COPY . .
RUN npm install
RUN echo "VERSION=${AUTH_VERSION}" > .container/meta


# ---------------------------------------------------------------------------- #
#                                      Run                                     #
# ---------------------------------------------------------------------------- #

CMD [ "npm", "run", "start" ]
