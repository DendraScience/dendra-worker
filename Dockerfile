FROM node:10.15.1

MAINTAINER J. Scott Smith <scott@newleafsolutionsinc.com>

#
# Following Best Practices and guidelines at:
# 	https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
# 	https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md
#

RUN groupmod -g 2000 node \
  && usermod -u 2000 -g 2000 node

WORKDIR /home/node/app

# Best practice: run with NODE_ENV set to production
ENV NODE_ENV production

# Install dependencies
COPY package.json /home/node/app
COPY package-lock.json /home/node/app
RUN npm install

# Best practice: run as user 'node'
USER node
EXPOSE 8080

# Create cache folder
RUN mkdir -p /home/node/cache

# Create state folder
RUN mkdir -p /home/node/state

# Copy source dist; relies on .dockerignore
# NOTE: Must perform 'npm run build' beforehand
COPY . /home/node/app

# Best practice: bypass the package.json's start
CMD [ "node", "./dist/server/main.js" ]
