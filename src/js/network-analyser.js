'use strict'

var Emitter = require('tiny-emitter')

var defaultOpts = {
  rowOffset: 2
}

function NetworkAnalyser (nodes, opts) {
  opts = Object.assign({}, defaultOpts, opts || {})
  var emitter = new Emitter()

  var links
  var api = {
    on: function (event, callback, context) { emitter.on(event, callback, context) },
    update: function () {},

    get nodes () { return nodes },
    get links () {
      return links = links || analyseLinks(nodes)
    }
  }

  function analyseLinks (nodes) {
    var links = {
      direct: [],
      indirect: [],
      misc: []
    }

    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i]
      Object.keys(links).forEach(function (key) {
        links[key] = links[key].concat(createLinks(node, key))
      })
    }
    return links
  }

  function createLinks (node, linkType) {
    var links = []
    var sourceLinks = node.links[linkType]
    if (sourceLinks) {
      var index = node.index
      for (var i = 0; i < sourceLinks.length; i++) {
        var link = sourceLinks[i]
        if (link && link - opts.rowOffset !== index) {
          links.push({
            source: index,
            target: link - opts.rowOffset
          })
        }
      }
    }
    return links
  }

  return api
}

module.exports = NetworkAnalyser
