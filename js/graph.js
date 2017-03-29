'use strict'

var d3      = require('d3')
var Emitter = require('tiny-emitter')
var Force   = require('./force.js')

var defaultOpts = {
  width: window.innerWidth,
  height: window.innerHeight,
}

function Graph (opts) {
  opts = Object.assign({}, defaultOpts, opts || {})
  var emitter = new Emitter()
  var force = Force(opts)

  var nodes = force.nodes
  var links = force.links

  var api = {
    on : function (event, callback, context) { emitter.on(event, callback, context) },

    get nodes () { return nodes },
    get links () { return links },
    get force () { return force },

    set : function (arr) {
      var tmp = []
      for (var i in arr) {
        var node = arr[i]
        tmp.push({
          id : node.id,
          raw : node,
        })
      }

      if (!areSame(tmp, nodes)) {
        diffRemove(nodes, tmp)
        var newNodes = diffAdd(nodes, tmp)
        for (var i in newNodes) {
          var node = newNodes[i]
          if (!node.raw.pinned) {
            var nearest = findNearestNode(node)
            node.x = nearest ? nearest.x + (1 - Math.random() * 2) : 0
            node.y = nearest ? nearest.y + (1 - Math.random() * 2) : 0
          }
        }

        nodes = nodes.concat(newNodes)
        update()
      }
    },

    addNode : function (node) {
      nodes.push({
        id : node.id,
        raw : node
      })
      update()
    },

    removeNodes : function () {
      nodes = []
      links = []
      update()
    },

    removeNode : function (node) {
      nodes.splice(findNodeIndex(node.id), 1);
      update()
    },

  }

  return api

  function diffRemove (arr, compare) {
    for (var i in arr) {
      var node = arr[i]
      if (!inArray(compare, node)) arr.splice(i, 1)
    }
  }

  function diffAdd (arr, compare) {
    var result = []
    for (var i in compare) {
      var node = compare[i]
      if (!inArray(arr, node)) result.push(node)
    }
    return result
  }

  function inArray (arr, node) {
    for (var i in arr) {
      if (node.id === arr[i].id) return true
    }
    return false
  }

  function findNode (id) {
    for (var i = 0; i< nodes.length; i++) {
      if (nodes[i]['id'] === id) return nodes[i]
    }
  }

  function findNodeIndex (id) {
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].id == id) return i
    }
  }

  function findNearestNode (node) {
    for (var i in nodes) {
      var n = nodes[i].raw
      if (n.pinned) {
        var found
        for (var j in n.links) {
          var link = n.links[j]
          if (link.target === node.id) {
            found = n
            break
          }
        }
        if (found) return findNode(found.id)
      }
    }

    // warning : potential nullPointerException
    return findNode(node.raw.links[0].target)
  }

  function refreshLinks () {
    links = []
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i].raw
      for (var j = 0; j < node.links.length; j++) {
        var link = node.links[j]
        var target = findNode(link.target)
        if (target) {
          links.push({
            source : node.id,
            target : target,
            type   : link.type,
          })
        }
      }
    }
  }

  function areSame (a, b) {
    if (!a || !b) return false
    if (a.length !== b.length) return false

    for (var i = 0; i < a.length; i++) {
      if (a[i].id !== b[i].id) return false
    }

    return true
  }

  function update () {
    refreshLinks()
    force.update(nodes, links)
    emitter.emit('update')
    emitter.emit('update')
  }

}

module.exports = Graph