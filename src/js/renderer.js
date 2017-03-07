'use strict'

var d3      = require('d3')
var Emitter = require('tiny-emitter')
var Force   = require('./force.js')

var defaultOpts = {
  scale: [0.1, 8],
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

  update()
  graph.on('update', update)
  graph.force.on('tick', tickHandler)

  var api = {
    on : function (event, callback, context) { emitter.on(event, callback, context) },
    update : function () { update() },
  }

  return api

  function update () {
    node = nodeContainer.selectAll('g.node')
      .data(graph.nodes, function (d) { return d.id })

    node.exit().remove()

    var nodeEnter = node.enter().append('g')
      .attr('class', function (d) { return `node ${d.raw.pinned ? 'pinned' : ''} easing` })
      .call(
            d3.drag()
            .subject(dragsubject)
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended))

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
        return d.source.id + '-' + d.target.id
      })

    link.enter().append('line')
      .attr('id', function (d) { return d.source.id + '-' + d.target.id })
      .attr('class', function (d) { return `link ${d.type} easing` })

    link.exit().remove()
  }

  function tickHandler () {
    node.attr('transform', function (d) {
      return 'translate(' + d.x + ',' + d.y + ')'
    })

    link
      .attr('x1', function (d) { return d.source.x })
      .attr('y1', function (d) { return d.source.y })
      .attr('x2', function (d) { return d.target.x })
      .attr('y2', function (d) { return d.target.y })

    emitter.emit('tick')
  }

  function zoomHandler () {
    ctx.attr('transform', d3.event.transform)
    emitter.emit('zoom', d3.event.transform)
  }

  function dragsubject() {
    return graph.force.simulation.find(d3.event.x, d3.event.y)
  }

  function dragstarted () {
    if (!d3.event.active) graph.force.simulation.alphaTarget(0.3).restart();
    d3.event.subject.fx = d3.event.subject.x;
    d3.event.subject.fy = d3.event.subject.y;
  }

  function dragged() {
    d3.event.subject.fx = d3.event.x;
    d3.event.subject.fy = d3.event.y;
  }

  function dragended() {
    if (!d3.event.active) graph.force.simulation.alphaTarget(0);
    d3.event.subject.fx = null;
    d3.event.subject.fy = null;
  }

  function hoverStart (d) { emitter.emit('mouseover', d.raw) }
  function hoverEnd (d) { emitter.emit('mouseout') }

}

module.exports = Renderer