# build stage
FROM node:16.13.1-alpine as build-stage
WORKDIR /app

## COPY package*.json ./
## COPY quasar.conf.js ./
COPY ./ ./

## RUN npm install && npm install --only=dev
RUN npm install
## RUN npm install -g @vue/cli
## RUN npm install -g @quasar/cli
RUN ls /app/src/i18n/de
RUN ls /app/src/i18n
RUN npm run build

# production stage
FROM nginx:1.20.2-alpine as production-stage
COPY --from=build-stage /app/dist/spa /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
