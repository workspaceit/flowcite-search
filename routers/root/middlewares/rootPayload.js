const md5 = require('../../../utils/md5');
const axios = require('axios');


const middleware = async (req, res, next) => {
  const rawPayload = req.body;

  const token = req.headers['authorization']
  
  const config = {
    method: 'GET',
    // url: 'https://develop.flowcite.com/search/search-limit-check',
    url: 'https://stage.flowcite.com/search/search-limit-check',
    headers: { 'Authorization': token }
    }

  const response = await axios(config)

  if(response && response.data){
    if(!response.data.success){
        const responseObj = {
          success:false,
          message: "Your search limit has been reached",
          cd_ends_at:response.data.cd_ends_at,
          searchCount:response.data.count,
          count: 0,
          data: [], 
        };
    
      return res.json(responseObj);
    }
  }


  req.rawTitle = rawPayload.title ? rawPayload.title.toLowerCase() : rawPayload.title;

  const payload = {
    abstract: rawPayload.abstract,
    subject: rawPayload.subject,
    author: rawPayload.author,
    doi: rawPayload.doi,
    fromDate: rawPayload.publish_date_from,
    isbn: rawPayload.isbn,
    publisher: rawPayload.publisher,
    title: rawPayload.exactTitle,
    toDate: rawPayload.publish_date_to,
    rawTitle: req.rawTitle,
    publicationType:rawPayload.publication_type
  };

  req.payloadHash = md5(payload);

  payload.page = rawPayload.page;

  req.payloadHashWithPagination = md5({ ...payload, sources: rawPayload.source });

  req.payload = payload;
  let source = rawPayload.source;

  /**Doaj does not support isbn, subjects, publicationType */
  if(payload.isbn||payload.subject||payload.publicationType.length>0){
    const doajIndex = source.indexOf("doaj");
    if (doajIndex > -1) {
      source.splice(doajIndex, 1);
    }
    req.requestedSources = source;
  }

  /**Elife does not support abstract,subject,author,isbn,doi,publisher,publicationType */
  if(payload.abstract||payload.title||payload.subject||payload.author||payload.isbn||payload.doi||payload.publisher||payload.publicationType.length>0){
    const elifeIndex = source.indexOf("elife");
    if (elifeIndex > -1) {
      source.splice(elifeIndex, 1);
    }
    req.requestedSources = source;
  }
  
  /**Plos does not support abstract,subject,author,publisher, publicationType.length>0 */
  if(payload.abstract||payload.subject||payload.author||payload.publisher||payload.publicationType.length>0){
    const plosIndex = source.indexOf("plos");
      if (plosIndex > -1) {
        source.splice(plosIndex, 1);
      }
    req.requestedSources = source;
  }
  
  // if(payload.publicationType.length>0){
  //   /**Plos only work for Correction and Research Article */
  //   //Check for plos
  //   if(payload.publicationType.includes("Correction")||payload.publicationType.includes("Research Article")){
  //     req.requestedSources = source;
  //   }else{
  //     const plosIndex = source.indexOf("plos");
  //     if (plosIndex > -1) {
  //       source.splice(plosIndex, 1);
  //     }
  //     req.requestedSources = source;
  //   }
  // }

  const queryLimit = {
    core:120,
    doaj:40,
    elife:40,
    plos:40
  }


  if (source.length<4) {
    let totalLimitDistributionQuantity = 0;
    let totalLength = 0;
    for (const [key, value] of Object.entries(queryLimit)) {
      if(source.indexOf(key) < 0){
        totalLimitDistributionQuantity += value
        queryLimit[key] = 0;
      }
    }

    let limitDistributionQuantity = Math.floor(totalLimitDistributionQuantity/source.length)
    for (const [key, value] of Object.entries(queryLimit)) {
      if(value > 0){
        queryLimit[key] = value+limitDistributionQuantity
      }
    }
  }
  
  payload.queryLimit = queryLimit

  return next();
};

module.exports = middleware;
