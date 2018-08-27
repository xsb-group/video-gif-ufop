const video2gif = require('../src/lib/video2gif');
const Promise = require('bluebird');
const axios = require('axios');
const results = [];

const templets = [
    'https://st0.dancf.com/xsb/3/templets/59353/20180715-171525-de04.mp4',
    'https://st0.dancf.com/xsb/3/templets/0/20180714-192231-d812.mp4',
    'https://st0.dancf.com/xsb/3/templets/0/20180713-150754-ccee.mp4',
    'https://st0.dancf.com/xsb/3/templets/0/20180710-152446-fdc1.mp4',
    'https://st0.dancf.com/xsb/3/templets/0/20180709-124046-63e7.mp4',
    'https://st0.dancf.com/xsb/3/templets/0/20180709-114457-c4a3.mp4',
    'https://st0.dancf.com/xsb/3/templets/0/20180709-103821-feb4.mp4',
    'https://st0.dancf.com/xsb/3/templets/0/20180707-153417-fc61.mp4',
    'https://st0.dancf.com/xsb/3/templets/0/20180707-152817-c5d8.mp4',
    'https://st0.dancf.com/xsb/3/templets/0/20180706-175140-bb1b.mp4'
]
const fpss = [];
const widths = [];

for (let fps = 1; fps < 10; fps++) {
    fpss.push(fps);
}
for (let width = 100; width <= 500; width = width + 50) {
    widths.push(width);
}

 return Promise.try(() => {
        return fpss;
})
.each(fps => {
    return Promise.try(() => {
        return [200, 250]
    })
    .each(width => {
        return Promise.try(() => {
            return templets;
        })
        .each(templet => {
            const fileName = templet.split('.com/')[1];
            const body = {
                url: templet,
                cmd: `qntool-gify/${fileName}/256-1-1.5-0-${width}-2-${fps}`,
                colors: 256,
                fps: fps,
                resize: width + ':-1',
                from: 1,
                speed: 2,
                compress: 0,
                to: 2
            }
            console.log(body);
            return axios.post('http://localhost:9200/handler', body)
            .then(ret => {
                console.log(ret.data);
                results.push({
                    fps: fps,
                    url: ret.data.replace('https:/', 'https://'),
                    width: width
                })
            })
            .catch(err => {
                console.log(err);
            })
        })
    })
})
// console.log(fps)
.then(() => {
    console.log(JSON.stringify(results));

})