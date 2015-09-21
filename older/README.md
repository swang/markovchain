markovchain (NOTE THIS IS DEPRECATED VERSION)
=========================================
markovchain generates a markov chain of words based on input files

[![build status](https://secure.travis-ci.org/swang/markovchain.png)](http://travis-ci.org/swang/markovchain)

## Requirements
- [node v0.6+](http://nodejs.org/)

## Install
- npm install markovchain@0.0.7

## Example

```js
var MarkovChain = require('markovchain').MarkovChain
  , quotes = new MarkovChain({ files: 'quotes.txt' })

quotes
  .start('The') //
  .end(5)
  .process(function(err, s) {
    console.log(s)
  })
```
This will read a file, "quotes.txt", generate a word chain, then attempt to generate sentences starting with the word
"The" that are 5 words long, and then output to console.

## Methods
### start
The `start` method can take in either a `String`, in which case it will look to use that word to start the sentence.
If you instead pass a `Function` with one parameter, `wordList`, you will be given the entire list of word chains in which
you can decide what words to use to start a sentence. For example, you can generate sentences based on the number of times
a word occurs, or if the word starts with a capital letter.

Example:
```js

var useUpperCase = function(wordList) {
  var tmpList = Object.keys(wordList).filter(function(word) { return word[0] >= 'A' && word[0] <= 'Z' })
  return tmpList[~~(Math.random()*tmpList.length)]
}
quotes
  .start(useUpperCase)
  .end()
  .process(function(err, sentence) { console.log(sentence) })
```

### end
The `end` method can take a `String`, `Number`, or `Function`

- If you pass a String, `str`, the markov chain will generate words until the word matches `str` or the generator
can no longer find words to chain.
- If you pass a Number, `num`, the markov chain will generate words until the sentence length matches `num` or the generator
can no longer find words to chain.
- If you pass a Function, `fn`, the markov chain will generate words until function `fn` returns true. `fn` will be passed one
parameter, `sentence` that returns the generated sentence so far

Example:
```js
// same as passing value, 5 to end function
var stopAfterFiveWords = function(sentence) {
  return sentence.split(" ").length >= 5
}

quotes
  .start(useUpperCase)
  .end(stopAfterFiveWords)
  .process(function(err, sentence) {
    console.log(sentence)
  })
```

- If you pass nothing in `end`, the markov chain will generate words until it can no longer find words to chain.

## Author
- [Shuan Wang](https://github.com/swang) [(twitter)](https://twitter.com/swang) (author)

## TODO
- Cleanup

## CHANGELOG

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
- Passing a Function into `end()` has changed a little bit, before the markov chain would continue until
the Function passed returned false, now the Function being passed into `end()` should only return true when
you want the markov chain generator to stop generating the sentence.
- `start` can now accept a Function instead of just a String
- The logic to split sentences has changed from just a newline, to both a newline and a period.
- Also previous versions changed all the words to strip them of any non-letters/numbers and also lowercased them. This
version now doesn't modify the string other than to delete a period at the end of a word.

0.0.2
- Small change to how words are stripped

0.0.1
- Initial Release

## LICENSE
- MIT
