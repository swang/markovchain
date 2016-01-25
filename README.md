markovchain
=========================================
markovchain generates a markov chain based on text passed into it.

[![build status](https://secure.travis-ci.org/swang/markovchain.png)](http://travis-ci.org/swang/markovchain)

## Requirements
- [node v0.6+](http://nodejs.org/)

## Install
- npm install markovchain

## Example

```js
var MarkovChain = require('markovchain')
  , fs = require('fs')
  , quotes = new MarkovChain(fs.readFileSync('./quotes.txt', 'utf8'))

console.log(quotes.start('The').end(5).process())
```
This will read a file, "quotes.txt", generate a word chain, then attempt to
generate sentences starting with the word

"The" that are 5 words long, and then output to console.

## Methods
### constructor([string: content][, function: normalizeFn])
`content`: the content that you want passed into the markov chain
`normalizeFn`: the function to apply to every word (generally to clean it up,
e.g. removing commas and other non-letter words)

### start([string: str|function: func])
The `start` method can take in either a `string` str, in which case it will look
to use that word to start the sentence.

If you instead pass a `function` func with one parameter, `wordList`, you will
be given the entire list of word chains in which you can decide what words to
use to start a sentence. For example, you can generate sentences based on the
number of times a word occurs, or if the word starts with a capital letter.

Example:
```js

var useUpperCase = function(wordList) {
  var tmpList = Object.keys(wordList).filter(function(word) {
    return word[0] >= 'A' && word[0] <= 'Z'
  })
  return tmpList[~~(Math.random()*tmpList.length)]
}

console.log(quotes.start(useUpperCase).end().process())
```

### end([string: str|function: func|integer: int])
The `end` method can take a `String`, `Integer`, or `Function`

- If you pass a String, `str`, the markov chain will generate words until the
word matches `str` or the generator can no longer find words to chain.
- If you pass an Integer, `int`, the markov chain will generate words until the
sentence length matches `int` or the generator can no longer find words to
chain.
- If you pass a Function, `func`, the markov chain will generate words until
function `func` returns true. `func` will be passed one parameter, `sentence`
that returns the generated sentence so far

Example:
```js
// same as passing value, 5 to end function
var stopAfterFiveWords = function(sentence) {
  return sentence.split(" ").length >= 5
}

console.log(quotes.start(useUpperCase).end(stopAfterFiveWords).process())
```

- If you pass nothing in `end`, the markov chain will generate words until it
can no longer find words to chain.

### parse(string: content[, parseBy:regex/string])
The `parse` function adds more content to the markov chain. This allows you to
content later on, rather than needing all the next when you instantiate the
markov chain.

If you pass a second parameter, `parseBy`, it specifies how the content will be
parsed into sentences (which are then further parsed down into words). By
default `parseBy` will parse into newlines, periods, and question marks.

Example:
```js
var m = new MarkovChain('some text here')

m.parse('add additional text')

console.log(m.parse('more and more text').end(5).process())
```

## Author
- [Shuan Wang](https://github.com/swang) [(twitter)](https://twitter.com/swang) (author)

## CHANGELOG
1.0.0
- Deprecate older version. Still accessible with this library the same exact way
  it was called before: `var MarkovChain = require('markovchain').MarkovChain`
- This library now will be focused on the markov chain processing portion
  rather than file processing. Thus all file processing related functions were
  removed.

### NOTE ####
0.0.6 IS PROBABLY THE LAST VERSION WITH THIS API.
------
0.0.6
- Fix when passing a string to `end()`

0.0.5
- Added default startFn/endFn functions
- use() now actually handles array of strings
- Use async.parallel instead of async.series

0.0.4
- Fix undefined sentence if start was passed a function

0.0.3
- Passing a Function into `end()` has changed a little bit, before the markov
chain would continue until the Function passed returned false, now the Function
being passed into `end()` should only return true when you want the markov chain
generator to stop generating the sentence.
- `start` can now accept a Function instead of just a String
- The logic to split sentences has changed from just a newline, to both a
newline and a period.
- Also previous versions changed all the words to strip them of any
non-letters/numbers and also lowercased them. This version now doesn't modify
the string other than to delete a period at the end of a word.

0.0.2
- Small change to how words are stripped

0.0.1
- Initial Release

## LICENSE
- MIT
