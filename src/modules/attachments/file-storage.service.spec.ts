import { InternalServerErrorException } from '@nestjs/common';
import { join, dirname } from 'path';
import { FileStorageService } from './file-storage.service';

jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn(),
    rename: jest.fn(),
    unlink: jest.fn(),
    access: jest.fn(),
  },
}));

type FsPromises = typeof import('fs').promises;
type MockedFsPromises = {
  [Key in keyof FsPromises]: FsPromises[Key] extends (
    ...args: never[]
  ) => unknown
    ? jest.Mock<ReturnType<FsPromises[Key]>, Parameters<FsPromises[Key]>>
    : FsPromises[Key];
};

const fsModule: { promises: MockedFsPromises } = jest.requireMock('fs');
const { promises } = fsModule;
const mkdirMock = promises.mkdir;
const renameMock = promises.rename;
const unlinkMock = promises.unlink;
const accessMock = promises.access;

describe('FileStorageService', () => {
  let service: FileStorageService;

  beforeEach(() => {
    jest.clearAllMocks();
    mkdirMock.mockResolvedValue(undefined);
    renameMock.mockResolvedValue(undefined);
    unlinkMock.mockResolvedValue(undefined);
    accessMock.mockResolvedValue(undefined);
    service = new FileStorageService();
  });

  it('relocates files and removes the original source', async () => {
    const source = join('temp', 'original.txt');
    const destination = join('uploads', 'product', 'final.txt');

    await service.moveFile(source, destination);

    const expectedSource = join(process.cwd(), source);
    const expectedDestination = join(process.cwd(), destination);
    expect(mkdirMock).toHaveBeenCalledWith(dirname(expectedDestination), {
      recursive: true,
    });
    expect(renameMock).toHaveBeenCalledWith(
      expectedSource,
      expectedDestination,
    );
    expect(unlinkMock).toHaveBeenCalledWith(expectedSource);
  });

  it('does not attempt relocation when paths match', async () => {
    const path = join('uploads', 'product', 'same.txt');

    await service.moveFile(path, path);

    expect(mkdirMock).not.toHaveBeenCalled();
    expect(renameMock).not.toHaveBeenCalled();
    expect(unlinkMock).not.toHaveBeenCalled();
  });

  it('ignores missing source files during cleanup', async () => {
    const error = Object.assign(new Error('not found'), { code: 'ENOENT' });
    unlinkMock.mockRejectedValueOnce(error);

    await expect(
      service.moveFile('temp/source.txt', 'uploads/destination.txt'),
    ).resolves.toBeUndefined();

    expect(renameMock).toHaveBeenCalledTimes(1);
    expect(unlinkMock).toHaveBeenCalledTimes(1);
  });

  it('wraps unexpected errors in InternalServerErrorException', async () => {
    renameMock.mockRejectedValueOnce(new Error('rename failed'));

    await expect(
      service.moveFile('temp/source.txt', 'uploads/destination.txt'),
    ).rejects.toBeInstanceOf(InternalServerErrorException);

    expect(unlinkMock).not.toHaveBeenCalled();
  });
});
