const GRID_SIZE = 20;
let start = null;
let end = null;
let path = null;
let isSettingStart = false;
let isSettingEnd = false;

// Creating the grid
const grid = document.getElementById('grid');
for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('id', `${i}-${j}`);
        cell.addEventListener('click', () => toggleCell(cell));
        grid.appendChild(cell);
    }
    grid.appendChild(document.createElement('br'));
}

function toggleCell(cell) {
    if (isSettingStart) {
        if (start) start.classList.remove('start');
        start = cell;
        start.classList.add('start');
        isSettingStart = false;
    } else if (isSettingEnd) {
        if (end) end.classList.remove('end');
        end = cell;
        end.classList.add('end');
        isSettingEnd = false;
    } else {
        cell.classList.toggle('obstacle');
    }
}

document.getElementById('startBtn').addEventListener('click', () => {
    isSettingStart = true;
    isSettingEnd = false;
});

document.getElementById('endBtn').addEventListener('click', () => {
    isSettingStart = false;
    isSettingEnd = true;
});

    document.getElementById('reset').addEventListener('click', () => {
        // Clear start and end nodes
        if (start) {
            start.classList.remove('start');
            start = null;
        }
        if (end) {
            end.classList.remove('end');
            end = null;
        }
        
        // Clear obstacles and visited nodes
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.classList.remove('obstacle', 'visited', 'path');
        });
    
        // Clear path
        path.clear();
    });
    

document.getElementById('visualizeBtn1').addEventListener('click', () => {
    if (!start || !end) return;
    visualizeBFS();
});

function visualizeBFS() {
    const queue = [{ node: start, parent: null }];
    const visited = new Set();
    path = new Map();

    while (queue.length > 0) {
        const { node, parent } = queue.shift();
        visited.add(node);
        if (node === end) {
            reconstructPathBFS(path, node);
            return;
        }

        const neighbors = getNeighbors(node);
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push({ node: neighbor, parent: node });
                path.set(neighbor, node);
                neighbor.classList.add('visited');
            }
        }
    }
}


document.getElementById('visualizeBtn2').addEventListener('click', () => {
    if (!start || !end) return;
    visualizeDij();
});

function visualizeDij() {
    const queue = new PriorityQueue(); 
    const distances = new Map(); 
    const path = new Map(); 
    const visited = new Set(); 

    distances.set(start, 0); 
    queue.enqueue(start, 0); 

    while (!queue.isEmpty()) {
        const currentNode = queue.dequeue(); 
        visited.add(currentNode);

        if (currentNode === end) {
            reconstructPathDij(path, end); // Reconstruct shortest path
            return;
        }

        const neighbors = getNeighbors(currentNode); // Get the neighbors of the current node

        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                const distanceToNeighbor = distances.get(currentNode) + distance(currentNode, neighbor); // Calculate tentative distance to neighbor

                if (!distances.has(neighbor) || distanceToNeighbor < distances.get(neighbor)) {
                    distances.set(neighbor, distanceToNeighbor); 
                    path.set(neighbor, currentNode); 
                    queue.enqueue(neighbor, distanceToNeighbor); 
                    neighbor.classList.add('visited');

                }
            }
        }
    }
}

// Priority queue implementation
class PriorityQueue {
    constructor() {
        this.queue = [];
    }

    enqueue(element, priority) {
        this.queue.push({ element, priority });
        this.sort();
    }

    dequeue() {
        if (this.isEmpty()) return null;
        return this.queue.shift().element;
    }

    isEmpty() {
        return this.queue.length === 0;
    }

    sort() {
        this.queue.sort((a, b) => a.priority - b.priority);
    }
}

function distance(node1, node2) {
    const dx = Math.abs(node1.x - node2.x);
    const dy = Math.abs(node1.y - node2.y);
    const diagonalDistance = Math.min(dx, dy);
    const straightDistance = Math.abs(dx - dy);
    return diagonalDistance * Math.SQRT2 + straightDistance;
}

function reconstructPathDij(path, endNode) {
    const shortestPath = [];
    let currentNode = endNode;

    while (path.has(currentNode)) {
        shortestPath.unshift(currentNode);
        currentNode = path.get(currentNode);
    }

    shortestPath.forEach(node => {
        if (node !== start && node !== end) {
            node.classList.add('path');
        }
    });
}

document.getElementById('visualizeBtn3').addEventListener('click', () => {
    if (!start || !end) return;
    visualizeAstar();
});

function visualizeAstar(){
    const openSet = new Set([start]);
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    // Initialize start node
    gScore.set(start, 0);
    fScore.set(start, heuristic(start, end));

    while (openSet.size > 0) {
        let current = null;
        for (const node of openSet) {
            if (!current || fScore.get(node) < fScore.get(current)) {
                current = node;
            }
        }

        if (current === end) {
            reconstructPathA(cameFrom, end);
            return;
        }

        openSet.delete(current);

        const neighbors = getNeighbors(current);
        for (const neighbor of neighbors) {
            const tentativeGScore = gScore.get(current) + distance(current, neighbor);
            if (tentativeGScore < (gScore.get(neighbor) || Infinity)) {
                cameFrom.set(neighbor, current);
                gScore.set(neighbor, tentativeGScore);
                fScore.set(neighbor, tentativeGScore + heuristic(neighbor, end));
                if (!openSet.has(neighbor)) {
                    openSet.add(neighbor);
                    neighbor.classList.add('visited');
                }
            }
        }
    }
}

function heuristic(nodeA, nodeB) {
    const [x1, y1] = getNodeCoordinates(nodeA);
    const [x2, y2] = getNodeCoordinates(nodeB);
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

function getNodeCoordinates(node) {
    const cellIndex = node.cellIndex; // Assuming your nodes are represented as table cells
    const rowIndex = node.parentNode.rowIndex;
    return [rowIndex, cellIndex];
}


function reconstructPathA(cameFrom, end) {
    const shortestPath = [];
    let current = end;
    
    while (cameFrom.has(current)) {
        shortestPath.unshift(current);
        current = cameFrom.get(current);
    }

    shortestPath.forEach(node => {
        node.classList.add('path');
    });
}

function getNeighbors(cell) {
    const [x, y] = cell.getAttribute('id').split('-').map(Number);
    const neighbors = [];
    if (x > 0) neighbors.push(document.getElementById(`${x - 1}-${y}`));
    if (x < GRID_SIZE - 1) neighbors.push(document.getElementById(`${x + 1}-${y}`));
    if (y > 0) neighbors.push(document.getElementById(`${x}-${y - 1}`));
    if (y < GRID_SIZE - 1) neighbors.push(document.getElementById(`${x}-${y + 1}`));
    return neighbors.filter(neighbor => !neighbor.classList.contains('obstacle'));
}

function reconstructPathBFS(path, current) {
    while (current !== start) {
        current.classList.add('path');
        current = path.get(current);
    }
}
