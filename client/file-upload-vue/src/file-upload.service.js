import * as axios from 'axios';

const BASE_URL = 'http://localhost:3000';

function upload(formData) {
    const url = `${BASE_URL}/upload`;
    return axios.post(url, formData)
        // get data
        .then(file => file.data)
        // add url field
        .then(file => file.map(fileObj => Object.assign({},
            fileObj, { url: `${BASE_URL}/files/${fileObj.id}` })));
}

export { upload }
