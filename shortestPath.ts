
// shortestPath.ts
import { UUID } from './models';

type Edge = { from: UUID, to: UUID }; // teacher -> student

export function shortestPathBFS(start: UUID, goal: UUID, edges: Edge[]): UUID[] | null {
  if (start === goal) return [start];

  // adjacency map
  const adj = new Map<UUID, UUID[]>();
  for (const e of edges) {
    if (!adj.has(e.from)) adj.set(e.from, []);
    adj.get(e.from)!.push(e.to);
    
    // Add reverse edge for bidirectional search
    if (!adj.has(e.to)) adj.set(e.to, []);
    adj.get(e.to)!.push(e.from);
  }

  const queue: UUID[] = [start];
  const prev = new Map<UUID, UUID | null>();
  prev.set(start, null);

  while (queue.length) {
    const node = queue.shift()!;
    const neighbors = adj.get(node) ?? [];
    
    for (const nb of neighbors) {
      if (!prev.has(nb)) {
        prev.set(nb, node);
        queue.push(nb);
        
        if (nb === goal) {
          // reconstruct path
          const path: UUID[] = [];
          let cur: UUID | null = goal;
          while (cur) {
            path.push(cur);
            cur = prev.get(cur) ?? null;
          }
          path.reverse();
          return path;
        }
      }
    }
  }
  
  return null; // no path found
}
