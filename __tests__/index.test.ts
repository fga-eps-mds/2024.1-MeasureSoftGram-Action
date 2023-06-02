import { createMessage, CalculatedMsgram } from '../src/index';

//basic jest test assert true
test('basic', () => {
    expect(true).toBe(true);
});

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
  });
  
