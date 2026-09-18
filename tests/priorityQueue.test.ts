import { describe, it, expect, beforeEach } from 'vitest';
import { MinPriorityQueue } from '@shared/algorithms/priorityQueue';

describe('MinPriorityQueue (Binary Min-Heap)', () => {
  let pq: MinPriorityQueue<string>;

  beforeEach(() => {
    pq = new MinPriorityQueue<string>();
  });

  it('starts empty with size 0', () => {
    expect(pq.isEmpty()).toBe(true);
    expect(pq.size()).toBe(0);
    expect(pq.pop()).toBeUndefined();
    expect(pq.peek()).toBeUndefined();
  });

  it('maintains min-heap property when inserting elements in arbitrary order', () => {
    const items = [
      { item: 'Node D', priority: 15 },
      { item: 'Node B', priority: 5 },
      { item: 'Node E', priority: 20 },
      { item: 'Node A', priority: 1 },
      { item: 'Node C', priority: 10 },
    ];

    for (const el of items) {
      pq.push(el.item, el.priority);
    }

    expect(pq.size()).toBe(5);
    expect(pq.isEmpty()).toBe(false);

    // Debe extraer en orden estrictamente ascendente de prioridad
    expect(pq.pop()?.item).toBe('Node A'); // 1
    expect(pq.pop()?.item).toBe('Node B'); // 5
    expect(pq.pop()?.item).toBe('Node C'); // 10
    expect(pq.pop()?.item).toBe('Node D'); // 15
    expect(pq.pop()?.item).toBe('Node E'); // 20

    expect(pq.isEmpty()).toBe(true);
    expect(pq.size()).toBe(0);
  });

  it('allows peek without removing the minimum element', () => {
    pq.push('First', 10);
    pq.push('Lowest', 2);
    pq.push('Middle', 5);

    expect(pq.peek()?.item).toBe('Lowest');
    expect(pq.size()).toBe(3);

    const popped = pq.pop();
    expect(popped?.item).toBe('Lowest');
    expect(pq.peek()?.item).toBe('Middle');
  });

  it('handles elements with identical priorities gracefully', () => {
    pq.push('Node 1', 5);
    pq.push('Node 2', 5);
    pq.push('Node 3', 2);

    expect(pq.pop()?.item).toBe('Node 3');
    const next1 = pq.pop()?.priority;
    const next2 = pq.pop()?.priority;
    expect(next1).toBe(5);
    expect(next2).toBe(5);
    expect(pq.isEmpty()).toBe(true);
  });

  it('clears all elements properly', () => {
    pq.push('A', 1);
    pq.push('B', 2);
    pq.clear();
    expect(pq.size()).toBe(0);
    expect(pq.isEmpty()).toBe(true);
  });
});
