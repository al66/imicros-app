# develop stage
FROM node:16.13-alpine as develop-stage
WORKDIR /app
COPY package*.json ./
RUN yarn global add @quasar/cli
COPY . .

# build stage
FROM develop-stage as build-stage
RUN npm install && npm install --only=dev
## RUN yarn
RUN quasar inspect
RUN quasar build

# production stage
FROM nginx:1.20.2-alpine as production-stage
COPY --from=build-stage /app/dist/spa /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
