# video2gif

> 视频截取gif图并上传到七牛

## 配置


```js
QINIU_HOST=xxxx.com
QINIU_BUCKET=
QINIU_ACCESS_KEY=
QINIU_SECRET_KEY=
```

## docker

```shell
docker build -t video-gif .
docker run -idt -p 9100:9100 video-gif
```

## 使用
http://localhost:9100/video2gif?videoUrl=https://st0.dancf.com/xsb/3/templets/0/20180410-110255-2.mp4


## 请求参数

```js
/**
 * colors Number of colors, up to 255, defaults to 80
   compress Number        Compression (quality) level, from 0 (no compression) to 100, defaults to 40 压缩级别
   from <position>       Start position, hh:mm:ss or seconds, defaults to 0
   fps <n>               Frames Per Second, defaults to 10
   speed <n>             Movie speed, defaults to 1
   subtitles <filepath>  Subtitle filepath to burn to the GIF
   text <string>         Add some text at the bottom of the movie
   to <position>         End position, hh:mm:ss or seconds, defaults to end of movie
   videoUrl 视频路径
   cdnPrefix 存储前缀
 */
```