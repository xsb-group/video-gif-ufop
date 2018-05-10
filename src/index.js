
require('../env');
const Koa = require('koa');
const app = new Koa();
const Router = require('koa-router');
const video2gif = require('./lib/video2gif');
const router = new Router();

// response
// app.use(ctx => {
//     ctx.body = 'Hello Ufop';
// });

router.get('/health', (ctx, next) => {
   ctx.body = 'ok';
});

/**
 * --colors <n>            Number of colors, up to 255, defaults to 80
    --compress <n>          Compression (quality) level, from 0 (no compression) to 100, defaults to 40
    --from <position>       Start position, hh:mm:ss or seconds, defaults to 0
    --fps <n>               Frames Per Second, defaults to 10
    -o, --output <file>     Output file, defaults to stdout
    --resize <W:H>          Resize output, use -1 when specifying only width or height. `350:100`, `400:-1`, `-1:200`
    --reverse               Reverses movie
    --speed <n>             Movie speed, defaults to 1
    --subtitles <filepath>  Subtitle filepath to burn to the GIF
    --text <string>         Add some text at the bottom of the movie
    --to <position>         End position, hh:mm:ss or seconds, defaults to end of movie
    --no-loop               Will show every frame once without looping
    videoUrl 视频路径
 */
router.get('/video2gif', async (ctx, next) => {
    const query = ctx.query;
    const url = query.videoUrl;
    const cdnpath = await video2gif(url, query);
    ctx.body = cdnpath;
});

app
.use(router.routes())
.use(router.allowedMethods());


app.listen(9100, function() {
    console.log('video2gif start on 9100');
});

app.on('error', function() {

});