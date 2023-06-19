import * as fs from 'fs';
import * as path from 'path';
import mockFs from 'mock-fs';
import { createMessage, CalculatedMsgram, createOrUpdateComment, run } from '../src/index';
import { Info } from '../src/utils';
import { getInfo } from '../src/utils';  
import Sonarqube from '../src/sonarqube';
import * as core from '@actions/core';
import * as github from '@actions/github';
import * as exec from '@actions/exec';
import { SaveService } from '../src/save_service';
import { Octokit } from '@octokit/rest';
import { getOctokit } from '@actions/github';

//  Test createFolder (doesnt check if folder was created, just if the function was called)
jest.mock('fs', () => ({
    ...jest.requireActual('fs'), // This will ensure that all other functions of 'fs' module behave as expected.
    mkdir: jest.fn((_path, _options, callback) => callback(null)), // We mock 'mkdir' function to call the callback with null (i.e., no error).
}));

jest.mock('fs', () => ({
    ...jest.requireActual('fs'),
    mkdir: jest.fn((_path, _options, callback) => callback(null)),
}));

jest.mock('@actions/github', () => ({
    getOctokit: jest.fn(),
    context: {
        repo: {
            owner: 'owner',
            repo: 'repo',
        },
    },
}));

jest.mock('../src/save_service', () => ({
    SaveService: jest.fn().mockImplementation(() => ({
        setMsgramServiceHost: jest.fn(),
        setMsgToken: jest.fn(),
        getBaseUrl: jest.fn(),
        getMsgToken: jest.fn(),
        listOrganizations: jest.fn(),
        listProducts: jest.fn(),
        listRepositories: jest.fn(),
        listReleases: jest.fn(),
        createMetrics: jest.fn(),
        calculateMeasures: jest.fn(),
        calculateCharacteristics: jest.fn(),
        calculateSubCharacteristics: jest.fn(),
        calculateSQC: jest.fn(),
    })),
}));

// describe('Index run Tests', () => {
//     beforeEach(() => {
//         (getOctokit as jest.MockedFunction<typeof getOctokit>).mockImplementation((token: string) => {
//             const octokit = new Octokit({ auth: token });
//             octokit.repos.get = jest.fn().mockRejectedValue(new Error('Organization owner does not exist.'));
//             return octokit;
//         });

//         jest.spyOn(core, 'setFailed').mockImplementation(() => {});
//         jest.spyOn(core, 'getInput').mockImplementation(() => '');
//     });

//     // ...

//     test('should run without errors', async () => {
//         const mockSaveService = {
//             setMsgramServiceHost: jest.fn(),
//             setMsgToken: jest.fn(),
//             getBaseUrl: jest.fn(),
//             getMsgToken: jest.fn(),
//             listOrganizations: jest.fn().mockResolvedValue({
//                 results: [
//                     { name: 'owner', id: 1 },
//                 ],
//             }),
//             listProducts: jest.fn().mockResolvedValue({
//                 results: [
//                     { name: 'product', id: 1 },
//                 ],
//             }),
//             listRepositories: jest.fn().mockResolvedValue({
//                 results: [
//                     { name: 'repo', id: 1 },
//                 ],
//             }),
//             listReleases: jest.fn().mockResolvedValue([
//                 {
//                     start_at: '2023-06-17T00:00:00Z',
//                     end_at: '2023-06-19T00:00:00Z',
//                     id: 1,
//                 },
//             ]),
//             createMetrics: jest.fn(),
//             calculateMeasures: jest.fn().mockResolvedValue({
//                 data: [],
//             }),
//             calculateCharacteristics: jest.fn().mockResolvedValue({
//                 data: [],
//             }),
//             calculateSubCharacteristics: jest.fn().mockResolvedValue({
//                 data: [],
//             }),
//             calculateSQC: jest.fn().mockResolvedValue({
//                 data: {
//                     value: 1,
//                 },
//             }),
//         };

//         (SaveService as jest.MockedClass<typeof SaveService>).mockImplementationOnce(() => mockSaveService);

//         // ...

//         await run();

//         // ...
//     });

//     test('should throw error if organization does not exist', async () => {
//         await run();

//         expect(core.setFailed).toHaveBeenCalledWith('Organization owner does not exist.');
//     });

//     // ...
// });


describe('Create message Tests', () => {

    test('should create a message correctly', () => {
        const mockData: CalculatedMsgram = {
            repository: [{ key: 'mockRepo', value: 'mockValue' }],
            version: [{ key: 'mockVersion', value: '1.0.0' }],
            measures: [{ key: 'mockMeasure', value: 100 }],
            subcharacteristics: [{ key: 'mockSubCharacteristic', value: 10 }],
            characteristics: [{ key: 'mockCharacteristic', value: 20 }],
            sqc: [{ key: 'mockSqc', value: 30 }],
        };
    
        const result = createMessage([mockData]);
    
        expect(result).toContain('## MeasureSoftGram Analysis Results');
        expect(result).toContain('### SQC Values');
        expect(result).toContain(mockData.sqc[0].value.toFixed(2));
        expect(result).toContain('### Characteristics Values');
        expect(result).toContain(`* **${mockData.characteristics[0].key}**: ${mockData.characteristics[0].value.toFixed(2)}`);
    
        // Check structure of the message
        const splitResult = result.split('\n');
        expect(splitResult[0]).toBe('## MeasureSoftGram Analysis Results');
        expect(splitResult[1]).toBe('### SQC Values');
        expect(splitResult[2]).toBe(mockData.sqc[0].value.toFixed(2));
        expect(splitResult[3]).toBe('### Characteristics Values');
        expect(splitResult[4]).toBe(`* **${mockData.characteristics[0].key}**: ${mockData.characteristics[0].value.toFixed(2)}`);
    });

});

jest.mock('@actions/github');

describe('createOrUpdateComment function', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    test('should update the existing comment', async () => {
        const mockOctokit = {
            rest: {
                issues: {
                    listComments: jest.fn().mockResolvedValue({
                        data: [
                            {
                                user: {
                                    login: 'github-actions[bot]',
                                },
                                body: '## MeasureSoftGram Analysis Results',
                                id: '123',
                            },
                        ],
                    }),
                    updateComment: jest.fn(),
                    createComment: jest.fn(),
                },
            },
        };

        await createOrUpdateComment(1, 'Test message', mockOctokit);

        expect(mockOctokit.rest.issues.updateComment).toHaveBeenCalledWith({
            ...github.context.repo,
            comment_id: '123',
            body: 'Test message',
        });
        expect(mockOctokit.rest.issues.createComment).not.toHaveBeenCalled();
    });

    test('should create a new comment if no existing comment is found', async () => {
        const mockOctokit = {
            rest: {
                issues: {
                    listComments: jest.fn().mockResolvedValue({ data: [] }),
                    updateComment: jest.fn(),
                    createComment: jest.fn(),
                },
            },
        };

        await createOrUpdateComment(1, 'Test message', mockOctokit);

        expect(mockOctokit.rest.issues.createComment).toHaveBeenCalledWith({
            ...github.context.repo,
            issue_number: 1,
            body: 'Test message',
        });
        expect(mockOctokit.rest.issues.updateComment).not.toHaveBeenCalled();
    });
});
