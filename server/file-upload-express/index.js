const express = require('express')
const multer = require('multer')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const Loki = require('lokijs')
const del = require('del')

const fileName = 'index.js: ';

// import { textFileFilter, loadCollection, clearFolder } from './utils'

// Utils.js
const textFileFilter = function (req, file, cb) {
  // accept only text files
  if (!file.originalname.match(/\.(txt|csv|html|htm|xls|xlxs)$/)) {
    return cb(new Error('Only text files are allowed!'), false)
  }

  cb(null, true)
}

const loadCollection = function (colName, db) {
  return new Promise(resolve => {
    db.loadDatabase({}, () => {
      const _collection = db.getCollection(colName) || db.addCollection(colName)
      resolve(_collection)
    })
  })
}

const clearFolder = function (folderPath) {
  // Delete files inside folder but not the folder itself
  del.sync([`${folderPath}/**`, `!${folderPath}`])
}

// Setup
const DB_FILE_NAME = 'fileDb.json'
const COLLECTION_NAME = 'text-files'
const UPLOAD_PATH = 'upload'
const upload = multer({ dest: `${UPLOAD_PATH}`, fileFilter: textFileFilter })
const db = new Loki(`${UPLOAD_PATH}/${DB_FILE_NAME}`, { persistenceMethod: 'fs' })

// optional: clean all data before start
// clearFolder(UPLOAD_PATH);

// app
const app = express()
app.use(cors())

app.get('/', async (req, res) => {
  // default route
  res.send(`
    <h1>Demo file upload</h1>
    <p></p>
    <ul>
      <li>GET /files - list all uploaded files</li>
      <li>GET /files/{id} - get one uploaded file</li>
      <li>POST /file - handle single file upload</li>
    </ul>
  `)
})

app.post('/upload', upload.single('txtfile'), async (req, res) => {
  const path = '/upload'
  console.log(`${fileName} ${path} called !`)
  console.log(fileName + ' req.file = ', req.file);
  try {
    const collection = await loadCollection(COLLECTION_NAME, db)
    const data = collection.insert(req.file)
    console.log(fileName + path + ' data = ', JSON.stringify(data));

    db.saveDatabase()
    res.status(200).send({ id: data.$loki, filename: data.filename, originalName: data.originalName })
  } catch (err) {
    console.log(fileName + path + ' err = ', err);
    res.status(400).send(err)
  }
})

app.get('/files', async (req, res) => {
  try {
    const collection = await loadCollection(COLLECTION_NAME, db)
    res.send(collection.data)
  } catch (err) {
    res.sendStatus(400)
  }
})

app.get('/files/:id', async (req, res) => {
  try {
    const collection = await loadCollection(COLLECTION_NAME, db)
    const result = collection.get(parseInt(req.params.id));

    if (!result) {
      res.sendStatus(404)
      return
    }

    res.setHeader('Content-type', result.mimetype)
    fs.createReadStream(path.join(UPLOAD_PATH, result.filename)).pipe(res)
  } catch (err) {
    res.sendStatus(400)
  }
})

app.listen(3000, function () {
  console.log('listening on port 3000')
})
