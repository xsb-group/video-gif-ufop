const path = require('path')
const fs = require('fs');
const Promise = require('bluebird');

const Axios = require('axios');
const gifify = require('gifify');
const qiniu = require('./qiniu')

const TEMP_DIR = path.join(__dirname, 'temp');

const pipeWrapper = function (readStream, fileName) {
    const tempVideo = path.join(TEMP_DIR, fileName);
    const writeStream = fs.createWriteStream(tempVideo)
    return new Promise((resolve, reject) => {
        readStream.pipe(writeStream)
        writeStream.on('close', () => resolve(tempVideo))
        readStream.on('error', err => reject(err));
        writeStream.on('error', err => reject(err))
    })
}

const gififyWrapper = function (input, output, opts) {
    console.log(input, output);
    return new Promise((resolve, reject) => {
        console.log('gifify')
        const gif = fs.createWriteStream(output);
        gifify(input, opts).pipe(gif);
        gif.on('close',() => resolve(output));
        gif.on('error', err => reject(err))
    })
}

module.exports = function (url, opts = {
    resize: '200:-1',
    from: 1,
    to: 4
}) {
    // 获取文件名
    const fileName = url.match('.*/(.*?)$')[1];
    const gifName = `${fileName.split('.')[0]}.gif`;
    return Axios.get(url, {
        responseType: 'stream'
    })
    .then(response => {
        // writeFile
        return pipeWrapper(response.data, fileName)
    })
    .then(filename => {
        return gififyWrapper(filename, path.join(TEMP_DIR, gifName), opts)
    })
    .then(filename => {
        // upload gif
        console.log(filename);
        return qiniu.upload(filename, gifName);
    })
    .then(filename => {
        // remove temp file
        return fs.unlinkSync(filename);
    })
    .then(() => {
        console.log('finished')
    })
    .catch(err => {
        console.log(err);
    })
};
