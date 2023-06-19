# Use the official Ruby 2.7.6 image as the base image
FROM ruby:2.7.6

# Install Node.js and npm
RUN apt-get update && apt-get install -y nodejs npm

# RUN   apt-get install -y nodejs npm

# Set the working directory to /app
WORKDIR /app

# Copy the Gemfile and Gemfile.lock into the container
COPY Gemfile Gemfile.lock ./

# Install the required gems
RUN bundle install

# Copy the package.json and package-lock.json into the container
COPY package*.json ./

# Install the required npm packages
RUN npm install

# Copy the rest of the application code into the container
COPY . .

EXPOSE 4567

# Start the application
CMD ["rails", "server", "-b", "0.0.0.0"]
