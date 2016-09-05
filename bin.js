#!/usr/bin/env node

var raf = require('random-access-file')
var level = require('level')
var path = require('path')
var through = require('through2')
var hyperdrive = require('hyperdrive')
var swarm = require('hyperdrive-archive-swarm')
var createDataStream = require('./create-data-stream')
var createNormalizeStream = require('./create-normalize-stream')

var db = level('virk.dk.db')
var drive = hyperdrive(db)

db.get('_key', function (_, key) {
  db.get('_last', {valueEncoding: 'json'}, function (_, last) {
    ready(key, last)
  })
})

function ready (key, last) {
  var archive = drive.createArchive(key, {
    file: function (filename) {
      return raf(path.join('virk.dk.data', path.join('/', filename)))
    }
  })

  swarm(archive)

  console.log('Importing virk.dk data to ' + archive.key.toString('hex') + ' (last entry was ' + (last ? last.indlaesningsTidspunkt : '(nil)') + ')')

  if (process.argv.indexOf('--no-resume') > -1) return

  db.put('_key', archive.key.toString('hex'), function (err) {
    if (err) throw err
    createDataStream(last).pipe(createNormalizeStream()).pipe(through.obj(write))
  })

  function write (doc, enc, cb) {
    archive.createFileWriteStream(doc.cvr + '/' + doc.pdf.name).end(doc.pdf.data, function () {
      archive.createFileWriteStream(doc.cvr + '/' + doc.xml.name).end(doc.xml.data, function () {
        console.log('Last imported entry was', doc.source.indlaesningsTidspunkt)
        db.put('_last', doc.source, {valueEncoding: 'json'}, cb)
      })
    })
  }
}

