"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const Loki = require("lokijs");
const utils_1 = require("./utils");
// Setup
const DB_NAME = 'fileDb.json';
const COLLECTION_NAME = 'text-files';
const UPLOAD_PATH = 'upload';
const upload = multer({ dest: `${UPLOAD_PATH}`, fileFilter: utils_1.textFileFilter });
const db = new Loki(`${UPLOAD_PATH}/${DB_NAME}`, { persistenceMethod: 'fs' });
// optional: clean all data before start
utils_1.clearFolder(UPLOAD_PATH);
// app
const app = express();
app.use(cors());
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // default route
    res.send(`
    <h1>Demo file upload</h1>
    <p></p>
    <ul>
      <li>GET /files - list all uploaded files</li>
      <li>GET /files/{id} - get one uploaded file</li>
      <li>POST /file - handle single file upload</li>
    </ul>
  `);
}));
app.post('/upload', upload.single('txtfile'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const col = yield utils_1.loadCollection(COLLECTION_NAME, db);
        const data = col.insert(req.file);
        db.saveDatabase();
        res.send({ id: data.$loki, filename: data.filename, originalName: data.originalName });
    }
    catch (err) {
        console.log();
        res.sendStatus(400);
    }
}));
app.get('/files', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const col = yield utils_1.loadCollection(COLLECTION_NAME, db);
        res.send(col.data);
    }
    catch (err) {
        res.sendStatus(400);
    }
}));
app.get('/files/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const col = yield utils_1.loadCollection(COLLECTION_NAME, db);
        const result = col.get(parseInt(req.params.id));
        if (!result) {
            res.sendStatus(404);
            return;
        }
        res.setHeader('Content-type', result.mimetype);
        fs.createReadStream(path.join(UPLOAD_PATH, result.filename)).pipe(res);
    }
    catch (err) {
        res.sendStatus(400);
    }
}));
app.listen(3000, function () {
    console.log('listening on port 3000');
});
//# sourceMappingURL=index.js.map