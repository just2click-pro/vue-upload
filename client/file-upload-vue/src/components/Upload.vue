<template>
  <div class="container">
    <!-- Upload -->
    <form enctype="multipart/form-data" novalidate v-if="isInitial || isSaving">
      <h2>Upload Files</h2>
      <div class="dropbox">
        <input
          ref="file"
          type="file"
          :name="uploadFileName"
          :disabled="isSaving"
          @change="filesChange($event.target.name, $event.target.files)"
            accept="text/*" class="input-file" />
          <p v-if="isInitial" @click="$refs.file.click()">
            Browse files
          </p>
        <p v-if="isSaving">
          Uploading file ...
        </p>
      </div>
    </form>

    <!-- Success -->
    <div v-if="isSuccess">
      <h3>Uploaded one files successfully.</h3>
      <p>
        <a href="javasctipt:void(0)" @click="reset()">Upload again</a>
      </p>
      <ul class="list-unstyled">
        {{ this.uploadedFiles[0].filename }}
      </ul>
    </div>
    <!-- Failed -->
    <div v-if="isFailed">
      <h3 class="warning">Uploading failed.</h3>
      <p>
        <a href="javasctipt:void(0)" @click="reset()">try again</a>
      </p>
      <pre class="waring">{{ uploadError }}</pre>
    </div>
  </div>
</template>

<script>
import { upload } from '../file-upload.service'

const STATUS_INITIAL = 0, STATUS_SAVING = 1, STATUS_SUCCESS = 2, STATUS_FAILED = 3

export default {
  name: 'upload',
  data() {
    return {
      uploadedFiles: [],
      uploadError: null,
      currenctStatus: null,
      uploadFileName: 'txtfile'
    }
  },
  computed: {
    isInitial () {
      return this.currenctStatus === STATUS_INITIAL
    },
    isSaving () {
      return this.currenctStatus === STATUS_SAVING
    },
    isSuccess () {
      return this.currenctStatus === STATUS_SUCCESS
    },
    isFailed () {
      return this.currenctStatus === STATUS_FAILED
    }
  },
  methods: {
    reset () {
      // reset from initial state
      this.currenctStatus = STATUS_INITIAL
      this.uploadedFiles = []
      this.uploadError = null
    },
    replaceErrors(key, value) {
      if (value instanceof Error) {
        var error = {};

        Object.getOwnPropertyNames(value).forEach(function (key) {
            error[key] = value[key];
        });

        return error;
      }

      return value;
    },
    save (formData) {
      const functionName = 'Upload::save: ' ;

      // upload data to the server
      this.currenctStatus = STATUS_SAVING

      upload(formData)
        .then(file => {
          console.log(functionName  + ' file = ', file);
          this.uploadedFiles.push(file);
          console.log(functionName  + ' this.uploadedFiles = ', this.uploadedFiles);
          this.currenctStatus = STATUS_SUCCESS
        })
        .catch(error => {
          console.log(functionName  + ' JSON.stringify(error, this.replaceErrors) = ', JSON.stringify(error, this.replaceErrors));
          this.uploadError = error.response;
          this.currenctStatus = STATUS_FAILED
        })
    },
    filesChange (fieldName, fileList) {
      // hnadle file changes
      if (!fileList.length) return

      // handle file changes
      const formData = new FormData()

      // Append the files to FormData
      Array
        .from(Array(fileList.length).keys())
        .map(index => {
          formData.append(fieldName, fileList[index], fileList[index].name)
        })

      // Save it
      this.save(formData)
    }
  },
  mounted () {
    this.reset()
  }
}
</script>

<!-- SASS styling -->
<style lang="sass">
  .dropbox
    border-radius: 10px
    margin: 0 auto
    outline: 2px dashed white
    outline-offset: -10px
    background: rgb(0, 163, 224)
    color: white
    padding: 10px 10px
    height: 50px
    position: relative
    cursor: pointer
    width: 200px

  .input-file
    opacity: 0
    width: 200px
    height: 50px
    position: absolute
    cursor: pointer

  .dropbox:hover
    border: 1px solid rgb(0, 163, 224)
    background: white
    color: rgb(0, 163, 224)
    outline: 2px dashed rgb(0, 163, 224)

  .dropbox p
    font-size: 1.2em
    margin: 10px 0
    text-align: center

  .warning
    color: tomato
</style>
