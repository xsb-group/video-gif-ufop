// require('../../env');
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
    return new Promise((resolve, reject) => {
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
}, cdnPrefix = '') {
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
        return qiniu.upload(filename, path.join(cdnPrefix, gifName))
        .then((res) => {
            return Promise.try(() => {
                fs.unlinkSync(path.join(TEMP_DIR, fileName));
                fs.unlinkSync(path.join(TEMP_DIR, gifName));
                return res.key;
            });
        });
    })
    .then((cdnpath) => {
        return path.join(`https://${process.env.QINIU_HOST}`, cdnpath);
    })
    .catch(err => {
        throw err;
    })
};

// module.exports('https://st0.dancf.com/xsb/3/templets/0/20180410-110255-2.mp4')