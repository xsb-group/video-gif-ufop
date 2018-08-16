// require('../../env');
const path = require('path')
const fs = require('fs');
const exec = require('child_process').exec;
const { URL } = require('url');

const Promise = require('bluebird');

const Axios = require('axios');
const gifify = require('gifify');
const qiniu = require('./qiniu')

const TEMP_DIR = path.join(process.cwd(), 'temp');

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
        console.log(opts)
        gifify(input, opts).pipe(gif);
        gif.on('close',() => resolve(output));
        gif.on('error', err => reject(err))
    })
}

const rmAll = function(dir) {
    return new Promise((resolve, reject) => {
        exec('rm -rf ' + dir, function(err, res){
            if(err) {
                reject(err);
                return;
            }
            resolve(res);
        });
    });
}

module.exports = function (distUrl, fileName, opts = {
    resize: '200:-1',
    from: 1,
    to: 4
}, prefix = '') {
    const url = new URL(distUrl);
    // 获取文件名
    const gifName = `${fileName.split('.')[0]}.gif`;
    return Promise.try(() => {
        // console.log('test');
        return rmAll(TEMP_DIR)
        .then(() => {
            fs.mkdirSync(TEMP_DIR);
        });
    })
    .then(() => {
        return Axios.get(distUrl, {
            responseType: 'stream'
        })
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
        return qiniu.upload(filename, path.join(prefix, gifName))
    })
    .then((cdnpath) => {
        return path.join(`https://${process.env.QINIU_HOST}`, cdnpath.key);
    })
    .catch(err => {
        throw err;
    })
};


// module.exports('https://st0.dancf.com/xsb/3/templets/0/20180410-110255-2.mp4')