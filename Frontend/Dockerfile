FROM node:7.8.0

# 'react-scripts' for building react projects
RUN npm install -g react-scripts

# 'serve' for serving the frontend via http
RUN npm install -g serve
CMD serve -s build
EXPOSE 5000

# Install all dependencies of the current project.
COPY package.json package.json
RUN npm install

# Copy all local files into the image.
COPY . .

# Build for production.
RUN npm run build --production
