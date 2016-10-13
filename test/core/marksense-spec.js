import MarkSense from '../../src/core/marksense';

describe('marksense', () => {
  it('should a correct chain for a single path', () => {
    const markSense = new MarkSense();
    const corpus = `
A
  B
    C`;

    const result = markSense.generateMarkovChain(corpus);

    expect(result).toEqual({   
      "__ROOT__": {
        depth: 0,
        parent: undefined,
        children: [
          { code: 'A', probability: 1, count: 1 }
        ]
      },
      "A": {
        depth: 1,
        parent: '__ROOT__',
        children: [
          { code: 'B', probability: 1, count: 1 }
        ]
      },
      "B": {
        depth: 2,
        parent: 'A',
        children: [
          { code: 'C', probability: 1, count: 1 }
        ]
      },
      "C": {
        depth: 3,
        parent: 'B',
        children: []
      },
    });
  });

  it('should generate a correct chain when there are multiple children nodes', () => {
    const markSense = new MarkSense();
    const corpus = `
A
  B
    C
    D`;

    const result = markSense.generateMarkovChain(corpus);

    expect(result).toEqual({
       "__ROOT__": {
        depth: 0,
        parent: undefined,
        children: [
          { code: "A", probability: 1, count: 1 }
        ]
      },
      "A": {
        depth: 1,
        parent: '__ROOT__',
        children: [
          { code: "B", probability: 1, count: 1 }
        ]
      },
      "B": {
        depth: 2,
        parent: 'A',
        children: [
          { code: "C", probability: 0.5, count: 1 },
          { code: "D", probability: 0.5, count: 1 }
        ]
      },
      "C": {
        depth: 3,
        parent: 'B',
        children: []
      },
      "D": {
        depth: 3,
        parent: 'B',
        children: []
      }
    });
  });

  it('should generate a correct chain when there are multiple top-level nodes', () => {
    const markSense = new MarkSense();
    const corpus = `
A
  B
    C
    D
E`;

    const result = markSense.generateMarkovChain(corpus);

    expect(result).toEqual({
       "__ROOT__": {
        depth: 0,
        parent: undefined,
        children: [
          { code: "A", probability: 0.5, count: 1 },
          { code: "E", probability: 0.5, count: 1 }
        ]
      },
      "A": {
        depth: 1,
        parent: '__ROOT__',
        children: [
          { code: "B", probability: 1, count: 1 }
        ]
      },
      "B": {
        depth: 2,
        parent: 'A',
        children: [
          { code: "C", probability: 0.5, count: 1 },
          { code: "D", probability: 0.5, count: 1 }
        ]
      },
      "C": {
        depth: 3,
        parent: 'B',
        children: []
      },
      "D": {
        depth: 3,
        parent: 'B',
        children: []
      },
      "E": {
        depth: 1,
        parent: '__ROOT__',
        children: []
      }
    });
  });

  it('should consolidate nodes with same values', () => {
    const markSense = new MarkSense();
    const corpus = `
A
  B
A
  C`;

    const result = markSense.generateMarkovChain(corpus);

    expect(result).toEqual({
       "__ROOT__": {
        depth: 0,
        parent: undefined,
        children: [
          { code: "A", probability: 1, count: 2 }
        ]
      },
      "A": {
        depth: 1,
        parent: '__ROOT__',
        children: [
          { code: "B", probability: 0.5, count: 1 },
          { code: "C", probability: 0.5, count: 1 }
        ]
      },
      "B": {
        depth: 2,
        parent: 'A',
        children: []
      },
      "C": {
        depth: 2,
        parent: 'A',
        children: []
      }
    });
  });

  describe('depth', () => {
    it('should return the depth of indentation in code', () => {
      const markSense = new MarkSense();

      const result0 = markSense.depth('it');
      const result1 = markSense.depth('  it(, () => {');
      const result2 = markSense.depth('    it');

      expect(result0).toEqual(1);
      expect(result1).toEqual(2);
      expect(result2).toEqual(3);
    });
  });

});



