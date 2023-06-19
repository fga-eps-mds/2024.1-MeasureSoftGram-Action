import * as github from '@actions/github';
import GithubComment from '../src/github/github-comment';
import { CalculatedMsgram } from '../src/service/service';

jest.mock('@actions/github', () => ({
    getOctokit: jest.fn(),
    context: {
        repo: {
            owner: 'owner',
            repo: 'repo',
        },
    },
}));

describe('Create message Tests', () => {

    // create a before each to reset the mocks after each test and set the mock data
    beforeEach(() => {

        jest.resetAllMocks();
    });

    test('should create a message correctly', () => {
        const mockData: CalculatedMsgram = {
            repository: [{ key: 'mockRepo', value: 'mockValue' }],
            version: [{ key: 'mockVersion', value: '1.0.0' }],
            measures: [{ key: 'mockMeasure', value: 100 }],
            subcharacteristics: [{ key: 'mockSubCharacteristic', value: 10 }],
            characteristics: [{ key: 'mockCharacteristic', value: 20 }],
            sqc: [{ key: 'mockSqc', value: 30 }],
        };
        
        const githubComment = new GithubComment();
        const result = githubComment.createMessage([mockData]);
    
        expect(result).toContain('## MeasureSoftGram Analysis Results');
        expect(result).toContain('### SQC Values');
        expect(result).toContain(mockData.sqc[0].value.toFixed(2));
        expect(result).toContain('### Characteristics Values');
        expect(result).toContain(`* **${mockData.characteristics[0].key}**: ${mockData.characteristics[0].value.toFixed(2)}`);
    });

});

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

        const githubComment = new GithubComment();
        await githubComment.createOrUpdateComment(1, 'Test message', mockOctokit);

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

        const githubComment = new GithubComment();
        await githubComment.createOrUpdateComment(1, 'Test message', mockOctokit);

        expect(mockOctokit.rest.issues.createComment).toHaveBeenCalledWith({
            ...github.context.repo,
            issue_number: 1,
            body: 'Test message',
        });
        expect(mockOctokit.rest.issues.updateComment).not.toHaveBeenCalled();
    });
});