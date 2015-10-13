FROM node:onbuild
MAINTAINER michael.donat@me.com
ENV API_PORT=5158
ENV CONFIG_PATH=/opt/etc/config.json
EXPOSE 5158

COPY . /opt/
RUN npm install -g bunyan
RUN cd /opt; npm install --production
CMD ["node", "/opt/index.js"]
