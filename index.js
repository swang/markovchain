var async = require('async')
  , fs = require('fs')
  , isType
  , MarkovChain


isType = function(t) {
  return Object.prototype.toString.call(t).slice(8, -1).toLowerCase()
}

MarkovChain = function() {
  this.wordBank = {}
  this.startWord = ""
  this.sentence = ""
  return this
}

MarkovChain.prototype.VERSION = require('./package').version

MarkovChain.prototype.use = function(files) {
  if (isType(files) === "array") {
    this.files = files
  }
  else if (isType(files) === "string") {
    this.files = [files]
  }
  else {
    throw new Error("Need to pass a string or array for use()")
  }
  return this
}

MarkovChain.prototype.readFile = function(file) {
  return function(callback) {
    fs.readFile(file, 'utf8', function(err, data) {
      if (err) { return callback(err) }
      callback(null, data)
    })
  }
}

MarkovChain.prototype.countTotal = function(word) {
  var total = 0
  for (var prop in this.wordBank[word]) {
    if (this.wordBank[word].hasOwnProperty(prop)) {
      total += this.wordBank[word][prop]
    }
  }
  return total
}

MarkovChain.prototype.process = function(callback) {
  var c = 0
    , countAll = 0
    , curWord = this.startWord
    , prop
    , randNum
    , readFiles = []
    , total = 0
    , tmpCount = 0
    , useWord

  this.files.forEach(function(file) {
    readFiles.push(this.readFile(file))
  }.bind(this))

  async.series(readFiles, function(err, retFiles) {
    this.parseFile(retFiles.toString())
    this.sentence = ""
    var s
      , rando;
    while (this.wordBank[curWord] != null && this.fn()) {
      this.sentence += curWord + " "

      s = Object.keys(this.wordBank[curWord])
      rando = ~~(s.length * Math.random())
      curWord = s[~~(s.length * Math.random())]
    }
    callback(null, this.sentence.trim())

  }.bind(this))
}

MarkovChain.prototype.parseFile = function(file) {
  file.split("\n").forEach(function(lines) {
    var words = lines.toLowerCase().split(" ").filter(function(w) { return (w.trim() != "") })
      , i
      , curWord

    for (i = 0; i < words.length - 1; i++) {
      curWord = words[i].replace(/[^a-z]/ig, "")
      nextWord = words[i + 1].replace(/[^a-z]/ig, "")
      if (this.wordBank[curWord] == null) {
        this.wordBank[curWord] = {}
      }
      if (this.wordBank[curWord][nextWord] == null) {
        this.wordBank[curWord][nextWord] = 1
      }
      else {
        this.wordBank[curWord][nextWord] += 1
      }
    }
  }.bind(this))
}

MarkovChain.prototype.start = function(word) {
  this.startWord = word
  return this
}

MarkovChain.prototype.end = function(fnStrOrNum) {
  var endType = isType(fnStrOrNum)

  if (endType === "function") {
    this.fn = function() { return fnStrOrNum(this.sentence) }
  }
  else if (endType === "string") {
    this.fn = function() { return this.sentence.slice(-(fnStrOrNum.length + 1)).toLowerCase() !== " " + fnStrOrNum.toLowerCase() }
  }
  else if (endType === "number") {
    this.fn = function() { return this.sentence.split(" ").length <= fnStrOrNum }
  }
  else {
    throw new Error("Must pass a function, string or number into end()")
  }
  return this
}

module.exports.MarkovChain = MarkovChain
