'use strict';

var async = require('async')
  , fs = require('fs')
  , path = require('path')
  , pickOneByWeight = require('pick-one-by-weight')
  , isType
  , kindaFile
  , MarkovChain

isType = function(t) {
  return Object.prototype.toString.call(t).slice(8, -1).toLowerCase()
}

kindaFile = function(file) {
  return file.indexOf('.' + path.sep) === 0 || file.indexOf(path.sep) === 0
}

MarkovChain = function(args) {
  if (!args) { args = {} }
  this.wordBank = {}
  this.sentence = ''
  this.files = []
  if (args.files) {
    return this.use(args.files)
  }

  this.startFn = function(wordList) {
    var k = Object.keys(wordList)
    var l = k.length

    return k[~~(Math.random()*l)]
  }

  this.endFn = function() {
    return this.sentence.split(' ').length > 7
  }

  return this
}

MarkovChain.prototype.VERSION = require('../package').version

MarkovChain.prototype.use = function(files) {
  if (isType(files) === 'array') {
    this.files = files
  }
  else if (isType(files) === 'string') {
    this.files = [files]
  }
  else {
    throw new Error('Need to pass a string or array for use()')
  }
  return this
}

MarkovChain.prototype.readFile = function(file) {
  return function(callback) {
    fs.readFile(file, 'utf8', function(err, data) {
      if (err) {
        // if the file does not exist,
        // if `file` starts with ./ or /, assuming trying to be a file
        // if `file` has a '.', and the string after that has no space, assume file
        if (err.code === 'ENOENT' && !kindaFile(file)) {
          return callback(null, file);
        }
        return callback(err)
      }
      process.nextTick(function() { callback(null, data) })
    })
  }
}

MarkovChain.prototype.countTotal = function(word) {
  var total = 0
    , prop

  for (prop in this.wordBank[word]) {
    if (this.wordBank[word].hasOwnProperty(prop)) {
      total += this.wordBank[word][prop]
    }
  }
  return total
}

MarkovChain.prototype.process = function(callback) {
  var readFiles = []

  this.files.forEach(function(file) {
    readFiles.push(this.readFile(file))
  }.bind(this))

  async.parallel(readFiles, function(err, retFiles) {
    var words
      , curWord
    this.parseFile(retFiles.toString())

    curWord = this.startFn(this.wordBank)

    this.sentence = curWord

    while (this.wordBank[curWord] && !this.endFn()) {
      curWord = pickOneByWeight(this.wordBank[curWord])
      this.sentence += ' ' + curWord
    }
    callback(null, this.sentence.trim())

  }.bind(this))

  return this
}

MarkovChain.prototype.parseFile = function(file) {
  // splits sentences based on either an end line
  // or a period (followed by a space)
  file.split(/(?:\. |\n)/ig).forEach(function(lines) {
    var curWord
      , i
      , nextWord
      , words

    words = lines.split(' ').filter(function(w) { return (w.trim() !== '') })
    for (i = 0; i < words.length - 1; i++) {
      curWord = this.normalize(words[i])
      nextWord = this.normalize(words[i + 1])
      if (!this.wordBank[curWord]) {
        this.wordBank[curWord] = {}
      }
      if (!this.wordBank[curWord][nextWord]) {
        this.wordBank[curWord][nextWord] = 1
      }
      else {
        this.wordBank[curWord][nextWord] += 1
      }
    }
  }.bind(this))
}

MarkovChain.prototype.start = function(fnStr) {
  var startType = isType(fnStr)
  if (startType === 'string') {
    this.startFn = function() {
      return fnStr
    }
  }
  else if (startType === 'function') {
    this.startFn = function(wordList) {
      return fnStr(wordList)
    }
  }
  else {
    throw new Error('Must pass a function, or string into start()')
  }
  return this
}

MarkovChain.prototype.end = function(fnStrOrNum) {
  var endType = isType(fnStrOrNum)
  var self = this;

  if (endType === 'function') {
    this.endFn = function() { return fnStrOrNum(this.sentence) }
  }
  else if (endType === 'string') {
    this.endFn = function() {
      return self.sentence.split(' ').slice(-1)[0] === fnStrOrNum
    }
  }
  else if (endType === 'number' || fnStrOrNum === undefined) {
    fnStrOrNum = fnStrOrNum || Infinity
    this.endFn = function() { return self.sentence.split(' ').length > fnStrOrNum }
  }
  else {
    throw new Error('Must pass a function, string or number into end()')
  }
  return this
}

MarkovChain.prototype.normalize = function(word) {
  return word.replace(/\.$/ig, '')
}

module.exports.MarkovChain = MarkovChain
