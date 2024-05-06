///////////////////////////////////////////////////
//// Example server code for using vanillaTree ////
///////////////////////////////////////////////////

package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type Node struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Children []Node `json:"children,omitempty"` // omit empty to not send empty arrays
}

type FlatNode struct {
	ID       string  `json:"id"`
	Name     string  `json:"name"`
	ParentID *string `json:"parent_id"`
}

func updateSelectionHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST requests are allowed", http.StatusMethodNotAllowed)
		return
	}

	var payload struct {
		SelectedIds []string `json:"selectedIds"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Failed to parse request body", http.StatusBadRequest)
		return
	}

	fmt.Println("Selected Node IDs:", payload.SelectedIds)

	response := struct {
		Message string `json:"message"`
	}{
		Message: "Received IDs successfully.",
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func treeNodesHandler(w http.ResponseWriter, r *http.Request) {
	root := Node{
		ID:   "r1",
		Name: "Root (server, nested) Node",
		Children: []Node{
			{
				ID:   "c1",
				Name: "Child Node 1",
				Children: []Node{
					{
						ID:   "gc1",
						Name: "Grandchild Node 1",
						Children: []Node{
							{ID: "ggc1", Name: "Great-Grandchild Node 1"},
							{ID: "ggc2", Name: "Great-Grandchild Node 2"},
						},
					},
				},
			},
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(root)
}

func flatNodesHandler(w http.ResponseWriter, r *http.Request) {
	nodes := []FlatNode{
		{ID: "r1", Name: "Root Node (server, flat)", ParentID: nil},
		{ID: "c1", Name: "Child Node 1", ParentID: strPtr("r1")},
		{ID: "gc1", Name: "Grandchild Node 1", ParentID: strPtr("c1")},
		{ID: "ggc1", Name: "Great-Grandchild Node 1", ParentID: strPtr("gc1")},
		{ID: "ggc2", Name: "Great-Grandchild Node 2", ParentID: strPtr("gc1")},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(nodes)
}

func strPtr(s string) *string {
	return &s
}

func main() {
	http.HandleFunc("/selectednodes", updateSelectionHandler)
	http.HandleFunc("/treenodes", treeNodesHandler)
	http.HandleFunc("/flatnodes", flatNodesHandler)
	fs := http.FileServer(http.Dir("."))
	http.Handle("/", fs)

	port := ":8080"
	fmt.Printf("Server running on http://localhost%s\n", port)
	log.Fatal(http.ListenAndServe(port, nil))
}
