'use strict'

var GSheet = require('./js/gsheet.js')
var Network = require('./js/network.js')
var NetworkAnalyser = require('./js/network-analyser.js')

var gs = GSheet({})
gs.on('load', (data) => console.log(data))
gs.on('error', (err) => console.error(err))

gs.query('16LTS9c8EwuhwAyLgnY3WmII2x-hL16FzmOPyNSvGiv4', function (err, resp) {
  if (!err) {
    var analyser = NetworkAnalyser(gs.cells)
    var network = Network(analyser)

    console.log(analyser.nodes)
    console.log(analyser.links)

    network.init()
  }
})
