
require('../env');
const Koa = require('koa');
const app = new Koa();
const Router = require('koa-router');
const koaBody = require('koa-body');
const video2gif = require('./lib/video2gif');
const router = new Router();

// response

app.use(koaBody());

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
router.post('/*', async (ctx, next) => {
    console.log(ctx.query, ctx.request.body)
    const url = ctx.query.url || ctx.request.body.url;
    const cmd = ctx.query.cmd || ctx.request.body.cmd;
    try {
        const cmds = cmd.split('/');
        const ufop = cmds[0];
        if(ufop !== 'qntool-gify') {
            ctx.throw(400, 'cmd not support');
        }
        const fileName = cmds[cmds.length -2];
        const paramStrs = cmds[cmds.length - 1].split('-');
        const param = {
            from: +paramStrs[0],
            to: +paramStrs[1],
            resize: paramStrs[2] + ':-1',
            compress: +paramStrs[3]
        }
        const prefix = cmd.replace(ufop, '').replace(fileName, '');
        const query = Object.assign({
            resize: '200:-1',
            from: 5,
            to: 6.5,
            compress: 100,
        }, param);
        console.log(query)
        console.log(fileName, prefix)
        const cdnpath = await video2gif(url, fileName, query, prefix);
        ctx.body = cdnpath;
    }
    catch (err) {
        console.log(err);
        ctx.body = '';
    }
});


app
.use(router.routes())
.use(router.allowedMethods());


app.listen(9100, function() {
    console.log('video2gif start on 9100');
});

app.on('error', function(err) {
    console.log(err)
});