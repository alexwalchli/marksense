export default (value, n) => {
  let ngrams = [];

  if(value.length === n){
    return [value];
  }

  for(let i = 0; i < value.length - n + 1; i++){
    ngrams.push(value.substring(i, n+i));
  }

  return ngrams;
};