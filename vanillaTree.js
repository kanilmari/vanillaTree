// vanillaTree.js
document.addEventListener("DOMContentLoaded", function () {
    const config = {
        checkboxMode: 'all',  // 'all', 'leaf' OR 'none'
        useIcons: false,       // true OR false
        populateCheckboxSelection: true // true OR false
    };

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
    
    const data = {
        "id": "r1",
        "name": "Root Node",
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

    // SVG icons for the nodes
    const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M 22 18 V 10 a 2 2 0 0 0 -2 -2 h -7 c -2 0 -1 -2 -3 -2 H 4 a 2 2 0 0 0 -2 2 v 10 a 2 2 0 0 0 2 2 h 16 a 2 2 0 0 0 2 -2 z"/></svg>`;
    const svgToggle = `<svg class="toggle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;

    // Function to update the state of a parent checkbox based on the state of its children
    function setParentCheckboxState(childCheckbox) {
        let parentElement = childCheckbox.closest('.node').parentElement.closest('.node');
        if (!parentElement) return; // Exit if there is no parent node (i.e., this is the root)

        const parentCheckbox = parentElement.querySelector('input[type="checkbox"]');
        if (!parentCheckbox) return; // If no checkbox found, exit the function

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

        // Recursive call to update the state up the tree
        setParentCheckboxState(parentCheckbox);
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
        if (nodeData.children && nodeData.children.length > 0) {
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
                sendSelectedNodeIds(selectedNodeIds);
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

        let childrenContainer = document.createElement('div');
        childrenContainer.className = 'children';
        childrenContainer.style.overflow = 'hidden';
        childrenContainer.style.maxHeight = '0';
        childrenContainer.style.transition = 'max-height 0.15s ease-in-out';
        nodeData.children.forEach(child => childrenContainer.appendChild(createNode(child)));
        nodeElement.appendChild(childrenContainer);

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
    function renderTree() {
        const treeContainer = document.getElementById('tree');
        treeContainer.innerHTML = '';
        treeContainer.appendChild(createNode(data));
    }

    renderTree();
});