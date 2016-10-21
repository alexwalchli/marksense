import MarkSense from '../../src/core/marksense'
import {describe, it} from 'mocha'
import {expect} from 'chai'

describe('marksense', () => {
  describe('generateSnippetTree', () => {
    it('should tokenize code', () => {
      const markSense = new MarkSense()
      const corpus = 'export const removeChildNode = (nodeId, childId) => {'
      const result = markSense.generateSnippetTree(corpus)

      expect(result).to.deep.equal({
        '__ROOT__': {
          depth: 0,
          parent: undefined,
          children: [
            {
              tokenizedCode: 'export const {name} = ({name}, {name}) => {',
              probability: 1,
              count: 1
            }
          ]
        },
        'export const {name} = ({name}, {name}) => {': {
          tokenizedCode: 'export const {name} = ({name}, {name}) => {',
          depth: 1,
          parent: '__ROOT__',
          children: []
        }
      })
    })
    it('should consolidate similar code into a single snippet', () => {
      const markSense = new MarkSense()
      const corpus = `
export const nodeCreated = (newNode) => {
};

export const nodeUpdated = (updatedNode) => {
};`

      const result = markSense.generateSnippetTree(corpus)

      expect(result).to.deep.equal({
        '__ROOT__': {
          depth: 0,
          parent: undefined,
          children: [
            {
              tokenizedCode: 'export const {name} = ({name}) => {',
              probability: 1,
              count: 2
            }
          ]
        },
        'export const {name} = ({name}) => {': {
          tokenizedCode: 'export const {name} = ({name}) => {',
          depth: 1,
          parent: '__ROOT__',
          children: []
        }
      })
    })
  })
  describe('depth', () => {
    it('should return the depth of indentation in code', () => {
      const markSense = new MarkSense()

      const result0 = markSense.depth('it')
      const result1 = markSense.depth('  it(, () => {')
      const result2 = markSense.depth('    it')

      expect(result0).to.equal(1)
      expect(result1).to.equal(2)
      expect(result2).to.equal(3)
    })
  })
})
