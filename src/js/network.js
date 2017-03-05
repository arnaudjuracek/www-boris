'use strict'

var Emitter = require('tiny-emitter')

var defaultOpts = {
  rowOffset: 2
}

function Network (nodes, opts) {
  opts = Object.assign({}, defaultOpts, opts || {})
  var emitter = new Emitter()

  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i]
    Object.keys(node.links).forEach(function (key) {
      node.links[key] = createLinks(node, key)
    })
  }


  var api = {
    on: function (event, callback, context) { emitter.on(event, callback, context) },
    update: function () {},

    get nodes () { return nodes },
    get links () { return analyseLinks(nodes) },
    get tags () { return analyseTags(nodes) },
    get timeRange () { return analyseTimeline(nodes) },

    parseHtml : function (node) {
      return `
        <h1>#${node.id} - ${node.title}</h1>
        <div class="content">${node.content}</div>
      `
    },

    subset : function (filter) {
      filter = filter || function (n) { return n }

      var subset = []
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i]
        if (filter(node)) subset.push(node)
      }

      return subset
    }
  }

  return api

  function analyseTags (nodes) {
    var tags = []

    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i]
      tags = tags.concat(node.tags)
    }

    return arrayUnique(tags)
  }

  function analyseTimeline (nodes) {
    var min = Number.POSITIVE_INFINITY
    var max = Number.NEGATIVE_INFINITY

    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i]
      var begin = node.begin.raw
      var end = node.end.raw

      min = begin < min ? begin : min
      max = end > max ? end : max
    }

    return {
      min: min,
      max: max,
    }
  }

  function createLinks (node, linkType) {
    var links = []
    var sourceLinks = node.links[linkType]
    if (sourceLinks) {
      var id = node.id
      for (var i = 0; i < sourceLinks.length; i++) {
        var link = sourceLinks[i]
        if (link && link - opts.rowOffset !== id) {
          links.push({
            source: id,
            target: link - opts.rowOffset
          })
        }
      }
    }
    return links
  }

  function arrayUnique (arr) {
    arr = arr.concat()
    for (var i = 0; i < arr.length; ++i) {
      for (var j = i + 1; j < arr.length; ++j) {
        if (arr[i] === arr[j]) arr.splice(j--, 1)
      }
    }
    return arr
  }

}

module.exports = Network
