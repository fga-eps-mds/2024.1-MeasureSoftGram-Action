import * as fs from 'fs';
import * as path from 'path';
import mockFs from 'mock-fs';
import { createMessage, CalculatedMsgram, createFolder, generateFilePath, } from '../src/index';
// github action context
process.env.GITHUB_REPOSITORY = 'msgram/msgram-action';

//basic jest test assert true
test('basic', () => {
    expect(true).toBe(true);
});

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

        expect(result).toContain('## Sonarqube Analysis Results');
        expect(result).toContain('### SQC Values');
        expect(result).toContain(mockData.sqc[0].value.toString());
        expect(result).toContain('### Characteristics Values');
        expect(result).toContain(`* **${mockData.characteristics[0].key}**: ${mockData.characteristics[0].value}`);

        // Check structure of the message
        const splitResult = result.split('\n');
        expect(splitResult[0]).toBe('## Sonarqube Analysis Results');
        expect(splitResult[1]).toBe('### SQC Values');
        expect(splitResult[2]).toBe(mockData.sqc[0].value.toString());
        expect(splitResult[3]).toBe('### Characteristics Values');
        expect(splitResult[4]).toBe(`* **${mockData.characteristics[0].key}**: ${mockData.characteristics[0].value}`);
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

