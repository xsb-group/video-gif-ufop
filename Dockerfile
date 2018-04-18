FROM node:8-alpine
MAINTAINER sharksevenRo<sharksevenluo@gmail.com>

RUN apt-get -y update && apt-get install -y graphicsmagick ffmpeg
RUN ADD src/ /root/workpsace
WORKDIR /roo/workpsace
RUN npm install pm2 -g
RUN bash -c 'cd /root/workspace && npm install'

EXPOSE  9100

ENTRYPOINT [ "pm2", "index.js" ]