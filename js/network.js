'use strict'

var Emitter = require('tiny-emitter')

var defaultOpts = {
  rowOffset: 2
}

function Network (nodes, opts) {
  opts = Object.assign({}, defaultOpts, opts || {})
  var emitter = new Emitter()

  // create each node's links object
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i]
    var tmp = []
    Object.keys(node.links).forEach(function (key) {
      tmp = tmp.concat(createLinks(node, key))
    })
    node.links = tmp
  }

  // create each node's targetOf object
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i]
    node.targetOf = []
    for (var j = 0; j < nodes.length; j++) {
      if (i !== j) {
        var links = nodes[j].links
        for (var k = 0; k < links.length; k++) {
          var link = links[k]
          if (link.target === node.id) {
            node.targetOf.push(link)
          }
        }
      }
    }
  }

  var api = {
    on: function (event, callback, context) { emitter.on(event, callback, context) },
    update: function () {},

    get nodes () { return nodes },
    get tags () { return analyseTags(nodes).sort() },
    get timeRange () { return analyseTimeline(nodes) },

    subset : function (filter) {
      filter = filter || function (n) { return n }

      var
        include = [],
        exclude = []

      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i]
        if (filter(node)) include.push(node)
        else exclude.push(node)
      }

      return [include, exclude]
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
            target: link - opts.rowOffset,
            type: linkType,
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
