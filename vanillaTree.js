// vanillaTree.js
document.addEventListener("DOMContentLoaded", function () {
    const config = {
        checkboxMode: 'all',  // 'all', 'leaf' OR 'none'
        useIcons: false       // true OR false
    };

    const data = {
        "name": "Root Node",
        "children": [
            {
                "name": "Child Node 1",
                "children": [
                    {
                        "name": "Grandchild Node 1",
                        "children": [
                            {
                                "name": "Great-Grandchild Node 1",
                                "children": []
                            },
                            {
                                "name": "Great-Grandchild Node 2",
                                "children": []
                            }
                        ]
                    }
                ]
            },
            {
                "name": "Child Node 2",
                "children": [
                    {
                        "name": "Grandchild Node 2",
                        "children": []
                    },
                    {
                        "name": "Grandchild Node 3",
                        "children": [
                            {
                                "name": "Great-Grandchild Node 3",
                                "children": []
                            }
                        ]
                    }
                ]
            },
            {
                "name": "Child Node 3",
                "children": []
            }
        ]
    };
    
    // SVG icons for the nodes
    const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M 22 18 V 10 a 2 2 0 0 0 -2 -2 h -7 c -2 0 -1 -2 -3 -2 H 4 a 2 2 0 0 0 -2 2 v 10 a 2 2 0 0 0 2 2 h 16 a 2 2 0 0 0 2 -2 z"/></svg>`;
    const svgToggle = `<svg class="toggle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;

    // Function to create each node element
// Function to create each node element
function createNode(nodeData) {
    const nodeElement = document.createElement('div');
    nodeElement.className = 'node';

    // Add extra padding for non-leaf nodes when 'leaf' is selected
    if (config.checkboxMode === 'leaf' && nodeData.children && nodeData.children.length > 0) {
        nodeElement.style.marginLeft = '27px';
    }

    const toggle = document.createElement('div');
    toggle.classList.add('toggle');
    if (nodeData.children && nodeData.children.length > 0) {
        toggle.innerHTML = svgToggle;  // Load toggle icon if there are children
        toggle.addEventListener('click', function () {
            this.classList.toggle('rotated');
            toggleChildrenVisibility(childrenContainer);
        });
    } else {
        toggle.innerHTML = `<svg class="toggle" viewBox="0 0 24 24" fill="none" stroke="none" stroke-width="0"></svg>`;
    }
    nodeElement.appendChild(toggle);

    const shouldIncludeCheckbox = (config.checkboxMode === 'all') ||
        (config.checkboxMode === 'leaf' && (!nodeData.children || nodeData.children.length === 0));
    if (shouldIncludeCheckbox) {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.style.marginRight = '10px';
        nodeElement.appendChild(checkbox);
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
