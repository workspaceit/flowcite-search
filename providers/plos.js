const axios = require('axios').default;
const moment = require('moment');
const { performance } = require('perf_hooks');
const uuid = require('uuid');

const { v4: uuidv4 } = uuid;

const request = axios.create({
  baseURL: 'http://api.plos.org/',
});

const buildQueryParam = ({
  doi,
  fromDate,
  isbn,
  query,
  title,
  toDate
}) => {
  let qp = 'title:["" TO *] AND ';

  if (isbn) {
    qp += `(eissn:"${isbn}" OR issn:"${isbn}") AND `;
  }

  if (doi) {
    qp += `id:${doi} AND `;
  } 

  if (fromDate && toDate) {
    qp += `publication_date:[${moment(fromDate).toISOString()} TO ${moment(toDate).toISOString()}] AND `;
  }

  if (query) {
    qp += `(title:"${query}" OR title_display:"${query}" OR author_display:"${query}" OR id:${query}) AND `;
  }

  if (title) {
    qp += `(title:"${title}" OR title_display:"${title}") AND `;
  }

  return qp.replace(/ AND $/, '');
};

const normalize = (sourceObj) => {
  const article = sourceObj;
  const score = sourceObj.score;
  const articleId = `PLOS${sourceObj.id}`;
  const newArticle = {};
  newArticle.abstract = article.abstract ? article.abstract.join('\n').trim() : null;
  newArticle.authors = article.author_display;
  newArticle.doi = article.id;
  newArticle.guid = uuidv4();
  newArticle.id = articleId;
  newArticle.original_pdf_link = `https://journals.plos.org/plosone/article/file?id=${article.id}&type=printable`;
  newArticle.publication_type = article.article_type;
  newArticle.published_date = article.publication_date.substr(0, 10);
  newArticle.publisher = article.journal;
  newArticle.score = score;
  newArticle.source = 'PLOS';
  newArticle.subjects = [];
  newArticle.title = article.title_display;

  return newArticle;
};

module.exports = async (payload) => {
  performance.mark('PLOS Start');

  const qp = buildQueryParam(payload);

  const queryParams = {
    q: qp,
    rows: payload.queryLimit.plos,
    start: payload.page - 1,
  };

  let data;

  try {
    const res = await request.get('/search', { params: queryParams });
    data = res.data;
  } catch (err) {
    // console.log('[PLOS]', Object.keys(err), queryParams);
    data = {
      response: null,
    };
  }

  if (!(data.response && data.response.docs)) {
    performance.measure('PLOS Start to Now', 'PLOS Start');

    return {
      count: 0,
      data: [],
    };
  }

  const {
    response: {
      docs,
      numFound,
    },
  } = data;

  for(let i=0; i<docs.length; i+=1) {
    docs[i] = normalize(docs[i]);
  }

  performance.measure('PLOS Start to Now', 'PLOS Start');

  return {
    count: numFound,
    data: docs,
  };
};
