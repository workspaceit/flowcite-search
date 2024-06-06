const { performance } = require('perf_hooks');

const core = require('../../../providers/core');
const doaj = require('../../../providers/doaj');
const elife = require('../../../providers/elife');
const plos = require('../../../providers/plos');
const matchTitle = require('../../../utils/matchTitle');
const tokenize = require('../../../utils/tokenize');
const { STOP_WORDS_EN } = require('../../../constants');
const Cache = require('../../../store/cache');
const Score = require('../../../utils/score');
const natural = require('natural');
var tokenizer = new natural.WordTokenizer();

const handler = async (req, res) => {
  performance.mark('Search');

  const { payload, payloadHash, payloadHashWithPagination, rawTitle, requestedSources: sources } = req;

  let query='';
  let sanitizedQuery='';
  let stopwordsQuery='';

  if(rawTitle||payload.doi){
    if(rawTitle){
      const cachedData = Cache.get(payloadHashWithPagination);
  
      if (cachedData) {
        return res.json(cachedData);
      }
    
      const queryTokens = tokenizer.tokenize(rawTitle)
      // const queryTokens = await tokenize(rawTitle);
      let sanitizedQueryTokens = queryTokens.filter((x) => !STOP_WORDS_EN.includes(x));
    
      let stopwordsFilterTokens = sanitizedQueryTokens;
    
      // Original query might consist of all stop words, in such case consider original
      // queryTokens as sanitizedQueryTokens.
      if (sanitizedQueryTokens.length < 1) {
        sanitizedQueryTokens = queryTokens;
      }else{
        sanitizedQueryTokens = natural.PorterStemmer.tokenizeAndStem(rawTitle)
      }
    
      query = queryTokens.filter((x) => !x.startsWith('-')).join(' ');
      sanitizedQuery = sanitizedQueryTokens.filter((x) => !x.startsWith('-')).join(' ');
      stopwordsQuery = stopwordsFilterTokens.filter((x) => !x.startsWith('-')).join(' ');
    
      console.log(`[PRE-PROCESSING] Query: ${query},Stopwords: ${stopwordsQuery}, Sanitized: ${sanitizedQuery}`);
    }
  }else{
    const responseObj = {
      success:true,
      count:0,
      data: [],
    };
    return res.json(responseObj);
  }
  
  
  const providerCalls = [];

  const noSource = !sources || !sources.length;

  if (noSource || sources.includes('core')) {
    //Original query string
    providerCalls.push(core({ ...payload, query }));
    //Stopword filter string
    providerCalls.push(core({ ...payload, query: stopwordsQuery }));
    //Stemming query string
    if(sanitizedQuery!=stopwordsQuery){
      providerCalls.push(core({ ...payload, query: sanitizedQuery }));
    }
    
  }

  if (noSource || sources.includes('doaj')) {
    //Original query string
    providerCalls.push(doaj({ ...payload, query }));
    //Stopword filter string
    providerCalls.push(doaj({ ...payload, query: stopwordsQuery }));
    //Stemming query string
    if(sanitizedQuery!=stopwordsQuery){
      providerCalls.push(doaj({ ...payload, query: sanitizedQuery }));
    }
  }

  if (noSource || sources.includes('elife')) {
    //Original query string
    providerCalls.push(elife({ ...payload, query }));
    //Stopword filter string
    providerCalls.push(elife({ ...payload, query: stopwordsQuery }));
    //Stemming query string
    if(sanitizedQuery!=stopwordsQuery){
      providerCalls.push(elife({ ...payload, query: sanitizedQuery }));
    }
  }

  if (noSource || sources.includes('plos')) {
    //Original query string
    providerCalls.push(plos({ ...payload, query }));
    //Stopword filter string
    providerCalls.push(plos({ ...payload, query: stopwordsQuery }));
    if(sanitizedQuery!=stopwordsQuery){
      providerCalls.push(plos({ ...payload, query: sanitizedQuery }));
    }
  }

  const results = await Promise.all(providerCalls);

  const flatResults = results.map((x) => x.data).flat();

  const uniqueResults = [];
  const seenItems = [];

  for (let i=0; i<flatResults.length; ++i) {
    const publicationType = flatResults[i].publication_type
    const pdfUrl = flatResults[i].original_pdf_link

    if(pdfUrl && pdfUrl.endsWith(".pdf")){
      
    if(payload.publicationType && payload.publicationType.length>0){
      if(payload.publicationType.includes(publicationType.trim())){
        const identifier = flatResults[i].id;
        const doi = flatResults[i].doi;
        const title = flatResults[i].title;
    
        if ((identifier && seenItems.includes(identifier)) || (doi && seenItems.includes(doi)) || (title && seenItems.includes(title))) {
          continue;
        }
    
        if (identifier) {
          seenItems.push(identifier);
        }
    
        if (doi) {
          seenItems.push(doi);
        }
    
        if (title) {
          seenItems.push(title);
        }
    
        uniqueResults.push(flatResults[i]);
      }
    }else{
      const identifier = flatResults[i].id;
      const doi = flatResults[i].doi;
      const title = flatResults[i].title;

      if ((identifier && seenItems.includes(identifier)) || (doi && seenItems.includes(doi)) || (title && seenItems.includes(title))) {
        continue;
      }

      if (identifier) {
        seenItems.push(identifier);
      }

      if (doi) {
        seenItems.push(doi);
      }

      if (title) {
        seenItems.push(title);
      }

      uniqueResults.push(flatResults[i]);
    }
    }
    
  }
  
  const data = Score(uniqueResults, query);

  // scoredResults.sort((a, b) => (b.score > a.score) ? 1 : ((a.score > b.score) ? -1 : 0));

  // const data = scoredResults.filter((x) => matchTitle(x, queryTokens, sanitizedQueryTokens));
  // const count = results.map((x) => x.count).reduce((a, b) => a + b);
  const count = data.length;

  performance.measure('Search to Now', 'Search');

  const responseObj = {
    success:true,
    count,
    data: data, //.map((x) => x.title),
  };

  Cache.set(payloadHashWithPagination, responseObj);

  return res.json(responseObj);
};

module.exports = handler;
