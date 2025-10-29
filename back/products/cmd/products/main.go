// back/products/cmd/products/main.go

package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	// root
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hello, DevOps-Shopifaille! Products microservice is active.")
	})

	port := 8080
	log.Printf("Server started at http://localhost:%d", port)

	// Start the HTTP server
	// log.Fatal when there is an error
	err := http.ListenAndServe(fmt.Sprintf(":%d", port), nil)
	if err != nil {
		log.Fatalf("Failed to start the server: %v", err)
	}
}