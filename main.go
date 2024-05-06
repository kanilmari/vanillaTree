package main

import (
	"fmt"
	"log"
	"net/http"
)

func updateSelectionHandler(w http.ResponseWriter, r *http.Request) {
	// Ensure that the request is made with the POST method
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST requests are allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse the request body
	if err := r.ParseForm(); err != nil {
		http.Error(w, "Failed to parse request body", http.StatusBadRequest)
		return
	}

	// Get the selected IDs
	selectedIds := r.PostForm["selectedIds"]

	// Print the received IDs to the console
	fmt.Println("Selected Node IDs:", selectedIds)

	// Respond with success
	w.WriteHeader(http.StatusOK)
}

func main() {
	// Route that handles the /selectednodes endpoint
	http.HandleFunc("/selectednodes", updateSelectionHandler)

	// Serve static files from the root directory
	fs := http.FileServer(http.Dir("."))
	http.Handle("/", fs)

	// Start the server
	port := ":8080"
	fmt.Printf("Server running on http://localhost%s\n", port)
	log.Fatal(http.ListenAndServe(port, nil))
}
