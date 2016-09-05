var request = require('request')
var from = require('from2')

module.exports = createStream

function createStream (prev) {
  var stream = from.obj(read)
  return stream

  function read (size, cb) {
    var date = prev ? prev.indlaesningsTidspunkt : '2000-01-01T00:00:00.000Z'

    get(date, function (err, docs) {
      if (err) throw err
      if (!docs.length) return cb(null, null)

      var last = docs[docs.length - 1]
      for (var i = 0; i < docs.length - 1; i++) stream.push(docs[i]._source)
      prev = last._source

      cb(null, prev)
    })
  }
}

function get (prev, cb) {
  var n = new Date(new Date(prev).getTime() + 1).toISOString()
  var url = 'http://distribution.virk.dk/offentliggoerelser/offentliggoerelse/_search?q=indlaesningsTidspunkt:[' + n + '%20TO%20*]&sort=indlaesningsTidspunkt:asc'
  request(url, {json: true}, function (err, res) {
    if (err) return cb(err)
    cb(null, res.body.hits.hits)
  })
}
