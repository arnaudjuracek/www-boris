'use strict'

var GSheet   = require('./js/gsheet.js')
var Network  = require('./js/network.js')
var Graph    = require('./js/graph.js')
var Filter   = require('./js/filter.js')
var Renderer = require('./js/renderer.js')
var Sidebar  = require('./js/sidebar.js')

var noUiSlider = require('nouislider')

var network, graph, renderer

var filter = Filter()

// -------------------------------------------------------------------------

var sidebar = Sidebar({
  el: document.getElementById('sidebar'),
  container: document.getElementById('card'),
})

// -------------------------------------------------------------------------

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

    network  = Network(gs.cells)
    graph    = Graph({width: app.width, height: app.height})
    renderer = Renderer(graph, {})

    createFilter()
    createSlider()
    createOutsideNodesFilter()

    renderer.on('mouseover', sidebar.update)

    var back = document.getElementById('goBack')
    back.addEventListener('click', function (e) {
      e.preventDefault()
      sidebar.elements.container.classList.remove('show', 'easing-slow')

      window.getComputedStyle(sidebar.elements.welcome).opacity;
      sidebar.elements.welcome.classList.add('easing-slow', 'show')
    })
  }
})

// -------------------------------------------------------------------------

function createSlider () {
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
    var sub = network.subset(filter.exec)
    var nodes = filter.dealWithOutsideNodes(sub, renderer)
    graph.set(nodes)
    renderer.updateOutsideClass(nodes)
  })

}

function createFilter () {
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
      fa.classList.add('fa', 'fa-tag')

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

    var sub = network.subset(filter.exec)
    var nodes = filter.dealWithOutsideNodes(sub, renderer)
    graph.set(nodes)
    renderer.updateOutsideClass(nodes)
  })
}

function createOutsideNodesFilter () {
  var showOutsideNodesFilter = document.getElementById('showOutsideNodes')
  filter.showOutsideNodes = showOutsideNodesFilter.checked

  showOutsideNodesFilter.addEventListener('change', function(e) {
    filter.showOutsideNodes = this.checked

    var sub = network.subset(filter.exec)
    var nodes = filter.dealWithOutsideNodes(sub, renderer)
    // FIXME : find why two graph.set are needed here
    graph.set(nodes)
    graph.set(nodes)
    renderer.updateOutsideClass(nodes)
  })
}