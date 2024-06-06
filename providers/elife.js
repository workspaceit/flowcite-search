const axios = require('axios').default;
const { performance } = require('perf_hooks');
const uuid = require('uuid');

const { v4: uuidv4 } = uuid;

const request = axios.create({
  baseURL: 'https://prod--gateway.elifesciences.org/',
});

const buildQueryParam = ({
  fromDate,
  query,
  title,
  toDate,
}) => {
  const paramObj = {};
  let qp = '';

  // if (abstract) {
  //   qp += `${abstract} `;
  // }

  // if (author) {
  //   qp += `${author} `;
  // }

  // if (isbn) {
  //   qp += `${isbn} `;
  // }

  // if (doi) {
  //   qp += `${doi} `;
  // }

  if (fromDate) {
    paramObj['start-date'] = fromDate;
  }

  // if (publisher) {
  //   qp += `${publisher} `;
  // }

  if (query) {
    qp += `${query} `;
  }

  if (title) {
    qp += `${title} `;
  }

  if (toDate) {
    paramObj['end-date'] = toDate;
  }

  paramObj.for = encodeURIComponent(qp.trim());

  return paramObj;
};

const normalize = (sourceObj) => {
  const article = sourceObj;
  const score = null;
  const articleId = `ELIFE${sourceObj.id}`;
  const newArticle = {};
  // console.log(article)

  newArticle.abstract = article.impactStatement;
  newArticle.authors = (article.authorLine || '').split(',').map((x) => x.trim());
  newArticle.doi = article.doi;
  newArticle.guid = uuidv4();
  newArticle.id = articleId;
  newArticle.original_pdf_link = article.pdf;
  newArticle.publication_type = article.type;
  newArticle.published_date = article.published.substr(0, 10);
  newArticle.publisher = null;
  newArticle.score = score;
  newArticle.source = 'ELIFE';
  newArticle.subjects = article.subjects ? article.subjects.map((x) => x.name) : [];
  newArticle.title = article.title;

  return newArticle;
};

module.exports = async (payload) => {
  performance.mark('ELIFE Start');

  const qp = buildQueryParam(payload);

  const queryParams = {
    ...qp,
    page: payload.page,
    'per-page': payload.queryLimit.elife,
  };

  let data;

  try {
    const res = await request.get('/search', { params: queryParams });
    data = res.data;
  } catch (err) {
    console.log('[ELIFE]', err);
    data = {
      items: null,
    };
  }

  if (!data.items || !data.items.length) {
    performance.measure('ELIFE Start to Now', 'ELIFE Start');

    return {
      count: 0,
      data: [],
    };
  }

  const {
    items,
    total,
  } = data;

  for(let i=0; i<items.length; i+=1) {
    items[i] = normalize(items[i]);
  }

  performance.measure('ELIFE Start to Now', 'ELIFE Start');

  return {
    count: total,
    data: items,
  };
};
