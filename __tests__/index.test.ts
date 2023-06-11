import * as fs from 'fs';
import * as path from 'path';
import mockFs from 'mock-fs';
import { createMessage, CalculatedMsgram, createFolder, generateFilePath, createOrUpdateComment, run } from '../src/index';
import { Info } from '../src/utils';
import { getInfo } from '../src/utils';  
import Sonarqube from '../src/sonarqube';
import * as core from '@actions/core';
import * as github from '@actions/github';
import * as exec from '@actions/exec';


//  Test createFolder (doesnt check if folder was created, just if the function was called)
jest.mock('fs', () => ({
    ...jest.requireActual('fs'), // This will ensure that all other functions of 'fs' module behave as expected.
    mkdir: jest.fn((_path, _options, callback) => callback(null)), // We mock 'mkdir' function to call the callback with null (i.e., no error).
}));

// Index Tests
describe('Index Tests', () => {

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

    test('should call fs.mkdir with correct arguments', () => {
        const folderPath = './path/to/folder';
        createFolder(folderPath);
        expect(fs.mkdir).toHaveBeenCalledWith(folderPath, { recursive: true }, expect.any(Function));
    });

    test('should log an error message when fs.mkdir encounters an error', () => {
        // This will force 'fs.mkdir' to call the callback with an error.
        (fs.mkdir as unknown as jest.Mock).mockImplementationOnce((_path, _options, callback) => callback(new Error('Test error')));

        const logSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        createFolder('./path/to/folder');

        // Expect 'Error creating folder: Error: Test error', not 'Error creating folder: Test error'
        expect(logSpy).toHaveBeenCalledWith('Error creating folder: Error: Test error');

        logSpy.mockRestore(); // Make sure to restore the spy after use!
    });
    
    test('should generate a correctly formatted file path', () => {
        // Mock date object with a specific time zone offset - The timezone offset is in minutes convert hours to minutes
        const offset = -3; // change this to your timezone offset 
        const currentDate = new Date();
        currentDate.setHours(currentDate.getHours() + offset);
        const result = generateFilePath(currentDate, 'test-repo');
    
        const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getFullYear().toString().padStart(4, '0')}-${currentDate.getHours().toString().padStart(2, '0')}-${currentDate.getMinutes().toString().padStart(2, '0')}`;
        const expected = `./analytics-raw-data/fga-eps-mds-test-repo-${formattedDate}.json`;
        
        expect(result).toEqual(expected);
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

    it('should create a new comment if no existing comment is found', async () => {
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

// // run test suite
// describe('run function', () => {
//     it('should call the expected functions with the correct arguments', async () => {
//       const mockInfo = { /* mock info object */ };
//       const mockMeasures = { /* mock measures object */ };
//       const mockResult = [/* mock result array */];
  
//       // Mock the dependencies
//       (getInfo as jest.Mock).mockReturnValue(mockInfo);
//       (Sonarqube as jest.Mock).mockImplementation(() => ({
//         getMeasures: jest.fn().mockResolvedValue(mockMeasures),
//       }));
//       (fs.writeFile as unknown as jest.Mock).mockImplementation((_path, _data, callback) => callback(null));
//       (exec as unknown as jest.Mock).mockResolvedValue(undefined);
//       (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockResult));
//       (github.getOctokit as jest.Mock).mockReturnValue({
//         rest: {
//           issues: {
//             listComments: jest.fn().mockResolvedValue({ data: [] }),
//             createComment: jest.fn().mockResolvedValue(undefined),
//           },
//         },
//       });
  
//       // Call the function
//       await run();
  
//       // Check if the expected functions were called with the correct arguments
//       expect(getInfo).toHaveBeenCalledWith(github.context.repo);
//       expect(Sonarqube).toHaveBeenCalledWith(mockInfo);
//       expect(fs.writeFile).toHaveBeenCalledWith(expect.any(String), JSON.stringify(mockMeasures), expect.any(Function));
//       expect(exec).toHaveBeenCalledWith('pip', ['install', 'msgram==1.1.0']);
//       expect(exec).toHaveBeenCalledWith('msgram', ['init']);
//       expect(fs.readFileSync).toHaveBeenCalledWith('./.msgram/msgram.json', 'utf8');
//       expect(exec).toHaveBeenCalledWith('msgram', ['extract', '-o', 'sonarqube', '-dp', './analytics-raw-data/', '-ep', '.msgram', '-le', 'py']);
//       expect(exec).toHaveBeenCalledWith('msgram', ['calculate', 'all', '-ep', '.msgram', '-cp', '.msgram/', '-o', 'json']);
//       expect(fs.readFileSync).toHaveBeenCalledWith('.msgram/calc_msgram.json', 'utf8');
//       expect(github.getOctokit).toHaveBeenCalledWith(core.getInput('githubToken', {required: true}));
//       expect(github.context.payload.pull_request).toBeDefined();
//       expect(createMessage).toHaveBeenCalledWith(mockResult);
//       expect(github.getOctokit().rest.issues.createComment).toHaveBeenCalledWith({
//         ...github.context.repo,
//         issue_number: github.context.payload.pull_request.number,
//         body: createMessage(mockResult),
//       });
//     });
  
//     it('should handle errors correctly', async () => {
//       // Mock the dependencies to throw an error
//       (getInfo as jest.Mock).mockImplementation(() => { throw new Error('Test error') });
  
//       // Call the function
//       await run();
  
//       // Check if core.setFailed was called with the correct argument
//       expect(core.setFailed).toHaveBeenCalledWith('Test error');
//     });
//   });
  