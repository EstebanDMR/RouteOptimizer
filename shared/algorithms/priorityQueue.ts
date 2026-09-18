export interface QueueElement<T> {
  item: T;
  priority: number;
}

/**
 * MinPriorityQueue implementada desde cero sobre un Min-Heap Binario indexado.
 * Garantiza:
 * - push: O(log n)
 * - pop: O(log n)
 * - peek: O(1)
 * - size/isEmpty: O(1)
 */
export class MinPriorityQueue<T> {
  private heap: QueueElement<T>[] = [];

  constructor(elements?: QueueElement<T>[]) {
    if (elements && elements.length > 0) {
      for (const el of elements) {
        this.push(el.item, el.priority);
      }
    }
  }

  /**
   * Retorna el número de elementos en la cola
   */
  public size(): number {
    return this.heap.length;
  }

  /**
   * Indica si la cola de prioridad está vacía
   */
  public isEmpty(): boolean {
    return this.heap.length === 0;
  }

  /**
   * Inserta un elemento con su respectiva prioridad numérica (menor número = mayor prioridad)
   */
  public push(item: T, priority: number): void {
    const element: QueueElement<T> = { item, priority };
    this.heap.push(element);
    this.bubbleUp(this.heap.length - 1);
  }

  /**
   * Extrae y devuelve el elemento de menor prioridad (mínimo)
   */
  public pop(): QueueElement<T> | undefined {
    if (this.isEmpty()) {
      return undefined;
    }

    const min = this.heap[0];
    const end = this.heap.pop()!;

    if (this.heap.length > 0) {
      this.heap[0] = end;
      this.sinkDown(0);
    }

    return min;
  }

  /**
   * Consulta el elemento con menor prioridad sin extraerlo
   */
  public peek(): QueueElement<T> | undefined {
    return this.heap[0];
  }

  /**
   * Limpia todos los elementos
   */
  public clear(): void {
    this.heap = [];
  }

  /**
   * Flota un elemento hacia arriba en el árbol binario hasta satisfacer la propiedad de heap
   */
  private bubbleUp(index: number): void {
    const element = this.heap[index];

    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      const parent = this.heap[parentIndex];

      if (element.priority >= parent.priority) {
        break;
      }

      this.heap[index] = parent;
      index = parentIndex;
    }

    this.heap[index] = element;
  }

  /**
   * Hunde un elemento hacia abajo en el árbol binario hasta satisfacer la propiedad de heap
   */
  private sinkDown(index: number): void {
    const length = this.heap.length;
    const element = this.heap[index];

    while (true) {
      const leftChildIndex = 2 * index + 1;
      const rightChildIndex = 2 * index + 2;
      let swapIndex: number | null = null;
      let minPriority = element.priority;

      if (leftChildIndex < length) {
        const leftChild = this.heap[leftChildIndex];
        if (leftChild.priority < minPriority) {
          minPriority = leftChild.priority;
          swapIndex = leftChildIndex;
        }
      }

      if (rightChildIndex < length) {
        const rightChild = this.heap[rightChildIndex];
        if (rightChild.priority < minPriority) {
          swapIndex = rightChildIndex;
        }
      }

      if (swapIndex === null) {
        break;
      }

      this.heap[index] = this.heap[swapIndex];
      index = swapIndex;
    }

    this.heap[index] = element;
  }
}
