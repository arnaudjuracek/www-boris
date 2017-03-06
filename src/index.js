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

    var filter = {
      time: [0, 0],
      tags: [],
      exec: function(node) {
        return (node.pinned || inTime(node, this.time)) && matchAnyTags(node, this.tags)

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
    }


    createFilter(network, graph, filter)
    createSlider(network, graph, filter)
  }
})

// -------------------------------------------------------------------------

function createSlider (network, graph, filter) {
  var slider = document.getElementById('slider')
  var timeRange = network.timeRange

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
    filter.time = unencoded
    var sub = network.subset(filter.exec.bind(filter))
    graph.set(sub)
  })
}

function createFilter (network, graph, filter) {
  var tagsFilter = document.getElementById('tags')
  var tagsContainer = tagsFilter.querySelector('ul')

  for (var i = 0; i < network.tags.length; i++) {
    var tag = network.tags[i]
    if (tag) {

      filter.tags.push(tag)

      var checkbox = document.createElement('input')
      var id = `tag-${tag.replace(' ', '')}`
      checkbox.type = 'checkbox'
      checkbox.checked = true
      checkbox.value = tag
      checkbox.name = id
      checkbox.id = id

      var label = document.createElement('label')
      label.htmlFor = id
      label.appendChild(document.createTextNode(tag))

      var li = document.createElement('li')
      li.appendChild(checkbox)
      li.appendChild(label)
      tagsContainer.appendChild(li)
    }
  }

  tagsFilter.addEventListener('change', function(e) {
    filter.tags = []
    var tags = this.querySelectorAll('input')
    for (var i = 0; i < tags.length; i++) {
      var tag = tags[i]
      if (tag.checked) filter.tags.push(tag.value)
    }

    var sub = network.subset(filter.exec.bind(filter))
    graph.set(sub)
  })
}