import * as axios from 'axios';

const BASE_URL = 'http://localhost:3000';

function upload(formData) {
    const functionName = 'file-upload.service::upload: ';
    const url = `${BASE_URL}/upload`;
    return axios.post(url, formData)
        // get data
        .then((file) => {
            console.log(functionName + ' file = ', file);
            file = file.data
            return file
        })
        // add url field
        .then((file) => {
            console.log(functionName + ' file = ', file);
            file.url = `${BASE_URL}/files/${file.id}`
            return file
        })
}

export { upload }
