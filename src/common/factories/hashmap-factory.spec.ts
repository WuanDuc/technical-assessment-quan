import { HashmapFactory } from './hashmap-factory';

describe('HashmapFactory', () => {
  it('creates file metadata hashmap with provided capacity and load factor', () => {
    const hashmap = HashmapFactory.createFileMetadataHashmap<string, number>(
      8,
      0.5,
    );

    expect(hashmap.getCapacity()).toBeGreaterThanOrEqual(8);
    expect(hashmap.getLoadFactor()).toBe(0);
  });

  it('creates attachment hashmap with default settings', () => {
    const hashmap = HashmapFactory.createAttachmentHashmap<string, string>();

    expect(hashmap.getCapacity()).toBeGreaterThan(0);
    expect(hashmap.getSize()).toBe(0);
  });

  it('creates custom hashmap with configuration overrides', () => {
    const hashmap = HashmapFactory.createCustomHashmap<string, boolean>({
      initialCapacity: 32,
      loadFactor: 0.6,
    });

    expect(hashmap.getCapacity()).toBeGreaterThanOrEqual(32);
    hashmap.insert('flag', true);
    expect(hashmap.get('flag')).toBe(true);
  });
});
