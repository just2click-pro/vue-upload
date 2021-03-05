"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearFolder = exports.loadCollection = exports.textFileFilter = void 0;
const del = require("del");
const textFileFilter = function (req, file, cb) {
    // accept only text files
    if (!file.originalname.match(/\.(txt|csv|html|htm|xls|xlxs)$/)) {
        return cb(new Error('Only text files are allowed!'), false);
    }
    cb(null, true);
};
exports.textFileFilter = textFileFilter;
const loadCollection = function (colName, db) {
    return new Promise(resolve => {
        db.loadDatabase({}, () => {
            const _collection = db.getCollection(colName) || db.addCollection(colName);
            resolve(_collection);
        });
    });
};
exports.loadCollection = loadCollection;
const clearFolder = function (folderPath) {
    // Delete files inside folder but not the folder itself
    del.sync([`${folderPath}/**`, `!${folderPath}`]);
};
exports.clearFolder = clearFolder;
//# sourceMappingURL=utils.js.map