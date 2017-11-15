FROM node:7.8.0

# node.js dependencies

# start api @5238
RUN npm install -g serve
CMD serve -s build
EXPOSE 5238

# Install all dependencies of the current project.
COPY package.json package.json
RUN npm install

# Copy all local files into the image.
COPY . .

# Build for production.
RUN npm run build --production