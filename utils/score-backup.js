const occurrences = (doc, term) => {
  return doc.split(term).length - 1;
};

const tf = (term, doc) => {
  const termOccurrences = occurrences(doc, term);

  return termOccurrences / wordCount;
};

const TERM_SPLITTER_RE = /[\s'":\[{()}\]*,.&<>\\/|-]+/;

const score = (data, queryTokens, sanitizedQueryTokens) => {
  for (let i=0; i<data.length; ++i) {
    const abstractTerms = (data[i].abstract || '').split(TERM_SPLITTER_RE).filter((x) => x !== '').map((x) => x.toLowerCase());
    const titleTerms = (data[i].title || '').split(TERM_SPLITTER_RE).filter((x) => x !== '').map((x) => x.toLowerCase());

    const abstractTermCounts = {};
    const titleTermCounts = {};

    titleTerms.forEach((term) => {
      if (titleTermCounts[term] === undefined) {
        titleTermCounts[term] = 0;
      }

      titleTermCounts[term] += 1;
    });

    const titleTermCount = Object.keys(titleTermCounts).map((x) => titleTermCounts[x]).reduce((a, b) => a + b, 0);

    let titleTFScore = 0;

    sanitizedQueryTokens.forEach((x) => {
      titleTFScore += (titleTermCounts[x] || 0) / titleTermCount;
    });

    titleTFScore /= sanitizedQueryTokens.length;

    abstractTerms.forEach((term) => {
      if (abstractTermCounts[term] === undefined) {
        abstractTermCounts[term] = 0;
      }

      abstractTermCounts[term] += 1;
    });

    const abstractTermCount = Object.keys(abstractTermCounts).map((x) => abstractTermCounts[x]).reduce((a, b) => a + b, 0);

    let abstractTFScore = 0;

    sanitizedQueryTokens.forEach((x) => {
      abstractTFScore += (abstractTermCounts[x] || 0) / abstractTermCount;
    });

    abstractTFScore /= sanitizedQueryTokens.length;

    data[i].providerScore = data[i].score;

    data[i].score = ((titleTFScore * 0.6) || 0) + ((abstractTFScore * 0.4) || 0);
  }

  return data;
};

module.exports = score;
