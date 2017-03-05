'use strict'

var GSheet   = require('./js/gsheet.js')
var Network  = require('./js/network.js')
var Graph    = require('./js/graph.js')
var Renderer = require('./js/renderer.js')

var noUiSlider = require('nouislider')


var gs = GSheet({})
gs.on('error', (err) => console.error(err))

gs.query('16LTS9c8EwuhwAyLgnY3WmII2x-hL16FzmOPyNSvGiv4', function (err, resp) {
  if (!err) {
    var network  = Network(gs.cells)
    var graph    = Graph()
    var renderer = Renderer(graph)

    var slider = document.getElementById('slider')
    var timeRange = network.timeRange

    console.log(network.tags)

    noUiSlider.create(slider, {
      start: [timeRange.min, timeRange.max],
      connect: true,
      behaviour: 'tap-drag',
      step: 1000 * 60 * 60 * 24,
      tooltips: true,
      format: {
        from: function (v) { return v },
        to: function (v) {
          var d = new Date(v)
          var yyyy = d.getFullYear()
          var mm = ('0' + (d.getMonth()+1)).slice(-2)
          var dd = ('0' + d.getDate()).slice(-2)
          return `${yyyy}-${mm}-${dd}`
        },
      },
      range: {
        'min': timeRange.min,
        'max': timeRange.max
      }
    })

    slider.noUiSlider.on('update', function(values, handle, unencoded) {
      var sub = network.subset(function (node) {
        return node.begin.raw >= unencoded[0] && node.begin.raw <= unencoded[1]
      })

      graph.set(sub)
    })
  }
})
