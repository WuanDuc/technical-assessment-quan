import { CustomHashmap } from '../data-structures/hashmap';

/**
 * Factory for creating Hashmap instances
 * Implements Factory Pattern as per technical assessment requirements
 */
export class HashmapFactory {
  /**
   * Create a new Hashmap instance for file metadata
   * @param initialCapacity - Initial capacity of the hashmap
   * @param loadFactor - Load factor threshold for resizing
   */
  static createFileMetadataHashmap<K, V>(
    initialCapacity: number = 32,
    loadFactor: number = 0.75,
  ): CustomHashmap<K, V> {
    return new CustomHashmap<K, V>(initialCapacity, loadFactor);
  }

  /**
   * Create a new Hashmap instance for attachment tracking
   */
  static createAttachmentHashmap<K, V>(
    initialCapacity: number = 16,
    loadFactor: number = 0.75,
  ): CustomHashmap<K, V> {
    return new CustomHashmap<K, V>(initialCapacity, loadFactor);
  }

  /**
   * Create a new Hashmap instance with custom configuration
   */
  static createCustomHashmap<K, V>(
    config: {
      initialCapacity?: number;
      loadFactor?: number;
    } = {},
  ): CustomHashmap<K, V> {
    return new CustomHashmap<K, V>(
      config.initialCapacity || 16,
      config.loadFactor || 0.75,
    );
  }
}
