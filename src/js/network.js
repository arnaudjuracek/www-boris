'use strict'

var d3      = require('d3')
var Emitter = require('tiny-emitter')
var collide = require('./force-collide.js')

var defaultOpts = {
  width: window.innerWidth,
  height: window.innerHeight,
  scale: [0.1, 8],
  nodeWidth: 300
}

function Network (analyser, opts) {
  var emitter = new Emitter()
  opts = Object.assign({}, defaultOpts, opts || {})

  var svg = d3.select('main').append('svg')
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
        link[key] = g.selectAll()
          .data(analyser.links[key])
          .enter().append('line')
          .attr('class', `link ${key} easing`)
      })

      node = g.selectAll()
        .data(analyser.nodes)
        .enter().append('g')
        .attr('class', 'node easing')
        .call(d3.drag().on('drag', dragHandler))

      // node.append('rect')
      //   .attr('fill', 'none')
      //   .attr('stroke', 'black')
      //   .attr('width', opts.nodeWidth)
      //   .attr('height', opts.nodeWidth)

      node.append('foreignObject')
        .attr('width', opts.nodeWidth)
        .append("xhtml:body")
        .html(function (d) { return analyser.parseHtml(d) })
      node.selectAll('foreignObject').attr('height', function (d) {
        return this.getElementsByTagName('body')[0].clientHeight;
      })

      node.append('circle')
        .attr('cx', opts.nodeWidth / 2)
        .attr('r', 10)

      node.on('mouseover', hoverHandler)
      node.on('mouseout', outHandler)

      api.startSimulation(analyser.nodes)
    },

    startSimulation: function (nodes) {
      simulation = d3.forceSimulation(nodes)
        .force('collision', collide().size(function (d) {
          return [
            opts.nodeWidth,
            Math.max(
                     opts.nodeWidth,
                     node.selectAll('foreignObject')._groups[d.index][0].getAttribute('height')
                     ),
          ]
        }))
        .force('link-direct', d3.forceLink().strength(1))
        .force('link-indirect', d3.forceLink().strength(1))
        .force('link-misc', d3.forceLink().strength(1))
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
        .attr('x1', function (d) { return d.source.x + opts.nodeWidth / 2 })
        .attr('y1', function (d) { return d.source.y })
        .attr('x2', function (d) { return d.target.x + opts.nodeWidth / 2 })
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
    Object.keys(link).forEach(function (key) {
      link[key].style('stroke', function (l) {
        if (d === l.source) {
          node.filter(function (n, i) { return i === l.target.index }).style('fill', 'red')
          return '#F00'
        }
      })
    })
  }

  function outHandler (d) {
    Object.keys(link).forEach(function (key) {
      link[key].style('stroke', null)
    })
    node.style('fill', null)
  }

  return api
}

module.exports = Network