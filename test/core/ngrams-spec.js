import nGrams from '../../src/core/ngrams';

describe('nGrams', () => {
  it('should create bigrams', () => {
    const value = 'n-gram',
          result = nGrams(value, 2);

    expect(result).toEqual(['n-', '-g', 'gr', 'ra', 'am']);
  });
  it('should create trigrams', () => {
    const value = 'n-gram',
          result = nGrams(value, 3);

    expect(result).toEqual(['n-g', '-gr', 'gra', 'ram']);
  });
  it('should return value of n is equal to length of value', () => {
    const value = 'n-gram',
          result = nGrams(value, 6);

    expect(result).toEqual(['n-gram']);
  });
});