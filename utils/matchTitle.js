const matchTitle = (article, tokens, sanitizedTokens) => {
  const abstract = article.abstract || '';
  const title = article.title || '';
  let matched = true;

  for(let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];

    if (token.startsWith('-')) {
      if (title.match(new RegExp(token.substr(1), 'i')) && abstract.match(new RegExp(token.substr(1), 'i'))) {
        matched = false;
        break;
      }
    } else if (!title.match(new RegExp(token, 'i')) && !abstract.match(new RegExp(token, 'i'))) {
      matched = false;
      break;
    }
  }
  
  if (!matched) {
    matched = true;

    for(let i = 0; i < sanitizedTokens.length; i += 1) {
      const token = sanitizedTokens[i];
  
      if (token.startsWith('-')) {
        if (title.match(new RegExp(token.substr(1), 'i')) && abstract.match(new RegExp(token.substr(1), 'i'))) {
          matched = false;
          break;
        }
      } else if (!title.match(new RegExp(token, 'i')) && !abstract.match(new RegExp(token, 'i'))) {
        matched = false;
        break;
      }
    }
  }

  return matched;
};

module.exports = matchTitle;
