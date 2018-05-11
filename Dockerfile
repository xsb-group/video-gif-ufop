FROM jrottenberg/ffmpeg

RUN apt-get update
RUN apt-get -y install software-properties-common
RUN apt-get -y install unzip imagemagick curl tzdata ntpdate

# install fork of gifsicle with better lossless gif support
ADD gifsicle-1.82.1-lossy.zip ./
RUN unzip gifsicle-1.82.1-lossy.zip -d gifsicle
RUN mv gifsicle/linux/gifsicle-debian6 /usr/local/bin/gifsicle

ENV NPM_CONFIG_LOGLEVEL info
ENV NODE_VERSION 8.9.1

# 中科大nodejs源
RUN curl -SLO "http://ipv4.mirrors.ustc.edu.cn/node/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.gz" \
    && tar -xvf "node-v$NODE_VERSION-linux-x64.tar.gz" -C /usr/local --strip-components=1 \
    && rm "node-v$NODE_VERSION-linux-x64.tar.gz" \
    && ln -s /usr/local/bin/node /usr/local/bin/nodejs

ADD ./ /root/workspace

WORKDIR /root/workspace

# 修改时区
RUN cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
# 同步时间
# RUN ntpdate ntpdate  0.cn.pool.ntp.org

RUN npm install pm2 -g
RUN bash -c 'cd /root/workspace && npm install'

EXPOSE  9100

ENTRYPOINT npm start && /bin/bash
