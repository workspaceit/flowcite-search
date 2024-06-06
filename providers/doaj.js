const axios = require('axios').default;
const moment = require('moment');
const { performance } = require('perf_hooks');
const uuid = require('uuid');

const { v4: uuidv4 } = uuid;

const request = axios.create({
  baseURL: 'https://doaj.org/api/v2/',
});

const buildQueryParam = ({
  abstract,
  author,
  doi,
  fromDate,
  publisher,
  query,
  title,
  toDate,
}) => {
  let qp = 'bibjson.link.url:.pdf AND ';


  if (abstract) {
    qp += `bibjson.abstract:"${abstract}" AND `;
  }

  if (author) {
    qp += `bibjson.author.name:"${author}" AND `;
  }

  if (doi) {
    qp += `doi:${doi} AND `;
  }

  if (fromDate && toDate) {
    qp += `year:[${fromDate} TO ${toDate}] AND `;
  }

  if (publisher) {
    qp += `bibjson.journal.publisher:"${publisher}" AND `;
  }

  if (query) {
    qp += `(title:"${query}" OR bibjson.title:"${query}" OR bibjson.abstract:"${query}" OR bibjson.author.name:"${query}" OR bibjson.journal.publisher:"${query}" OR doi:"${query}") AND `;
  }

  if (title) {
    qp += `bibjson.title:"${title}" AND `;
  }

  return qp.replace(/ AND $/, '');
};

const parseDOI = (identifiers) => {
  for (let i = 0; i < identifiers.length; i++) {
    const identifier = identifiers[i];

    if (identifier.type === 'doi') {
      return identifier.id;
    }
  }

  return null;
};

const parsePDFLink = (links) => {
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    const contentType = link.content_type ? link.content_type.toLowerCase() : null;

    if (!contentType || (contentType && contentType === 'pdf') || (contentType && !contentType.includes('html'))) {
      return link.url;
    }
  }

  return null;
};

const normalize = (sourceObj) => {
  const article = sourceObj.bibjson;
  const score = null;
  const articleId = `DOAJ${sourceObj.id}`;
  const newArticle = {};

  newArticle.abstract = article.abstract;
  newArticle.authors = article.author ? article.author.map((x) => x.name) : [];
  newArticle.doi = parseDOI(article.identifier || []);
  newArticle.guid = uuidv4();
  newArticle.id = articleId;
  newArticle.original_pdf_link = parsePDFLink(article.link || []);
  newArticle.publication_type = null;
  newArticle.published_date = `${article.year}-01-01`;
  newArticle.publisher = article.journal.publisher;
  newArticle.score = score;
  newArticle.source = 'DOAJ';
  newArticle.subjects = article.subject ? article.subject.map((x) => x.term) : [];
  newArticle.title = article.title;

  return newArticle;
};

module.exports = async (payload) => {
  performance.mark('DOAJ Start');

  const qp = buildQueryParam(payload);

  const queryParams = {
    page: payload.page,
    pageSize: payload.queryLimit.doaj,
  };

  let data;

  try {
    const res = await request.get(`search/articles/${encodeURIComponent(qp)}`, { params: queryParams });
    data = res.data;
  } catch (err) {
    console.log('[DOAJ]', err);
    data = {
      results: null,
    };
  }

  if (!data.results || !data.results.length) {
    performance.measure('DOAJ Start to Now', 'DOAJ Start');

    return {
      count: 0,
      data: [],
    };
  }

  const { results, total } = data;

  for(let i=0; i<results.length; i+=1) {
    results[i] = normalize(results[i]);
  }

  performance.measure('DOAJ Start to Now', 'DOAJ Start');

  return {
    count: total,
    data: results,
  };
};
