# develop stage
FROM node:16.13-alpine as develop-stage
WORKDIR /
COPY package*.json ./
RUN yarn global add @quasar/cli
COPY . .

# build stage
FROM develop-stage as build-stage
RUN yarn
RUN quasar build

# production stage
FROM nginx:1.20.2-alpine as production-stage
COPY --from=build-stage /dist/spa /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
