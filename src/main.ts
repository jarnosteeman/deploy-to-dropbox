const fs = require('fs')
const core = require('@actions/core')
const github = require('@actions/github')
const glob = require('glob')
const {upload, progress} = require('dropbox_session_upload')

const API = 'https://content.dropboxapi.com/2/files/'
const TOKEN =
    core.getInput('DROPBOX_ACCESS_TOKEN') ||
    '-0V__pv1bugAAAAAAAAAATkaOea9rLmfSenku7DfdepC0Ow_Lk3Kc5aiulZArQIw'
const GLOB = core.getInput('GLOB') || 'sample/**.*'
const DEST_PATH = core.getInput('DROPBOX_DESTINATION_PATH_PREFIX') || '/'
const CWD = process.cwd()

const CHUNK_SIZE = 150 * 1024 * 1024 // 150 mb

console.log(`searching for ${GLOB} in ${CWD}`)

glob(GLOB, {}, async (err: any, files: string[]) => {
    if (err) core.setFailed('Error: glob failed', err)
    console.log(`files found:`, files)
    try {
        for (const file of files) {
            console.log('upload file:', file)
            await upload(
                [
                    {
                        file: fs.createReadStream(file, {
                            highWaterMark: CHUNK_SIZE,
                        }),
                        saveLocation: DEST_PATH + file,
                        id: '1',
                    },
                ],
                TOKEN,
            )
        }
    } catch (err) {
        core.setFailed('Error: upload failed', err)
    }
})
