'use strict'

var d3      = require('d3')
var Emitter = require('tiny-emitter')

var defaultOpts = {
  width: window.innerWidth,
  height: window.innerHeight,
  distance: {
    direct: 200,
    indirect: 500,
    misc: 500,
  },
}

function Force (opts) {
  opts = Object.assign({}, defaultOpts, opts || {})
  var emitter = new Emitter()


  var simulation = d3.forceSimulation()
      .force('link', d3.forceLink())
      .force('centering', d3.forceCenter(opts.width / 2, opts.height / 2))
      .on('tick', function () {
        emitter.emit('tick')
      })

  var api = {
    on : function (event, callback, context) { emitter.on(event, callback, context) },
    get simulation () { return simulation },
    get nodes () { return simulation.nodes() },
    get links () { return simulation.force('link').links() },


    reheat : function () {
      simulation.alpha(1).restart()
    },

    update : function (nodes, links) {
      if (nodes) simulation.nodes(nodes)
      if (links) {
        simulation.force('link', d3.forceLink()
                                   .links(links)
                                   .distance(function (d) {
                                      return opts.distance[d.type]
                                    })
                                   .id(function(d, i) { return d.raw.id })
                                  )
      }
      api.reheat()
    },

  }

  return api;
}

module.exports = Force