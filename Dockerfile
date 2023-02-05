FROM node:19-alpine3.16
WORKDIR /worksaces/shlokas/backend
COPY . .
RUN npm install
CMD [ "npm", "run", "start" ]