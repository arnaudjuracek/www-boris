'use strict'

var GSheet = require('./js/gsheet.js')

var gs = GSheet({})
gs.on('load', (data) => console.log(data))
gs.on('error', (err) => console.error(err))

gs.query('16LTS9c8EwuhwAyLgnY3WmII2x-hL16FzmOPyNSvGiv4', function (err, resp) {
  if (!err) {
    console.log(gs.cells)
  }
})

// var d3        = require('d3');

// var width = window.innerWidth;
// var height = window.innerHeight;

// var svg = d3.select('body').append('svg')
//     .attr('width', width)
//     .attr('height', height);

// var g = svg.append('g');

// svg.call(d3.zoom()
//     .scaleExtent([0.1, 8])
//     .on('zoom', zoomed));

// // -------------------------------------------------------------------------

// var table = (function() {
//   var nodes = d3.range(200).map(function(i) {
//     return {
//       index: i,
//       name : i
//     };
//   });

//   var links = (function() {
//     var links = [];
//     for (var i = 0; i < nodes.length / 2; i++) {
//       links.push({
//         source: Math.floor(Math.sqrt(i)),
//         target: i + 1,
//         distance: i,
//       });
//     }
//     return links;
//   })();

//   return {nodes, links};
// })();

// // -------------------------------------------------------------------------

// var simulation = d3.forceSimulation(table.nodes)
//                    .force('link', d3.forceLink().strength(1))
//                    .force('collision', d3.forceCollide(30))
//                    .force('centering', d3.forceCenter(width / 2, height / 2))
//                    .on('tick', tick);
// simulation.force('link').links(table.links);

// var link = g.selectAll()
//     .data(table.links)
//     .enter().append('line')
//     .attr('class', 'link easing');

// var node = g.selectAll()
//     .data(table.nodes)
//     .enter().append('g')
//     .attr('class', 'node easing')
//     .call(d3.drag().on('drag', dragged));

// node.append('circle')
//     .attr('r', 10)
//     .attr('x', 0)
//     .attr('y', 0);

// node.append('text')
//     .attr('dx', 0)
//     .attr('dy', '.35em')
//     .text(function(d) { return d.name });

// node.on('mouseover', function(d) {
//   link.style('stroke', function(l) {
//     if (d === l.source) {
//       node.filter(function (n, i) { return i === l.target.index}).style('fill', 'red');
//       return '#F00';
//     }
//   });
// }).on('mouseout', function(d) {
//   link.style('stroke', null);
//   node.style('fill', null);
// });

// function zoomed() {
//   g.attr('transform', d3.event.transform);
// }

// function dragged(d) {
//   // reheat simulation
//   simulation.restart().alpha(0.01).alphaTarget(0);
//   d3.select(this).attr('cx', d.x = d3.event.x).attr('cy', d.y = d3.event.y);
// }

// function tick() {
//   link.attr('x1', function(d) { return d.source.x; })
//       .attr('y1', function(d) { return d.source.y; })
//       .attr('x2', function(d) { return d.target.x; })
//       .attr('y2', function(d) { return d.target.y; });

//   node.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });
// }

// // -------------------------------------------------------------------------
