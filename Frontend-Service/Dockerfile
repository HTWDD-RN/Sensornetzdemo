FROM node:boron

# Create app directory
WORKDIR /usr/src/app

#Install app dependencies
COPY package.json .
COPY package-lock.json .

RUN npm install

# Bundle app source
COPY . .
EXPOSE 5238
EXPOSE 5683

ENV IP_ADDRESS "2001:db8::5855:1277:fb88:4f1e"
ENV MODE "start"

CMD echo ${MODE}
CMD npm run ${MODE}

# # node.js dependencies

# # start api @5238
# RUN npm install -g serve
# CMD serve -s build
# EXPOSE 5238

# # Install all dependencies of the current project.
# COPY package.json package.json
# RUN npm install

# # Copy all local files into the image.
# COPY . .

# # Build for production.
# RUN npm run start --production
