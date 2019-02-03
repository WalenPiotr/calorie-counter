package middleware

import (
	"log"
	"net/http"
)

func WithTracing(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Logged connection from %s", r.RemoteAddr)
		log.Printf("Tracing request for %s", r.RequestURI)
		next.ServeHTTP(w, r)
	})
}
