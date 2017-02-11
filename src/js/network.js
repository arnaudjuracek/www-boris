'use strict'

var d3 = require('d3')
var Emitter = require('tiny-emitter')

var defaultOpts = {
  width: window.innerWidth,
  height: window.innerHeight,
  scale: [0.1, 8]
}

function Network (analyser, opts) {
  var emitter = new Emitter()
  opts = Object.assign({}, defaultOpts, opts || {})

  var svg = d3.select('body').append('svg')
                                .attr('width', opts.width)
                                .attr('height', opts.height)

  var g, link, node, simulation
  var api = {
    on: function (event, callback, context) { emitter.on(event, callback, context) },
    init: function () {
      g = svg.append('g')
      svg.call(d3.zoom().scaleExtent(opts.scale).on('zoom', zoomHandler))

      link = {}
      Object.keys(analyser.links).forEach(function (key) {
        console.log(key, analyser.links[key])
        link[key] = g.selectAll()
          .data(analyser.links[key])
          .enter().append('line')
          .attr('class', `link ${key} easing`)
      })

      api.startSimulation(analyser.nodes)

      node = g.selectAll()
        .data(analyser.nodes)
        .enter().append('g')
        .attr('class', 'node easing')
        .call(d3.drag().on('drag', dragHandler))

      node.append('circle')
        .attr('r', 10)
        .attr('x', 0)
        .attr('y', 0)

      node.append('text')
        .attr('dx', 0)
        .attr('dy', '.35em')
        .text(function (d) { return d.title })

      node.on('mouseover', hoverHandler)
      node.on('mouseout', outHandler)
    },

    startSimulation: function (nodes) {
      simulation = d3.forceSimulation(nodes)
        .force('link-direct', d3.forceLink().strength(1))
        .force('link-indirect', d3.forceLink().strength(1))
        .force('link-misc', d3.forceLink().strength(1))
        .force('collision', d3.forceCollide(30))
        .force('centering', d3.forceCenter(opts.width / 2, opts.height / 2))
        .on('tick', tickHandler)

      Object.keys(link).forEach(function (key) {
        simulation.force(`link-${key}`).links(analyser.links[key])
      })
    }
  }

  function tickHandler () {
    Object.keys(link).forEach(function (key) {
      link[key]
        .attr('x1', function (d) { return d.source.x })
        .attr('y1', function (d) { return d.source.y })
        .attr('x2', function (d) { return d.target.x })
        .attr('y2', function (d) { return d.target.y })
    })

    node.attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ')' })
    emitter.emit('tick')
  }

  function zoomHandler () {
    g.attr('transform', d3.event.transform)
    emitter.emit('zoom', d3.event.transform)
  }

  function dragHandler (d) {
    // reheat simulation
    simulation.restart().alpha(0.01).alphaTarget(0)
    d3.select(this).attr('cx', d.x = d3.event.x).attr('cy', d.y = d3.event.y)
    emitter.emit('drag', d)
  }

  function hoverHandler (d) {
    link.direct.style('stroke', function (l) {
      if (d === l.source) {
        node.filter(function (n, i) { return i === l.target.index }).style('fill', 'red')
        return '#F00'
      }
    })
  }

  function outHandler (d) {
    link.direct.style('stroke', null)
    node.style('fill', null)
  }

  return api
}

module.exports = Network
