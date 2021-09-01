FROM golang:1.16.0-alpine AS builder

WORKDIR /go/src/github.com/neel1996/gitconvex

COPY . .

# Install required packages
RUN apk update && \
    apk add --update libgit2-dev libssh2-dev gcc make nodejs npm musl-dev

# Building server
RUN go get -v && \
    make build-server && \
    mv ./dist/gitconvex-server ./dist/gitconvex

# Building React UI bundle
RUN cd ui/ && \
    npm install && \
    export NODE_ENV=production && \
    npm i -g npm@6 && \
    npm install tailwindcss postcss autoprefixer && \
    npx tailwindcss build -o src/index.css -c src/tailwind.config.js && \
    npm run build && \
    mv build ../dist/gitconvex-ui && \
    cd ..

FROM alpine:latest

WORKDIR /app

RUN apk update && \
    apk add --update libgit2 libssh2

COPY --from=builder /go/src/github.com/neel1996/gitconvex/dist .

EXPOSE 9001

CMD ["./gitconvex"]
