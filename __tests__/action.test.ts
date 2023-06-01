// action.test.ts

import { createFolder, generateFilePath, createMessage, CalculatedMsgram } from '../src/index'
import fs from 'fs';

jest.mock('fs');

describe('createFolder', () => {
    it('calls mkdir with correct arguments', () => {
        createFolder('./analytics-raw-data');

        expect(fs.mkdir).toHaveBeenCalledWith('./analytics-raw-data', { recursive: true }, expect.any(Function));
    });
});

describe('generateFilePath', () => {
    it('returns correct file path', () => {
        const date = new Date('2023-05-31T00:00:00');
        const repo = 'my-repo';

        const path = generateFilePath(date, repo);

        expect(path).toBe('./analytics-raw-data/fga-eps-mds-my-repo-31-05-2023-00-00.json');
    });
});

describe('createMessage', () => {
    it('returns correct message', () => {
        const result: CalculatedMsgram[] = [
            {
                repository: [{ key: 'repo', value: 'my-repo' }],
                version: [{ key: 'version', value: '1.0.0' }],
                measures: [{ key: 'measure', value: 50 }],
                subcharacteristics: [{ key: 'subcharacteristic', value: 5 }],
                characteristics: [{ key: 'characteristic', value: 10 }],
                sqc: [{ key: 'sqc', value: 2 }],
            },
        ];

        const message = createMessage(result);

        expect(message).toBe(`
    ## Sonarqube Analysis Results

    ### SQC Values

    2

    ### Characteristics Values

    * **characteristic**: 10`.trim().replace(/^\s+/gm, ''));
    });
});
