'use strict'

var d3      = require('d3')
var Emitter = require('tiny-emitter')
var Force   = require('./force.js')

var defaultOpts = {
  scale: [0.1, 8],
  decimal: 10,
}

function Renderer (graph, opts) {
  var emitter = new Emitter()
  opts = Object.assign({}, defaultOpts, opts || {})

  var svg = d3.select('main').append('svg')
                                .call(
                                      d3.zoom()
                                        .scaleExtent(opts.scale)
                                        .on('zoom', zoomHandler)
                                      )

  var ctx = svg.append('g').attr('class', 'container')
  var linkContainer = ctx.append('g').attr('class', 'links')
  var nodeContainer = ctx.append('g').attr('class', 'nodes')

  var node, link
  var dragging = false

  update()
  graph.on('update', update)
  graph.force.on('tick', tickHandler)

  var api = {
    on : function (event, callback, context) { emitter.on(event, callback, context) },
    update : function () { update() },

    addClass : function (id, className) { setClass(id, className, true) },
    removeClass : function (id, className) { setClass(id, className, false) },

    addOutsideClass : function (node) { setOutsideClass(node, true) },
    removeOutsideClass : function (node) { setOutsideClass(node, false) },
    updateOutsideClass : function (nodes) {
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i]
        setOutsideClass(nodes[i], node.isOutside)
      }
    }
  }

  return api

  function update () {
    node = nodeContainer.selectAll('g.node')
      .data(graph.nodes, function (d) { return d.id })

    node.exit().remove()

    var nodeEnter = node.enter().append('g')
      .attr('id', function (d) { return `node-${d.id}` })
      .attr('class', function (d) { return `node ${d.raw.pinned ? 'pinned ' : ''} easing` })
      .call(
            d3.drag()
            .subject(dragSubject)
            .on('start', dragStarted)
            .on('drag', dragged)
            .on('end', dragEnded))

    nodeEnter.append('svg:circle')
      .attr('r', function (d) { return d.raw.pinned ? 20 : 10 })
      .attr('class', 'easing')
      .on('mouseover', hoverStart)
      .on('mouseout', hoverEnd)

    nodeEnter.append('svg:text')
      .attr('x', function (d) {
        return d.raw.pinned ? 30 : 20
      })
      .attr('y', 5)
      .attr('class', 'easing')
      .text(function (d) {
        return `${d.raw.title}`
      })


    link = linkContainer.selectAll('line')
      .data(graph.links, function (d) {
        return `${d.type}-${d.source.id}-${d.target.id}`
      })

    link.enter().append('line')
      .attr('id', function (d) { return `${d.type}-${d.source.id}-${d.target.id}` })
      .attr('class', function (d) {
        return `link ${d.type} easing`
      })

    link.exit().remove()
  }

  function setClass (id, className, value) {
    ctx.select(`#${id}`).classed(className, value)
  }

  function setOutsideClass (node, value) {
    setClass(`node-${node.id}`, 'outside', value)
    for (var i = 0; i < node.links.length; i++) {
      var link = node.links[i]
      setClass(`${link.type}-${link.source}-${link.target}`, 'outside', value)
      for (var j = 0; j < node.targetOf.length; j++) {
        link = node.targetOf[j]
        setClass(`${link.type}-${link.source}-${link.target}`, 'outside', value)
      }
    }
  }

  function tickHandler () {
    node.attr('transform', function (d) {
      return 'translate(' + (Math.floor(d.x * opts.decimal) / opts.decimal) + ',' + (Math.floor(d.y * opts.decimal) / opts.decimal) + ')'
    })

    link
      .attr('x1', function (d) { return (Math.floor(d.source.x * opts.decimal) / opts.decimal) })
      .attr('y1', function (d) { return (Math.floor(d.source.y * opts.decimal) / opts.decimal) })
      .attr('x2', function (d) { return (Math.floor(d.target.x * opts.decimal) / opts.decimal) })
      .attr('y2', function (d) { return (Math.floor(d.target.y * opts.decimal) / opts.decimal) })

    emitter.emit('tick')
  }

  function zoomHandler () {
    ctx.attr('transform', d3.event.transform)
    emitter.emit('zoom', d3.event.transform)
  }

  function dragSubject() {
    return graph.force.simulation.find(d3.event.x, d3.event.y)
  }

  function dragStarted () {
    dragging = true
    if (!d3.event.active) graph.force.simulation.alphaTarget(0.3).restart();
    d3.event.subject.fx = d3.event.subject.x;
    d3.event.subject.fy = d3.event.subject.y;
  }

  function dragged() {
    d3.event.subject.fx = d3.event.x;
    d3.event.subject.fy = d3.event.y;
  }

  function dragEnded() {
    dragging = false
    if (!d3.event.active) graph.force.simulation.alphaTarget(0);
    d3.event.subject.fx = null;
    d3.event.subject.fy = null;
    link.attr('opacity', 1)
  }

  function hoverStart (d) {
    if (!dragging) {
      // using attr('opacity') instead of style('opacity')
      // to prevent conflict with css .link.outside
      link.attr('opacity', function (l) {
        return (d.raw.id === l.source.id || d.raw.id === l.target.id) ? 1 : 0.1
      })
      emitter.emit('mouseover', d.raw)
    }
  }

  function hoverEnd (d) {
    if (!dragging) {
      link.attr('opacity', 1)
      emitter.emit('mouseout')
    }
  }


}

module.exports = Renderer