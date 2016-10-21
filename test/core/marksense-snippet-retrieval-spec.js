import MarkSense from '../../src/core/marksense'
import {describe, it} from 'mocha'
import {expect} from 'chai'

describe('marksense', () => {
  describe('snippet retrieval', () => {
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

export const hmmIdk = (y) => {
  const x = y;
};`

    const markSense = new MarkSense()
    markSense.generateSnippetTree(code)

    describe('newRootSnippet', () => {
      it('should set rootKey and currentSnippets', () => {
        const rootKey = `export const {name} = ({name}) => {`

        markSense.newRootSnippet(rootKey)

        expect(markSense.rootKey).to.equal(rootKey)
        expect(markSense.currentSnippets).to.deep.equal([rootKey])
      })
    })

    describe('getDeeperSnippet', () => {
      it('should retrieve a more detailed snippet and set currentKey', () => {
        const rootKey = `export const {name} = ({name}) => {`
        markSense.newRootSnippet(rootKey)

        const result = markSense.getDeeperSnippet(rootKey)

        expect(result).to.deep.equal([rootKey, `return {`])
        expect(markSense.currentKey).to.deep.equal(`return {`)
      })

      it('should return the currentSnippets if there are no children', () => {
        const rootKey = `{name}: {name},`
        markSense.newRootSnippet(rootKey)

        const result = markSense.getDeeperSnippet(rootKey)

        expect(result).to.deep.equal([rootKey])
      })
    })

    describe('getShallowerSnippet', () => {
      it('should return the previous snippet and set currentKey', () => {
        const rootKey = `export const {name} = ({name}) => {`
        markSense.newRootSnippet(rootKey)
        markSense.getDeeperSnippet(rootKey)

        const result = markSense.getShallowerSnippet(rootKey)

        expect(result).to.deep.equal([rootKey])
        expect(markSense.currentKey).to.deep.equal(rootKey)
      })

      it('should return currentSnippets if we are back to the rootKey', () => {
        const rootKey = `export const {name} = ({name}) => {`
        markSense.newRootSnippet(rootKey)
        markSense.getDeeperSnippet()

        markSense.getShallowerSnippet()
        const result = markSense.getShallowerSnippet()

        expect(result).to.deep.equal([rootKey])
        expect(markSense.currentKey).to.deep.equal(rootKey)
      })
    })

    describe('getSnippetBelow', () => {
      it('should retrive the neighbor below the current snippet and set currentKey', () => {
        const rootKey = `export const {name} = ({name}) => {`
        markSense.newRootSnippet(rootKey)
        markSense.getDeeperSnippet()

        const result = markSense.getSnippetBelow()

        expect(result).to.deep.equal([rootKey, `const {name} = {name};`])
        expect(markSense.currentKey).to.deep.equal(`const {name} = {name};`)
      })

      it('should return currentSnippets if theres no neighbor below', () => {
        const rootKey = `export const {name} = ({name}) => {`
        markSense.newRootSnippet(rootKey)
        markSense.getDeeperSnippet()

        markSense.getSnippetBelow()
        const result = markSense.getSnippetBelow()

        expect(result).to.deep.equal([rootKey, `const {name} = {name};`])
        expect(markSense.currentKey).to.deep.equal(`const {name} = {name};`)
      })
    })

    describe('getSnippetAbove', () => {
      it('', () => {

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
