FROM node:19-alpine3.16
WORKDIR /worksaces/shlokas/auth
COPY . .
RUN npm install
CMD [ "npm", "run", "start" ]