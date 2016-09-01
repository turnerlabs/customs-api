FROM node:6.3.1
ADD . /opt/api
WORKDIR /opt/api
RUN npm install --production
CMD ["npm", "start"]
