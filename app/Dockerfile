FROM golang:alpine as builder
COPY . /src
WORKDIR /src
ENV CGO_ENABLED=0 
RUN go build -mod vendor -o /app/exec cmd/service/main.go

FROM golang:alpine 
WORKDIR /
COPY --from=builder /app /app
COPY static /app/static
WORKDIR /app

CMD [ "./exec" ]
