package utils

import (
	"encoding/json"
	"net/http"
)

type Status int

const (
	Error Status = iota
	Info
)

func (s Status) String() string {
	return [...]string{"Error", "Info"}[s]
}

func Message(status Status, message string) map[string]interface{} {
	return map[string]interface{}{"status": status.String(), "message": message}
}

func Respond(w http.ResponseWriter, data map[string]interface{}) {
	w.Header().Add("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}
