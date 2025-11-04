# Image gallery

**:warning: DO NOT RUN THIS APPLICATION ANYWHERE UNDER ANY CIRCUMSTANCES :warning:**

## Setup

- Connect to the server with SSH.
- Install [Node.js](https://nodejs.org) 24.x:

  ```bash
  # Make sure cURL is installed to download stuff:
  $> sudo apt-get install -y curl

  # Download and install Node.js:
  $> curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
  $> sudo apt-get install -y nodejs

  # Verify the Node.js version:
  $> node -v # v24.x.y
  ```

- Install Git, clone the application and install its dependencies:

  ```bash
  $> sudo apt-get install -y git
  $> git clone https://github.com/ArchiDep/vulnerable-image-gallery.git
  $> cd vulnerable-image-gallery
  $> npm ci
  ```

- Configure the application to listen on all network interfaces:

  ```bash
  $> printf 'GALLERY_LISTEN_HOST=0.0.0.0\nGALLERY_LISTEN_PORT=80\n' > .env
  ```

## Run the application

- Connect to the server with SSH and move into the application directory if
  necessary:

  ```bash
  $> cd vulnerable-image-gallery
  ```

- Run the application:

  **:warning: DO NOT DO THIS :warning:**

  ```bash
  $> sudo node ./server.js
  ```
