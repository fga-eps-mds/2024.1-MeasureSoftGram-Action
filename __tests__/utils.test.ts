import * as core from '@actions/core';
import { getInfo, Info } from '../src/utils';

jest.mock('@actions/core');

describe('getInfo', () => {
  const mockedCore = core as jest.Mocked<typeof core>;

  beforeEach(() => {
    // Clear all instances and calls to mocked functions:
    mockedCore.getInput.mockClear();
  });

  test('should return correct Info object', () => {
    const repo = { owner: 'testOwner', repo: 'testRepo' };

    // Mocking core.getInput calls
    mockedCore.getInput.mockImplementation((inputName: string) => {
      switch(inputName) {
        case 'projectKey': return 'mockProjectKey';
        case 'host': return 'mockHost';
        case 'token': return 'mockToken';
        default: return '';
      }
    });

    const expectedInfo: Info = {
      project: { projectKey: 'mockProjectKey' },
      host: 'mockHost',
      token: 'mockToken',
    };

    expect(getInfo(repo)).toEqual(expectedInfo);
  });

  test('should use default projectKey if not provided', () => {
    const repo = { owner: 'testOwner', repo: 'testRepo' };

    // Mocking core.getInput calls
    mockedCore.getInput.mockImplementation((inputName: string) => {
      switch(inputName) {
        case 'host': return 'mockHost';
        case 'token': return 'mockToken';
        default: return '';
      }
    });

    const expectedInfo: Info = {
      project: { projectKey: `${repo.owner}_${repo.repo}` },
      host: 'mockHost',
      token: 'mockToken',
    };

    expect(getInfo(repo)).toEqual(expectedInfo);
  });
});
