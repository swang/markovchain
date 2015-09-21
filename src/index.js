'use strict';

const pickOneByWeight = require('pick-one-by-weight')
const isType = (t) => {
  return Object.prototype.toString.call(t).slice(8, -1).toLowerCase()
}

class MarkovChain {
  constructor(contents) {
    this.wordBank = {}
    this.sentence = ''
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
  parse(text = '') {
    text.split(/(?:\. |\n)/ig).forEach((lines) => {
      let words = lines.split(' ').filter((w) => { return w.trim() !== '' })
      for (let i = 0; i < words.length - 1; i++) {
        let curWord = this.normalize(words[i])
        let nextWord = this.normalize(words[i + 1])
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
    })
    return this
  }
  start(fnStr) {
    const startType = isType(fnStr)
    if (startType === 'string') {
      this.startFn = () => {
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
  end(fnStrOrNum) {
    const endType = isType(fnStrOrNum)
    var self = this;

    if (endType === 'function') {
      this.endFn = () => { return fnStrOrNum(this.sentence) }
    }
    else if (endType === 'string') {
      this.endFn = () => {
        return this.sentence.split(' ').slice(-1)[0] === fnStrOrNum
      }
    }
    else if (endType === 'number' || fnStrOrNum === undefined) {
      fnStrOrNum = fnStrOrNum || Infinity
      this.endFn = () => { return self.sentence.split(' ').length > fnStrOrNum }
    }
    else {
      throw new Error('Must pass a function, string or number into end()')
    }
    return this
  }
  normalize(word) {
    return word.replace(/\.$/ig, '')
  }
  static get VERSION() {
    return require('../package').version
  }
  static get MarkovChain() { // load older MarkovChain
    return require('../older/index.js').MarkovChain
  }
}

module.exports = MarkovChain
