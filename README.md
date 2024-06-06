# ase - Article Search Engine

## Supported Advanced Search Operators

### "search term"
Force an exact-match search. Use this to refine results for ambiguous searches, or to exclude synonyms when searching for single words.

**Example: "steve jobs"**

### OR
Search for X or Y. This will return results related to X or Y, or both. Note: The pipe (|) operator can also be used in place of "OR."

**Examples: jobs OR gates / jobs | gates**

### AND
Search for X and Y. This will return only results related to both X and Y. Note: It doesn't really make much difference for regular searches, as regular search defaults to "AND" anyway. But it's very useful when paired with other operators.

**Example: jobs AND gates**

### +
Force an exact-match search on a single word or phrase.

**Example: jobs +apple**

_N.B. You can do the same thing by using double quotes around your search._

### -
Exclude a term or phrase. In our example, any pages returned will be related to jobs but not Apple (the company).

**Example: jobs ‑apple**

### *
Acts as a wildcard and will match any word or phrase.

**Example: steve * apple**

<!-- ### ( )
Group multiple terms or search operators to control how the search is executed.

**Example: (ipad OR iphone) apple** -->
