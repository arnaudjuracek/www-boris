'use strict'

var Emitter = require('tiny-emitter')

var defaultOpts = {
  el: document.getElementById('sidebar'),
}

function Sidebar (opts) {
  var emitter = new Emitter()
  opts = Object.assign({}, defaultOpts, opts || {})

  var elements = {
    container: opts.container || opts.el,
    welcome: opts.el.querySelector('article#welcome'),
    title: opts.container.querySelector('h1'),
    time: {
      begin: opts.container.querySelector('time.begin'),
      end: opts.container.querySelector('time.end'),
    },
    content: opts.container.querySelector('div.content'),
    footer: {
      category: opts.container.querySelector('footer > .category'),
      location: opts.container.querySelector('footer > .location'),
      source: opts.container.querySelector('footer > .source'),
      tags: opts.container.querySelector('footer > .tags > ul'),
    }
  }

  var pnode

  var api = {
    get el () { return opts.el },
    get elements () { return elements },
    on : function (event, callback, context) { emitter.on(event, callback, context) },
    update: function (node) {
      if (elements.welcome.classList.contains('show')) {
        elements.welcome.classList.remove('show')
        elements.container.classList.add('slide-left')
      }
      if (!pnode || pnode.id !== node.id) {
        elements.container.style.display = ''
        elements.container.classList.remove('show', 'easing-slow')

        fillWith(node)
        pnode = node
        emitter.emit('update')
      }

      // force restyle
      // see http://stackoverflow.com/a/31862081
      window.getComputedStyle(elements.container).opacity;
      elements.container.classList.add('easing-slow', 'show')
      elements.container.classList.remove('slide-left')
    }
  }

  return api

  function fillWith (node) {
    elements.title.innerHTML = node.title

    parseDate(elements.time.begin, node.begin.raw)
    parseDate(elements.time.end, node.end.raw)

    parseContent(elements.content, node.content)

    parse(elements.footer.category, node.category)
    parse(elements.footer.location, node.location)

    parseUrl(elements.footer.source, node.source)
    parseTags(elements.footer.tags, node.tags)
  }

  function parseContent (el, str) {
    if (str) {
      el.style.display = ''
      el.innerHTML = ''

      var parts = str.split(/\r|\n/)
      for (var i in parts) {
        var p = document.createElement('p')
        p.innerHTML = parts[i]
        el.appendChild(p)
      }
    } else el.style.display = 'none'
  }

  function parseDate (el, timestamp) {
    if (timestamp) {
      el.style.display = ''
      var date = new Date(timestamp)
      var yyyy = date.getFullYear()
      var mm = ('0' + (date.getMonth()+1)).slice(-2)
      var dd = ('0' + date.getDate()).slice(-2)
      el.innerHTML = `${mm}/${yyyy}`
      el.setAttribute('datetime', `${yyyy}-${mm}-${dd}`)
    } else el.style.display = 'none'
  }

  function parseUrl (el, url) {
    if (url) {
      el.style.display = ''
      var value = el.querySelector('.value')
      value.innerHTML = ''

      var a = document.createElement('a')
      a.href = url
      a.innerHTML = a.hostname.split('www.').pop()

      value.appendChild(a)
    } else el.style.display = 'none'
  }

  function parseTags (el, tags) {
    if (tags) {
      el.style.display = ''
      el.innerHTML = ''

      for (var i = 0; i < tags.length; i++) {
        var tag = tags[i]

        var fa = document.createElement('i')
        fa.classList.add('fa', 'fa-tags')

        var value = document.createElement('span')
        value.classList.add('value')
        value.innerHTML = tag

        var li = document.createElement('li')
        li.appendChild(fa)
        li.appendChild(value)
        el.appendChild(li)
      }

    } else el.style.display = 'none'
  }

  function parse (el, content) {
    if (content) {
      el.style.display = ''
      var value = el.querySelector('.value')
      value.innerHTML = content
    } else el.style.display = 'none'
  }


}

module.exports = Sidebar