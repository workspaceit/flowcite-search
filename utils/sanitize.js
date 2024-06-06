const operators = [
  {
    re: /"([^"]+(?="))"/i,
    with: '$1',
  },
  {
    re: /\(([^(]+(?=\)))\)/i,
    with: '$1',
  },
  {
    re: /["]+/i,
    with: ' ',
  },
  {
    re: /[()]+/i,
    with: ' ',
  },
  {
    re: /\s+(AND)\s+/,
    with: ' ',
  },
  {
    re: /^(AND)\s+/,
  },
  {
    re: /\s+(AND)$/,
  },
  {
    re: /\s+(OR)\s+/,
    with: ' ',
  },
  {
    re: /^(OR)\s+/,
  },
  {
    re: /\s+(OR)$/,
  },
  {
    re: /[+\-*]/i,
    with: ' ',
  },
  {
    re: /\s+/,
    with: ' ',
  },
];

const sanitize = (query) => {
  let sanitizedQuery = query;
  operators.forEach((op) => {
    sanitizedQuery = sanitizedQuery.replace(op.re, op.with || '');
  });
  return sanitizedQuery.trim();
};

module.exports = sanitize;
