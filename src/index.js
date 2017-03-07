'use strict'

var GSheet   = require('./js/gsheet.js')
var Network  = require('./js/network.js')
var Graph    = require('./js/graph.js')
var Renderer = require('./js/renderer.js')
var Sidebar  = require('./js/sidebar.js')

var noUiSlider = require('nouislider')


var gs = GSheet({})
gs.on('error', (err) => console.error(err))

gs.query('16LTS9c8EwuhwAyLgnY3WmII2x-hL16FzmOPyNSvGiv4', function (err, resp) {
  if (!err) {
    var app = (function() {
      var el = document.getElementById('app')
      var rect = el.getBoundingClientRect()
      return {
        width: rect.width,
        height: rect.height,
      }
    })()

    var network  = Network(gs.cells)
    var graph    = Graph({width: app.width, height: app.height})
    var renderer = Renderer(graph, {})

    var filter = {
      time: [0, 0],
      tags: [],
      exec: function(node) {
        return node.pinned || (inTime(node, this.time) && matchAnyTags(node, this.tags))

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

    var sidebar = Sidebar({
      el: document.getElementById('sidebar'),
      container : document.getElementById('card')
    })

    sidebar.container.style.display = 'none'

    renderer.on('mouseover', sidebar.update)

    sidebar.on('update', function () {
      sidebar.container.style.display = ''
      sidebar.el.querySelector('article.welcome').style.display = 'none'
    })
  }
})

// -------------------------------------------------------------------------

function createSlider (network, graph, filter) {
  var slider = document.getElementById('slider')
  var timeRange = network.timeRange

  var pips = (function () {
    var nodes = []
    for (var i = 0; i < network.nodes.length; i++) {
      var node = network.nodes[i]
      if (!node.pinned) {
        nodes.push(node.begin.raw)
        // nodes.push(node.end.raw)
      }
    }
    return nodes
  })()

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
        return `${dd}/${mm}/${yyyy}`
      },
    },
    range: {
      'min': timeRange.min,
      'max': timeRange.max
    },
    pips: {
      mode: 'values',
      values: pips,
      density: 4,
      stepped: true,
      format: {
        from: function (v) { return '' },
        to: function (v) { return '' }
      }
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

      // <i class="fa fa-tags" title="valeur">
      var fa = document.createElement('i')
      fa.classList.add('fa', 'fa-tags')

      var li = document.createElement('li')
      li.appendChild(checkbox)
      li.appendChild(label)
      li.appendChild(fa)
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