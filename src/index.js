
require('../env');
const Koa = require('koa');
const app = new Koa();
const Router = require('koa-router');
const video2gif = require('./lib/video2gif');
const router = new Router();

// response
app.use(ctx => {
    ctx.body = 'Hello Ufop';
});

router.get('/health', (ctx, next) => {
   ctx.body = 'ok';
});

app
.use(router.routes())
.use(router.allowedMethods());

router.get('/video2gif', async (ctx, next) => {
    const query = this.query;

    const video = query.video;
    const from = query.from;
    const duration = query.from;
    const end = query.end;

    const rate = 10;
    const cdnpath = await video2gif(video);
    this.body = cdnpath;
});

app.listen(9100, function() {
    console.log('video2gif start on 9100');
});

app.on('error', function() {

});