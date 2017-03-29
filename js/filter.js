'use strict'

function Filter () {
  var time = [0, 0]

  var api = {
    set time (range) { time = range },
    tags: [],
    showOutsideNodes: null,

    exec: function (node) {
      return node.pinned ||
        (inTime(node, time) && matchAnyTags(node, api.tags))
    },

    getOutsideNodes: function (subset, cb) {
      cb = cb || function () {}

      var outsides = []
      var links = concatLinks(subset[0])

      for (var i = 0; i < subset[1].length; i++) {
        var node = subset[1][i]
        if (!node.pinned) {
          if (~links.indexOf(node.id) && !~outsides.indexOf(node)) {
            outsides.push(node)
            cb(node)
          }
        }
      }

      return outsides
    },

    dealWithOutsideNodes: function (subset, renderer) {
      var nodes = subset[0]

      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i]
        node.isOutside = false
      }

      if (api.showOutsideNodes) {
        var outsideNodes = api.getOutsideNodes(subset, function (node) {
          node.isOutside = true
        })
        nodes = nodes.concat(outsideNodes)
      }

      return nodes
    },

  }

  return api

  function concatLinks (nodes) {
    var links = []

    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i]
      for (var j = 0; j < node.links.length; j++) {
        var target = node.links[j].target
        if (!~links.indexOf(target)) links.push(target)
      }

      // include links in both ways
      for (var j = 0; j < node.targetOf.length; j++) {
        var source = node.targetOf[j].source
        if (!~links.indexOf(source)) links.push(source)
      }
    }

    return links
  }

  function inTime (node, range) {
    return node.begin.raw >= range[0] && node.begin.raw <= range[1]
  }

  function matchAnyTags (node, tags) {
    for (var i = 0; i < node.tags.length; i++) {
      var tag = node.tags[i]
      if (tags.indexOf(tag) > -1) return true
    }
    return false
  }
}

module.exports = Filter