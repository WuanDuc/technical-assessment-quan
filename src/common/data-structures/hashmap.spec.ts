import { CustomHashmap } from './hashmap';

describe('CustomHashmap', () => {
  it('inserts and retrieves values', () => {
    const hashmap = new CustomHashmap<string, number>(4, 0.75);

    hashmap.insert('alpha', 1);
    hashmap.insert('beta', 2);

    expect(hashmap.get('alpha')).toBe(1);
    expect(hashmap.get('beta')).toBe(2);
  });

  it('updates existing keys without increasing size', () => {
    const hashmap = new CustomHashmap<string, string>(4, 0.75);

    hashmap.insert('key', 'initial');
    hashmap.insert('key', 'updated');

    expect(hashmap.get('key')).toBe('updated');
    expect(hashmap.getSize()).toBe(1);
  });

  it('handles collisions via linear probing', () => {
    const hashmap = new CustomHashmap<number, string>(4, 0.75);

    // These keys are crafted to collide by modding with capacity 4
    hashmap.insert(0, 'zero');
    hashmap.insert(4, 'four');

    expect(hashmap.get(0)).toBe('zero');
    expect(hashmap.get(4)).toBe('four');
  });

  it('resizes when load factor threshold exceeded', () => {
    const hashmap = new CustomHashmap<number, number>(4, 0.5);

    hashmap.insert(1, 10);
    hashmap.insert(2, 20);
    hashmap.insert(3, 30);

    expect(hashmap.getCapacity()).toBeGreaterThanOrEqual(8);
    expect(hashmap.get(3)).toBe(30);
    expect(hashmap.getSize()).toBe(3);
  });

  it('deletes entries and rehashes cluster correctly', () => {
    const hashmap = new CustomHashmap<string, string>(8, 0.75);

    hashmap.insert('a', 'one');
    hashmap.insert('b', 'two');
    hashmap.insert('c', 'three');

    expect(hashmap.delete('b')).toBe(true);
    expect(hashmap.get('b')).toBeUndefined();
    expect(hashmap.get('c')).toBe('three');
    expect(hashmap.getSize()).toBe(2);
  });

  it('returns keys, values, entries, and load factor', () => {
    const hashmap = new CustomHashmap<string, number>(8, 0.75);

    hashmap.insert('x', 24);
    hashmap.insert('y', 25);

    expect(hashmap.keys().sort()).toEqual(['x', 'y']);
    expect(hashmap.values().sort()).toEqual([24, 25]);
    expect(hashmap.entries().length).toBe(2);
    expect(hashmap.getLoadFactor()).toBeCloseTo(
      hashmap.getSize() / hashmap.getCapacity(),
    );
  });

  it('clears all entries', () => {
    const hashmap = new CustomHashmap<string, boolean>(4, 0.75);

    hashmap.insert('flag', true);
    hashmap.insert('toggle', false);
    hashmap.clear();

    expect(hashmap.getSize()).toBe(0);
    expect(hashmap.get('flag')).toBeUndefined();
  });
});
