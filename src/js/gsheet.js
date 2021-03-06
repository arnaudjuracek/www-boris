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
      var dates = {
        begin: new Date(cells[0]),
        end: new Date(cells[1]),
      }

      nodes.push({
        id: i,
        pinned: isNaN(dates.begin.getTime()),
        begin: {
          date: dates.begin,
          raw: dates.begin.getTime(),
        },
        end: {
          date: dates.end,
          raw: dates.end.getTime(),
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
