'use strict'

var d3      = require('d3')
var Emitter = require('tiny-emitter')
var Force   = require('./force.js')

function Graph (opts) {

  var emitter = new Emitter()
  var force = Force()

  var nodes = force.nodes
  var links = force.links

  var api = {
    on : function (event, callback, context) { emitter.on(event, callback, context) },

    get nodes () { return nodes },
    get links () { return links },
    get force () { return force },

    set : function (newNodes) {
      var tmp = []
      for (var i in newNodes) {
        var node = newNodes[i]
        tmp.push({
          id : node.id,
          raw : node
        })
      }

      if (!areSame(tmp, nodes)) {
        nodes = tmp
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

  function refreshLinks () {
    links = []
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i].raw

      Object.keys(node.links).forEach(function (key) {
        for (var j = 0; j < node.links[key].length; j++) {
          var target = findNode(node.links[key][j].target)
          if (target) {
            links.push({
              source : node.id,
              target : target,
              type   : key,
            })
          }
        }
      })

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