var through = require('through2')
var request = require('request')
var zlib = require('zlib')

module.exports = createStream

function createStream () {
  return through.obj(function (doc, enc, cb) {
    if (!doc.regnskab) return cb()

    getData(doc, function (err, files) {
      if (err) return cb(err)

      var norm = {
        cvr: doc.cvrNummer,
        source: doc,
        pdf: {
          name: doc.regnskab.regnskabsperiode.startDato + '-' + doc.regnskab.regnskabsperiode.slutDato + '.pdf',
          data: files.pdf
        },
        xml: {
          name: doc.regnskab.regnskabsperiode.startDato + '-' + doc.regnskab.regnskabsperiode.slutDato + '.xml',
          data: files.xml
        }
      }

      cb(null, norm)
    })
  })
}

function getData (doc, cb) {
  var pdfUrl = doc.dokumenter.filter(function (d) {
    return d.dokumentMimeType === 'application/pdf'
  })[0]

  var xmlUrl = doc.dokumenter.filter(function (d) {
    return d.dokumentMimeType === 'application/xml'
  })[0]

  download(pdfUrl && pdfUrl.dokumentUrl, function (err, pdf) {
    if (err) return cb(err)
    download(xmlUrl && xmlUrl.dokumentUrl, function (err, xml) {
      if (err) return cb(err)
      cb(null, {
        xml: xml,
        pdf: pdf
      })
    })
  })
}

function download (url, cb) {
  if (!url) return cb(null, null)
  request(url, {encoding: null}, function (err, res) {
    if (err) return cb(err)
    if (res.statusCode !== 200) return cb(new Error('Bad status code'))
    zlib.gunzip(res.body, cb)
  })
}
