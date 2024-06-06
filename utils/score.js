const Fuse = require('fuse.js')

const score = (data, query) => {

  const options = {
    // isCaseSensitive: false,
    includeScore: true,
    shouldSort: true,
    includeMatches: true,
    // findAllMatches: true,
    // minMatchCharLength: 1,
    // location: 0,
    // threshold: 0.6,
    // distance: 100,
    // useExtendedSearch: false,
    // ignoreLocation: false,
    // ignoreFieldNorm: false,
    keys: [
      "abstract",
      "title"
    ]
  };
  
  const fuse = new Fuse(data, options);

  // Change the pattern
  const pattern = query
  
  let result = fuse.search(pattern)
  let filteredData=[];
  for (let i=0; i<result.length; ++i) {
    result[i]['item']['providerScore'] = result[i]['item']['score'];
    result[i]['item']['score'] = result[i]['score'];
    result[i]['item']['matches'] = result[i]['matches'];
    filteredData.push(result[i]['item'])
  }

  if(filteredData.length>0){
    return filteredData;
  }else{
    return data;
  }

  

};

module.exports = score;
