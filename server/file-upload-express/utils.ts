import * as del from 'del'
import * as Loki from 'lokijs'

const textFileFilter = function (req, file, cb) {
  // accept only text files
  if (!file.originalname.match(/\.(txt|csv|html|htm|xls|xlxs)$/)) {
    return cb(new Error('Only text files are allowed!'), false)
  }

  cb(null, true)
}

const loadCollection = function (colName: string, db: Loki): Promise<Loki.Collection<any>> {
  return new Promise(resolve => {
    db.loadDatabase({}, () => {
      const _collection = db.getCollection(colName) || db.addCollection(colName)
      resolve(_collection)
    })
  })
}

const clearFolder = function (folderPath: string): void {
  // Delete files inside folder but not the folder itself
  del.sync([`${folderPath}/**`, `!${folderPath}`])
}

export { textFileFilter, loadCollection, clearFolder }
