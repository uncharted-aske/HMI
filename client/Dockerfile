# docker build -t docker.uncharted.software/uncharted-aske/hmi/client -f Dockerfile.client .

FROM node:12-alpine AS builder

WORKDIR /client

COPY . .

RUN yarn global add npm-run-all && \
    yarn global add rollup && \
    yarn global add rimraf
RUN apk add --no-cache git openssh
RUN rm -rf node_modules && \
    yarn install && \
    NODE_ENV="production" yarn build

FROM nginx:1.19.2

# By default nginx does not support env variables. However, this nginx image has a function, 
# that will extract environment variables from *.conf.template files before nginx starts.
COPY ./nginx/nginx.conf.template /etc/nginx/templates/default.conf.template

COPY --from=builder /client/dist /usr/share/nginx/html
