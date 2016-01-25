'use strict';

const pickOneByWeight = require('pick-one-by-weight')

const isType = (t) => Object.prototype.toString.call(t).slice(8, -1).toLowerCase()

class MarkovChain {
  constructor(contents, normFn = (word) => word.replace(/\.$/ig, '')) {
    this.wordBank = Object.create(null);
    this.sentence = ''
    this._normalizeFn = normFn
    this.parseBy = /(?:\.|\?|\n)/ig
    this.parse(contents);
  }
  startFn(wordList) {
    let k = Object.keys(wordList)
    let l = k.length
    return k[~~(Math.random()*l)]
  }
  endFn() {
    return this.sentence.split(' ').length > 7
  }
  process() {
    let curWord = this.startFn(this.wordBank)
    this.sentence = curWord
    while (this.wordBank[curWord] && !this.endFn()) {
      curWord = pickOneByWeight(this.wordBank[curWord])
      this.sentence += ' ' + curWord
    }
    return this.sentence
  }
  parse(text = '', parseBy = this.parseBy) {
    text.split(parseBy).forEach((lines) => {
      let words = lines.split(' ').filter((w) => { return w.trim() !== '' })
      for (let i = 0; i < words.length - 1; i++) {
        let curWord = this._normalize(words[i])
        let nextWord = this._normalize(words[i + 1])

        if (!this.wordBank[curWord]) {
          this.wordBank[curWord] = Object.create(null);
        }
        if (!this.wordBank[curWord][nextWord]) {
          this.wordBank[curWord][nextWord] = 1
        }
        else {
          this.wordBank[curWord][nextWord] += 1
        }
      }
    })
    return this
  }
  start(fnStr) {
    const startType = isType(fnStr)
    if (startType === 'string') {
      this.startFn = () => fnStr
    }
    else if (startType === 'function') {
      this.startFn = (wordList) => fnStr(wordList)
    }
    else {
      throw new Error('Must pass a function, or string into start()')
    }
    return this
  }
  end(fnStrOrNum) {
    const endType = isType(fnStrOrNum)
    var self = this;

    if (endType === 'function') {
      this.endFn = () => fnStrOrNum(this.sentence)
    }
    else if (endType === 'string') {
      this.endFn = () => this.sentence.split(' ').slice(-1)[0] === fnStrOrNum
    }
    else if (endType === 'number' || fnStrOrNum === undefined) {
      fnStrOrNum = fnStrOrNum || Infinity
      this.endFn = () => self.sentence.split(' ').length > fnStrOrNum
    }
    else {
      throw new Error('Must pass a function, string or number into end()')
    }
    return this
  }

  _normalize(word) {
    return this._normalizeFn(word)
  }

  normalize(fn) {
    this._normalizeFn = fn
    return this
  }

  static get VERSION() {
    return require('../package').version
  }
  static get MarkovChain() { // load older MarkovChain
    return require('../older/index.js').MarkovChain
  }
}

module.exports = MarkovChain
