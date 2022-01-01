# build stage
FROM node:16.13.1-alpine as build-stage
WORKDIR /app

COPY ./ ./

RUN npm install
RUN npm run build

# production stage
FROM nginx:1.20.2-alpine as production-stage
COPY --from=build-stage /app/dist/spa /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
