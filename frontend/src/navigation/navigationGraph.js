class NavigationGraph {
  constructor() {
    this.pages = new Map();
    this.adjacencyList = new Map();
  }

  addPage(id, label, icon) {
    if (!this.pages.has(id)) {
      this.pages.set(id, { id, label, icon });
      this.adjacencyList.set(id, new Set());
    }
  }

  addRoute(from, to) {
    if (!this.adjacencyList.has(from) || !this.adjacencyList.has(to)) {
      throw new Error(`Unknown navigation page: ${from} -> ${to}`);
    }
    this.adjacencyList.get(from).add(to);
  }

  getPages() {
    return [...this.pages.values()];
  }

  // ใช้ BFS หาเส้นทางสั้นสุด; คืน null หากไปไม่ถึง
  findPath(start, target) {
    if (!this.adjacencyList.has(start) || !this.adjacencyList.has(target)) {
      return null;
    }

    const queue = [start];
    const previousPage = new Map([[start, null]]);

    for (let head = 0; head < queue.length; head++) {
      const current = queue[head];
      if (current === target) break;

      for (const neighbor of this.adjacencyList.get(current)) {
        if (!previousPage.has(neighbor)) {
          previousPage.set(neighbor, current);
          queue.push(neighbor);
        }
      }
    }

    if (!previousPage.has(target)) return null;

    const path = [];
    for (let page = target; page !== null; page = previousPage.get(page)) {
      path.push(page);
    }
    return path.reverse();
  }
}

const navigationGraph = new NavigationGraph();
navigationGraph.addPage('discography', 'Discography', 'fa-music');
navigationGraph.addPage('members', 'Members', 'fa-users');
navigationGraph.addRoute('discography', 'members');
navigationGraph.addRoute('members', 'discography');

export default navigationGraph;
