import MarkSense from '../../src/core/marksense'
import {describe, it} from 'mocha'
import {expect} from 'chai'

describe('marksense', () => {
  describe('snippet search', () => {
    const code = `
export const nodeCreated = (newNode) => {
  return {
    type: NODE_CREATED,
    nodeId: newNode.id,
    payload: newNode
  };
};

export const nodeUpdated = (updatedNode) => {
  return {
    type: NODE_UPDATED,
    nodeId: updatedNode.id,
    payload: updatedNode
  };
};

export const xplusy = (x, y) => {
  return x + y;
};`

    const markSense = new MarkSense()
    markSense.generateSnippetTree(code)

    it('should return results starting with a two letter ngram', () => {
      const value = `ex`
      const result = markSense.search(value)

      expect(result).to.deep.equal(['export const {name} = ({name}) => {', 'export const {name} = ({name}, {name}) => {'])
    })
  })
})
