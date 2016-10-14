import nGrams from './ngrams';

export default class MarkSense{
  constructor(){
  }

  // TODO: This can probably be done in a single loop 
  // but will do for a prototype for now.
  // TODO: consolidate lines of code based on form not content
  //  ex: "it('should do something', () => {" and "it('and also do something else', () => {"
  //      should be consolidated into "it('{variable}', () =>"
  generateSnippetSuggestionTree(corpus){
    const lines = corpus.split(`\n`).filter(line => !(line === null || line.match(/^ *$/) !== null || line.indexOf('}') > -1))
      .map(l => { return {
        code: l.trim(),
        depth: this.depth(l)
      };
    });

    var tree = {};
    tree['__ROOT__'] = {
      depth: 0,
      children: [],
      parent: undefined,
      ngrams: []
    };

    for(let i = 0; i < lines.length; i++){
      const line = lines[i],
            parent = this.getParentFromIndex(lines, i, line.depth);

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
          children: [],
          ngrams: nGrams(line.code, 2)
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

    this.snippetSuggestionTree = tree;

    return tree;
  }

  getSnippetSuggestions(code){
    let suggestions = [];
    Object.keys(this.snippetSuggestionTree).forEach(key => {
      let snippet = this.snippetSuggestionTree[key];
      if(key.startsWith(code) || snippet.ngrams.includes(code)){
        suggestions.push({
          snippet: key,
          next: snippet.children,
          prev: snippet.parent
        });
      }
    });

    return suggestions;
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
}