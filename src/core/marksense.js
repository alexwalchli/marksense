import nGrams from './ngrams';
import * as acorn from 'acorn';

export default class MarkSense{
  constructor(){
  }

  unescapeHtml(str){
    return str.replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
  }

  // TODO: This can probably be done in a single loop 
  // but will do for a prototype for now.
  generateSnippetTree(corpus){
    const lines = corpus.split(`\n`).filter(line => !(line === null || line.match(/^ *$/) !== null || line.indexOf('}') > -1))
      .map(l => { return {
        code: this.unescapeHtml(l.trim()),
        depth: this.depth(l)
      };
    });

    var tree = {};
    this.searchIndex = {};

    tree.__ROOT__ = {
      depth: 0,
      parent: undefined,
      children: []
    };

    for(let i = 0; i < lines.length; i++){
      const line = lines[i],
            parent = this.getParentFromIndex(lines, i, line.depth),
            tokens = [...acorn.tokenizer(line.code)];

      const originalCodeLength = line.code.length;
      let newCodeLength  = originalCodeLength;
      let tokenOffset = 0;
      tokens.forEach(token => {
        if(token.type.label === 'name'){
          let replaceToken = `{${token.type.label}}`;
          line.code = line.code.slice(0, token.start + tokenOffset) + replaceToken + line.code.slice(token.start + tokenOffset + token.value.length);

          newCodeLength = originalCodeLength + (replaceToken.length - token.value.length);
          tokenOffset = newCodeLength - originalCodeLength;
        }
      });

      const twoLetternGram = line.code.substring(0, 2);
      const threeLetternGram = line.code.substring(0, 3);
      this.searchIndex[twoLetternGram] = this.searchIndex[twoLetternGram] || [];
      this.searchIndex[threeLetternGram] = this.searchIndex[threeLetternGram] || [];
      if(this.searchIndex[twoLetternGram].indexOf(line.code) === -1){
        this.searchIndex[twoLetternGram].push(line.code);
      }
      if(this.searchIndex[threeLetternGram].indexOf(line.code) === -1){
        this.searchIndex[threeLetternGram].push(line.code);
      }

      if(tree[line.code]){
        tree[parent.code].children.find((child) => child.code === line.code).count++;
      } else {
        tree[parent.code].children.push({
          code: line.code,
          probability: 0,
          count: 1
        });
       
        tree[line.code] = {
          depth: line.depth,
          parent: parent.code,
          children: []
        };
      }
    }

    Object.keys(tree).forEach(key => {
      const node = tree[key],
                  childrenCount = node.children.reduce((acc, curr) => {
                    return acc + curr.count;
                  }, 0);
      node.children.forEach(child => {
          child.probability = child.count / childrenCount;
        });
    });

    this.snippetTree = tree;
    
    return tree;
  }

  search(code){
    console.log(this.searchIndex)
    console.log(this.searchIndex[code])
    return this.searchIndex[code];
  }

  getParentFromIndex(lines, idx, currDepth){
    if(currDepth === 1){
      return { code: '__ROOT__', depth: 0};
    }

    // traverse backwards until a node is hit with less depth, it's parent
    for(let i = idx - 1; i >= 0; i--){
      if(lines[i].depth < currDepth){
        return lines[i];
      }
    }
  }

  depth(line){
    return line.split('  ').length;
  }

  // Starting over
  newRootSnippet(rootKey){
    this.rootKey = rootKey;
    this.currentKey = rootKey;
    this.currentSnippets = [ rootKey ];
  }

  // Moving right in intellisense
  getDeeperSnippet(){
    const currentSnippet = this.snippetTree[this.currentKey],
          nextSnippet = currentSnippet.children[0];

    // TODO: If this path is at it's lowest depth', get the neighbor below it
    if(nextSnippet){
      this.currentKey = nextSnippet.code;
      this.currentSnippets.push(nextSnippet.code);     
      return [...this.currentSnippets];
    } else {
      return [...this.currentSnippets];
    }
  }

  // Moving left in intellisense
  getShallowerSnippet(){
    if(this.currentSnippets.length > 1){
      this.currentSnippets.splice(this.currentSnippets.length -1, 1);
      this.currentKey = this.currentSnippets[this.currentSnippets.length - 1];
      return [...this.currentSnippets];
    } else {
      return [];
    }
  }

  // Moving down in intellisense
  getSnippetBelow(){
    const parent = this.snippetTree[this.snippetTree[this.currentKey].parent];
    const indexOfCurrentSnippet = parent.children.map(child => child.code).indexOf(this.currentKey);
    const neighbor = parent.children[indexOfCurrentSnippet + 1];

    if(neighbor){
      this.currentSnippets.splice(this.currentSnippets.length -1, 1); // remove the tail and then
      this.currentSnippets.push(neighbor.code); // add the snippet from one branch over
      this.currentKey = neighbor.code;
    }

    return [...this.currentSnippets];
  }

  // Moving up in intellisense
  getSnippetAbove(){
    if(!currSnippetKey){
      return null;
    }

    const parent = tree[currSnippetKey].parent;

    this.currentSnippets.splice(this.currentSnippets.length -1, 1); // remove the tail and then

    const indexOfChild = parent.children.map(child => child.code).indexOf(this.currentKey);
    
    this.currentSnippets.push(tree[parent.children(parent.children.indexOf(currSnippetKey) - 1)]); // add the snippet from one branch over

    return [...this.currentSnippets];
  }
}