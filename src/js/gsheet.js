'use strict'

var Emitter = require('tiny-emitter')
var sheetrock = require('sheetrock')

var defaultOpts = {
  rowOffset: 0,
  delimiter: /\s*[;,]\s*/
}

function GSheet (opts) {
  opts = Object.assign({}, defaultOpts, opts || {})
  var emitter = new Emitter()

  var cells = []
  var api = {
    get cells () { return cells },

    on: function (event, callback, context) { emitter.on(event, callback, context) },
    query: function (UID, cb) {
      sheetrock({
        url: `https://docs.google.com/spreadsheets/d/${UID}/edit#gid=0`,
        callback: function (error, options, response) {
          if (!error) {
            cells = parseRows(response.rows, opts.rowOffset) // second param is a row offset to skip table's header
            emitter.emit('load', response)
          } else emitter.emit('error', error)

          if (cb) cb(error, response)
        }
      })
    }
  }

  return api

  function parseRows (rows, offset) {
    var nodes = []
    for (var i = offset || 0; i < rows.length; i++) {
      var cells = rows[i].cellsArray
      nodes.push({
        id: i,
        begin: {
          date: new Date(cells[0]),
          raw: new Date(cells[0]).getTime()
        },
        end: {
          date: new Date(cells[1]),
          raw: new Date(cells[1]).getTime(),
        },
        title: cells[2],
        category: cells[3],
        content: cells[4],
        location: cells[8],
        duration: cells[9],
        source: cells[10],
        tags: cells[11].replace(/^\s+|\s+$/g, '').split(opts.delimiter),
        links: {
          direct: cells[5].replace(/^\s+|\s+$/g, '').split(opts.delimiter),
          indirect: cells[6].replace(/^\s+|\s+$/g, '').split(opts.delimiter),
          misc: cells[7].replace(/^\s+|\s+$/g, '').split(opts.delimiter)
        },
      })
    }
    return nodes
  }

}

module.exports = GSheet
