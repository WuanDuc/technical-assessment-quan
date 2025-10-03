/**
 * Custom Hashmap implementation from scratch
 * Uses linear probing for collision handling
 * Used for managing file upload metadata
 */
export class CustomHashmap<K, V> {
  private buckets: Array<{ key: K; value: V } | null>;
  private size: number;
  private capacity: number;
  private loadFactorThreshold: number;

  constructor(initialCapacity: number = 16, loadFactor: number = 0.75) {
    this.capacity = initialCapacity;
    this.buckets = new Array(this.capacity).fill(null);
    this.size = 0;
    this.loadFactorThreshold = loadFactor;
  }

  /**
   * Generate hash code for a key
   * Uses simple string hashing algorithm
   */
  private hash(key: K): number {
    const keyString = String(key);
    let hash = 0;

    for (let i = 0; i < keyString.length; i++) {
      const char = keyString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash) % this.capacity;
  }

  /**
   * Resize the hashmap when load factor is exceeded
   */
  private resize(): void {
    const oldBuckets = this.buckets;
    this.capacity *= 2;
    this.buckets = new Array(this.capacity).fill(null);
    this.size = 0;

    // Rehash all existing entries
    for (const bucket of oldBuckets) {
      if (bucket !== null) {
        this.insert(bucket.key, bucket.value);
      }
    }
  }

  /**
   * Insert or update a key-value pair
   * @param key - The key to insert
   * @param value - The value to associate with the key
   */
  insert(key: K, value: V): void {
    // Check if resize is needed
    if (this.size / this.capacity >= this.loadFactorThreshold) {
      this.resize();
    }

    let index = this.hash(key);
    let probeCount = 0;

    // Linear probing for collision resolution
    while (this.buckets[index] !== null && probeCount < this.capacity) {
      // Update existing key
      if (this.buckets[index].key === key) {
        this.buckets[index].value = value;
        return;
      }

      index = (index + 1) % this.capacity;
      probeCount++;
    }

    // Insert new entry
    if (probeCount < this.capacity) {
      this.buckets[index] = { key, value };
      this.size++;
    } else {
      throw new Error('Hashmap is full');
    }
  }

  /**
   * Get value by key
   * @param key - The key to search for
   * @returns The value associated with the key, or undefined if not found
   */
  get(key: K): V | undefined {
    let index = this.hash(key);
    let probeCount = 0;

    // Linear probing to find the key
    while (this.buckets[index] !== null && probeCount < this.capacity) {
      if (this.buckets[index].key === key) {
        return this.buckets[index].value;
      }

      index = (index + 1) % this.capacity;
      probeCount++;
    }

    return undefined;
  }

  /**
   * Delete a key-value pair
   * @param key - The key to delete
   * @returns true if deletion was successful, false otherwise
   */
  delete(key: K): boolean {
    let index = this.hash(key);
    let probeCount = 0;

    // Linear probing to find the key
    while (this.buckets[index] !== null && probeCount < this.capacity) {
      if (this.buckets[index].key === key) {
        this.buckets[index] = null;
        this.size--;

        // Rehash subsequent entries to maintain probe sequence
        this.rehashCluster(index);
        return true;
      }

      index = (index + 1) % this.capacity;
      probeCount++;
    }

    return false;
  }

  /**
   * Rehash entries after deletion to maintain linear probing integrity
   */
  private rehashCluster(startIndex: number): void {
    let index = (startIndex + 1) % this.capacity;

    while (this.buckets[index] !== null) {
      const entry = this.buckets[index];
      this.buckets[index] = null;
      this.size--;
      this.insert(entry.key, entry.value);

      index = (index + 1) % this.capacity;
    }
  }

  /**
   * Check if a key exists in the hashmap
   * @param key - The key to check
   * @returns true if key exists, false otherwise
   */
  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Get the number of entries in the hashmap
   */
  getSize(): number {
    return this.size;
  }

  /**
   * Get the current capacity of the hashmap
   */
  getCapacity(): number {
    return this.capacity;
  }

  /**
   * Clear all entries from the hashmap
   */
  clear(): void {
    this.buckets = new Array(this.capacity).fill(null);
    this.size = 0;
  }

  /**
   * Get all keys in the hashmap
   */
  keys(): K[] {
    const keys: K[] = [];
    for (const bucket of this.buckets) {
      if (bucket !== null) {
        keys.push(bucket.key);
      }
    }
    return keys;
  }

  /**
   * Get all values in the hashmap
   */
  values(): V[] {
    const values: V[] = [];
    for (const bucket of this.buckets) {
      if (bucket !== null) {
        values.push(bucket.value);
      }
    }
    return values;
  }

  /**
   * Get all entries as key-value pairs
   */
  entries(): Array<{ key: K; value: V }> {
    const entries: Array<{ key: K; value: V }> = [];
    for (const bucket of this.buckets) {
      if (bucket !== null) {
        entries.push({ key: bucket.key, value: bucket.value });
      }
    }
    return entries;
  }

  /**
   * Get load factor (for monitoring performance)
   */
  getLoadFactor(): number {
    return this.size / this.capacity;
  }
}
