'use strict'

var GSheet   = require('./js/gsheet.js')
var Network  = require('./js/network.js')
var Graph    = require('./js/graph.js')
var Renderer = require('./js/renderer.js')


var gs = GSheet({})
gs.on('error', (err) => console.error(err))

gs.query('16LTS9c8EwuhwAyLgnY3WmII2x-hL16FzmOPyNSvGiv4', function (err, resp) {
  if (!err) {
    var network  = Network(gs.cells)
    var graph    = Graph()
    var renderer = Renderer(graph)

    var index = 0
    window.document.addEventListener('click', function () {
      if (index < network.nodes.length) {
        var node = network.nodes[index++]
        graph.addNode(node)
      }
    })

  }
})
