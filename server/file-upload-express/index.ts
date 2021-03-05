import * as express from 'express'
import * as multer from 'multer'
import * as cors from 'cors'
import * as fs from 'fs'
import * as path from 'path'
import * as Loki from 'lokijs'
import { textFileFilter, loadCollection, clearFolder } from './utils'

// Setup
const DB_NAME = 'fileDb.json'
const COLLECTION_NAME = 'text-files'
const UPLOAD_PATH = 'upload'
const upload = multer({ dest: `${UPLOAD_PATH}`, fileFilter: textFileFilter })
const db = new Loki(`${UPLOAD_PATH}/${DB_NAME}`, { persistenceMethod: 'fs' })

// optional: clean all data before start
clearFolder(UPLOAD_PATH);

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
  try {
    const col = await loadCollection(COLLECTION_NAME, db)
    const data = col.insert(req.file)

    db.saveDatabase()
    res.send({ id: data.$loki, filename: data.filename, originalName: data.originalName })
  } catch (err) {
    console.log()
    res.sendStatus(400)
  }
})

app.get('/files', async (req, res) => {
  try {
    const col = await loadCollection(COLLECTION_NAME, db)
    res.send(col.data)
  } catch (err) {
    res.sendStatus(400)
  }
})

app.get('/files/:id', async (req, res) => {
  try {
    const col = await loadCollection(COLLECTION_NAME, db)
    const result = col.get(parseInt(req.params.id));

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
