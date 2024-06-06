const axios = require('axios').default;
const { performance } = require('perf_hooks');
const uuid = require('uuid');

const { v4: uuidv4 } = uuid;

const request = axios.create({
  baseURL: 'https://core.ac.uk:443/api-v2',
});

const buildQueryParam = ({
  abstract,
  subject,
  author,
  doi,
  fromDate,
  isbn,
  publisher,
  publicationType,
  query,
  title,
  toDate,
}) => {
  let qp = 'downloadUrl:["" TO *] AND ';

  if (abstract) {
    qp += `description:"${abstract}" AND `;
  }
  
  if (subject) {
    qp += `topics:"${subject}" AND `;
  }
  
  if (author) {
    qp += `authors:"${author}" AND `;
  }

  if (isbn) {
    qp += `identifiers:"${isbn}" AND `;
  }

  if (doi) {
    qp += `doi:"${doi}" AND `;
  }

  if (fromDate) {
    qp += `datePublished:>${fromDate} AND `;
  }

  if (publisher) {
    qp += `publisher:"${publisher}" AND `;
  }

  if (query) {
    qp += `(title:"${query}" OR authors:"${query}" OR description:"${query}" OR fullText:"${query}" OR publisher:"${query}") AND `;
  }

  if (title) {
    qp += `title:"${title}" AND `;
  }

  if (toDate) {
    qp += `datePublished:<${toDate} AND `;
  }

  if (publicationType.length>0) {
    let publicationString ="";
    for (let i = 0; i < publicationType.length; i++) {
      publicationString += `subjects:"${publicationType[i]}" `;
      if(i==publicationType.length-1){
      }else{
        publicationString += "OR ";
      }
    }
    // console.log(publicationString)
    qp += `(${publicationString})`;
  }

  return qp.replace(/ AND $/, '');
};

const normalize = (sourceObj) => {
  const article = sourceObj._source;
  const score = sourceObj._score;
  const articleId = `CORE${sourceObj._id}`;
  const newArticle = {};
  newArticle.abstract = article.description;
  newArticle.authors = article.authors;
  newArticle.doi = article.doi;
  newArticle.guid = uuidv4();
  newArticle.id = articleId;
  newArticle.original_pdf_link = article.downloadUrl;
  newArticle.publication_type = article.subjects && article.subjects.length ? article.subjects[0] : null;
  newArticle.published_date = article.datePublished;
  newArticle.publisher = article.publisher;
  newArticle.score = score;
  newArticle.source = 'CORE';
  newArticle.subjects = article.topics;
  newArticle.title = article.title;

  return newArticle;
};

module.exports = async (payload) => {
  performance.mark('CORE Start');

  const qp = buildQueryParam(payload);

  const queryParams = {
    page: payload.page,
    pageSize: payload.queryLimit.core,
    apiKey: 'sO204ZtUnWYR1JM5PerKguE9BTvNAmhI',
  };
  // console.log(encodeURIComponent(qp))
  let data;

  try {
    const res = await request.get(`/search/${encodeURIComponent(qp)}`, { params: queryParams });
    data = res.data;
  } catch (err) {
    console.log('[CORE]', err);
    data = {
      status: 'Failed',
    };
  }

  const {
    data: result,
    status,
    totalHits,
  } = data;

  if (status !== 'OK') {
    performance.measure('CORE Start to Now', 'CORE Start');

    return {
      count: totalHits,
      data: [],
    };
  }

  for(let i=0; i<result.length; i+=1) {
    result[i] = normalize(result[i]);
  }

  performance.measure('CORE Start to Now', 'CORE Start');

  return {
    count: totalHits,
    data: result,
  };
};
