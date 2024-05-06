// vanillaTree.js
document.addEventListener("DOMContentLoaded", function () {
    const config = {
        checkboxMode: 'all',  // 'all' OR 'none' // Experimental feature: 'leaf'
        useIcons: false,       // true OR false
        populateCheckboxSelection: true, // true OR false // make family member nodes react when a checkbox gets selected
        useServerData: false,    // Server connection needed if TRUE // Set to TRUE to fetch from server, set to FALSE to use hardcoded data
        maxRecursionDepth: 500, // 0 = disable // Any other number prevents infinite loops with the amount of recursive levels possible (levels inside levels)
        treeModel: 'nested' // 'flat' for simple parent structure, 'nested' for more complicated views
    };

    if (config.checkboxMode === 'leaf') {
        config.populateCheckboxSelection = false;
    }

    // Function to send selected IDs to the server
    function sendSelectedNodeIds(selectedIds) {
        fetch('/selectednodes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ selectedIds: selectedIds })
        })
            .then(response => response.text())
            .then(data => {
                try {
                    const jsonData = JSON.parse(data);
                    console.log('Success:', jsonData);
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    // Function to fetch tree data from the server based on config
    function fetchTreeData() {
        const url = config.treeModel === 'flat' ? '/flatnodes' : '/treenodes';

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                renderTree(data);
            })
            .catch(error => {
                console.error('Failed to load tree data from server, using hardcoded data:', error);
                renderTree(dataToUse); // Fallback to hardcoded data in case of failure
            });
    }

    // Don't like the server code above?...
    // For reading hardcoded, nested format:
    const hardcodedNestedData = {
        "id": "r1",
        "name": "Root Node (js, nested)",
        "children": [
            {
                "id": "c1",
                "name": "Child Node 1",
                "children": [
                    {
                        "id": "gc1",
                        "name": "Grandchild Node 1",
                        "children": [
                            {
                                "id": "ggc1",
                                "name": "Great-Grandchild Node 1",
                                "children": []
                            },
                            {
                                "id": "ggc2",
                                "name": "Great-Grandchild Node 2",
                                "children": []
                            }
                        ]
                    }
                ]
            },
            {
                "id": "c2",
                "name": "Child Node 2",
                "children": [
                    {
                        "id": "gc2",
                        "name": "Grandchild Node 2",
                        "children": []
                    },
                    {
                        "id": "gc3",
                        "name": "Grandchild Node 3",
                        "children": [
                            {
                                "id": "ggc3",
                                "name": "Great-Grandchild Node 3",
                                "children": []
                            }
                        ]
                    }
                ]
            },
            {
                "id": "c3",
                "name": "Child Node 3",
                "children": []
            }
        ]
    };

    // For reading hardcoded flat format (familiar from databases):
    const hardcodedFlatData = [
        { id: "r1", name: "Root Node (js, flat)", parent_id: null },
        { id: "c1", name: "Child Node 1", parent_id: "r1" },
        { id: "gc1", name: "Grandchild Node 1", parent_id: "c1" },
        { id: "ggc1", name: "Great-Grandchild Node 1", parent_id: "gc1" },
        { id: "ggc2", name: "Great-Grandchild Node 2", parent_id: "gc1" },
        { id: "c2", name: "Child Node 2", parent_id: "r1" },
        { id: "gc2", name: "Grandchild Node 2", parent_id: "c2" },
        { id: "gc3", name: "Grandchild Node 3", parent_id: "c2" },
        { id: "ggc3", name: "Great-Grandchild Node 3", parent_id: "gc3" },
        { id: "c3", name: "Child Node 3", parent_id: "r1" }
    ];

    // Build tree, executes for flat model only
    function buildTree(flatData) {
        let root = null;
        const nodes = {};

        flatData.forEach(node => {
            nodes[node.id] = { ...node, children: [] };
        });

        flatData.forEach(node => {
            if (node.parent_id === null) {
                root = nodes[node.id];
            } else {
                nodes[node.parent_id].children.push(nodes[node.id]);
            }
        });

        return root;
    }

    // SVG icons for the nodes
    const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M 22 18 V 10 a 2 2 0 0 0 -2 -2 h -7 c -2 0 -1 -2 -3 -2 H 4 a 2 2 0 0 0 -2 2 v 10 a 2 2 0 0 0 2 2 h 16 a 2 2 0 0 0 2 -2 z"/></svg>`;
    const svgToggle = `<svg class="toggle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;

    // Function to update the state of a parent checkbox based on the state of its children
    function setParentCheckboxState(childCheckbox, depth = 0) {
        // Define a maximum depth limit for recursion

        let parentElement = childCheckbox.closest('.node').parentElement.closest('.node');
        if (!parentElement || depth >= config.maxRecursionDepth) {
            console.log('Max recursion depth reached or no parent found');
            return; // Exit if there is no parent node or the depth limit is exceeded
        }

        const parentCheckbox = parentElement.querySelector('input[type="checkbox"]');
        if (!parentCheckbox) {
            console.log('No checkbox found at this level');
            return; // If no checkbox found, exit the function
        }

        const childCheckboxes = parentElement.querySelectorAll('.children input[type="checkbox"]');
        let allChecked = true;
        let anyChecked = false;

        childCheckboxes.forEach(function (checkbox) {
            if (checkbox.checked) {
                anyChecked = true;
            } else {
                allChecked = false;
            }
        });

        // Update the state of the parent checkbox based on children's state
        if (allChecked) {
            parentCheckbox.indeterminate = false;
            parentCheckbox.checked = true;
        } else if (anyChecked) {
            parentCheckbox.indeterminate = true;
            parentCheckbox.checked = false;
        } else {
            parentCheckbox.indeterminate = false;
            parentCheckbox.checked = false;
        }

        // Update the data-indeterminate attribute before the recursive call
        parentCheckbox.setAttribute('data-indeterminate', parentCheckbox.indeterminate ? 'true' : 'false');

        // Recursive call to update the state up the tree, increasing the depth
        setParentCheckboxState(parentCheckbox, depth + 1);
    }
    // Function to get IDs of all selected nodes
    function getSelectedNodeIds() {
        const selectedCheckboxes = document.querySelectorAll('.node input[type="checkbox"]:checked');
        const selectedIds = Array.from(selectedCheckboxes).map(checkbox => {
            return checkbox.closest('.node').id;  // Get the id attribute from the parent .node element
        });
        return selectedIds;
    }


    // Function to create a node element in the tree
    function createNode(nodeData) {
        const nodeElement = document.createElement('div');
        nodeElement.className = 'node';
        nodeElement.id = nodeData.id;  // Setting the id attribute of the node

        // Create a toggle element for showing/hiding children
        const toggle = document.createElement('div');
        toggle.classList.add('toggle');
        // Check if there are children to decide on toggle functionality
        if (Array.isArray(nodeData.children) && nodeData.children.length > 0) {
            toggle.innerHTML = svgToggle; // Load toggle icon if there are children
            toggle.addEventListener('click', function () {
                this.classList.toggle('rotated');
                toggleChildrenVisibility(nodeElement.querySelector('.children'));
            });
        } else {
            toggle.innerHTML = `<svg class="toggle" viewBox="0 0 24 24" fill="none" stroke="none" stroke-width="0"></svg>`;
        }
        nodeElement.appendChild(toggle);

        // Determine whether to include a checkbox based on configuration
        const shouldIncludeCheckbox = (config.checkboxMode === 'all') ||
            (config.checkboxMode === 'leaf' && (!nodeData.children || nodeData.children.length === 0));
        if (shouldIncludeCheckbox) {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.style.marginRight = '10px';
            checkbox.setAttribute('data-indeterminate', 'false');
            nodeElement.appendChild(checkbox);

            // Add event listener to handle checkbox state changes
            checkbox.addEventListener('change', function () {
                if (config.populateCheckboxSelection) {
                    // Check if the checkbox was in indeterminate state before the change
                    if (this.getAttribute('data-indeterminate') === 'true') {
                        // Clear all children checkboxes
                        const childCheckboxes = this.closest('.node').querySelectorAll('.children input[type="checkbox"]');
                        childCheckboxes.forEach(childCheckbox => {
                            childCheckbox.checked = false;
                            childCheckbox.indeterminate = false;
                        });
                    }

                    // Update data attribute and parent state
                    this.setAttribute('data-indeterminate', this.indeterminate ? 'true' : 'false');
                    setParentCheckboxState(this);
                }

                // Fetch all selected node IDs when state changes
                let selectedNodeIds = getSelectedNodeIds();
                console.log('Selected Node IDs: ' + selectedNodeIds.join(', '));

                // Send the selected node IDs to the server
                if (config.useServerData) {
                    sendSelectedNodeIds(selectedNodeIds);
                }
            });
        }

        if (config.useIcons) {
            const icon = document.createElement('div');
            icon.innerHTML = svgIcon;
            icon.classList.add('icon');
            nodeElement.appendChild(icon);
        }

        const text = document.createElement('span');
        text.textContent = nodeData.name;
        nodeElement.appendChild(text);

        // Create container for child nodes only if there are children
        if (Array.isArray(nodeData.children) && nodeData.children.length > 0) {
            let childrenContainer = document.createElement('div');
            childrenContainer.className = 'children';
            childrenContainer.style.overflow = 'hidden';
            childrenContainer.style.maxHeight = '0';
            childrenContainer.style.transition = 'max-height 0.15s ease-in-out';
            nodeData.children.forEach(child => childrenContainer.appendChild(createNode(child)));
            nodeElement.appendChild(childrenContainer);
        }

        return nodeElement;
    }

    // Function to toggle the visibility of children elements
    function toggleChildrenVisibility(container) {
        const children = container.children;
        let totalHeight = 0;

        // Calculate the total height of children
        for (let i = 0; i < children.length; i++) {
            totalHeight += children[i].offsetHeight;
        }

        // Check if the children are visible and update the height accordingly
        if (container.style.maxHeight === '0px') {
            container.style.maxHeight = totalHeight + 'px';

            // Update the height of the parent `.children` element
            let parentContainer = container.parentElement.closest('.children');
            while (parentContainer) {
                parentContainer.style.maxHeight = parseFloat(parentContainer.style.maxHeight) + totalHeight + 'px';
                parentContainer = parentContainer.parentElement.closest('.children');
            }
        } else {
            container.style.maxHeight = '0';

            // Update the height of the parent `.children` element
            let parentContainer = container.parentElement.closest('.children');
            while (parentContainer) {
                parentContainer.style.maxHeight = parseFloat(parentContainer.style.maxHeight) - totalHeight + 'px';
                parentContainer = parentContainer.parentElement.closest('.children');
            }
        }
    }

    // Function to render the whole tree
    function renderTree(data) {
        const treeContainer = document.getElementById('vanillaTree');
        treeContainer.innerHTML = ''; // Clear previous contents

        // Check configuration for data model type
        if (config.treeModel === 'flat') {
            const hierarchicalData = buildTree(data); // Convert flat data to hierarchical structure
            treeContainer.appendChild(createNode(hierarchicalData)); // Build tree from hierarchical data
        } else {
            treeContainer.appendChild(createNode(data)); // Build tree directly from hierarchical data
        }
    }

    // Decide which data source to use based on configuration
    if (config.useServerData) {
        fetchTreeData(); // Fetch data from server if configured to do so
    } else {
        // Use the appropriate data source based on the tree model
        const dataToUse = config.treeModel === 'flat' ? hardcodedFlatData : hardcodedNestedData;
        renderTree(dataToUse);
    }
});