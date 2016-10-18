import nGrams from '../../src/core/ngrams';
import {expect} from 'chai';

describe('nGrams', () => {
  it('should create bigrams', () => {
    const value = 'n-gram',
          result = nGrams(value, 2);

    expect(result).to.deep.equal(['n-', '-g', 'gr', 'ra', 'am']);
  });

  it('should create trigrams', () => {
    const value = 'n-gram',
          result = nGrams(value, 3);

    expect(result).to.deep.equal(['n-g', '-gr', 'gra', 'ram']);
  });

  it('should return value if n is equal to or greater than length of value', () => {
    const value = 'n-gram',
          result = nGrams(value, 6);

    expect(result).to.deep.equal(['n-gram']);
  });

  it('should create an ngram even if the size of the ngram is larger than the value', () => {
    const value = 'A',
          result = nGrams(value, 2);

    expect(result).to.deep.equal(['A']);
  });
});