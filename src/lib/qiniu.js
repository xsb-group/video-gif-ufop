
/**
 * services/oss
 * by qiniu
 *
 * 扩展部分方法
 *
 * upload
 * stat
 * imageInfo
 *
 * www/0/design/1460913216596-1.jpg
 */
'use strict';

const path = require('path');
const { URL } = require('url');

const axios = require('axios');
const qiniu = require('qiniu');
const lodash = require('lodash');
const moment = require('moment');
const random = require('random-js')();
const Promise = require('bluebird');

// base config
qiniu.conf.ACCESS_KEY = process.env.QINIU_ACCESS_KEY;
qiniu.conf.SECRET_KEY = process.env.QINIU_SECRET_KEY;

// promisify
Promise.promisifyAll(qiniu.rs.Client.prototype);

// extend methods
lodash.assign(qiniu, {
    url(key) {
        let baseUrl = qiniu.conf.UP_HOST + '/';

        return baseUrl + key;
    },
    downlodUrl(url) {
        let policy = new qiniu.rs.GetPolicy(600);
        return policy.makeRequest(url);
    },
    uptoken(bucket, key) {
        let scope = bucket;
        if (key) {
            scope += ':' + key;
        }

        let putPolicy = new qiniu.rs.PutPolicy(scope);

        return putPolicy.token();
    },
    upload(file, key, bucket) {
        let typeToExtMap = {
            jpeg: 'jpg'
        };

        let ext = '';
        let isBuffer = Buffer.isBuffer(file);
        if (isBuffer) {
            ext = path.basename('' + file.type);
            ext = typeToExtMap[ext] || ext;
            ext = '.' + ext;
        }
        else {
            ext = path.extname(file);
        }

        // 自动补全 key
        if (!key) {
            key = 'tmp/';
            key += moment().format('YYYY-MM-DD') + '/';
        }
        // 自动补全 name
        if (key.slice(-1) === '/') {
            key += moment().format('YYYYMMDD-HHmmss-');
            key += random.string(5) + ext;
        }

        if (!bucket) {
            bucket = process.env.QINIU_BUCKET;
        }

        let token = this.uptoken(bucket, key);
        let extra = new qiniu.io.PutExtra();

        return new Promise((resolve, reject) => {
            let method = isBuffer ? 'put' : 'putFile';

            // support buffer
            qiniu.io[method](token, key, file, extra, (err, ret) => {
                if (err) {
                    // logger.error(err);

                    // qiniu error
                    // { code: 502, error: [SyntaxError: Unexpected token <] }
                    return reject(new Error(err.error));
                }

                // logger.debug('file upload ret:', ret);
                resolve(ret);
            });
        });
    },
    stat(key) {
        let client = new qiniu.rs.Client();

        let bucket = process.env.QINIU_BUCKET;

        bucket = 'danchaofan-dev';

        return client.statAsync(bucket, key);
    },
    imageInfo(key) {
        let baseUrl = 'http://' + process.env.QINIU_HOST;
        let url = baseUrl + '/' + key + '?imageInfo';

        return axios.get(url)
            .then(res => {
                let info = res.data;

                // info.url = url;
                info.key = key;

                return info;
            });
    },
    unzip(key, saveBucket, version) {
        // 可以对转码后的文件进行使用saveas参数自定义命名，当然也可以不指定文件会默认命名并保存在当前空间
        let ufop = '?qntool-unzip/bucket/' + qiniu.util.urlsafeBase64Encode(saveBucket);
        if (version) {
            ufop += '/prefix/' + qiniu.util.urlsafeBase64Encode(version);
        }
        const url = key + ufop;
        return axios.get(url)
            .then(res => {
                let info = res.data;

                // info.url = url;
                info.key = key;
                return info;
            });
    },
    remove(key) {
        // 构建bucketmanager对象
        const client = new qiniu.rs.Client();
        // 你要测试的空间， 并且这个key在你空间中存在
        let bucket = process.env.QINIU_BUCKET;
        // 删除资源
        return new Promise((resolve, reject) => {
            client.remove(bucket, key, (err, ret) => {
                if (!err) {
                    resolve(ret);
                }
                else {
                    reject(err);
                }
            });
        });
    },
    removeDir(dir, limit) {
        let bucket = process.env.QINIU_BUCKET;
        const options = {
            limit: limit || 1000,
            prefix: dir,
        };
        // 获取前缀下的文件列表
        return new Promise((resolve, reject) => {
            qiniu.rsf.listPrefix(bucket, options.prefix, '', options.limit, '', (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    const items = result.items;
                    const deleteOperations = [];
                    // 构建批量删除请求数据
                    items.forEach((item) => {
                        deleteOperations.push(new qiniu.rs.EntryPath(bucket, item.key));
                    });
                    // 批量删除
                    return this.batchDelete(deleteOperations);
                }
            });
        });
    },
    batchDelete(items) {
        const client = new qiniu.rs.Client();
        return new Promise((resolve, reject) => {
            client.batchDelete(items, (err, ret) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(ret);
                }
            });
        });
    }
});

module.exports = qiniu;

// test
// qiniu.imageInfo('www/0/design/1460913216596-1.jpg').then(ret => {
//     console.log(typeof ret, ret);
// });
