# Image gallery

**:warning: DO NOT RUN THIS APPLICATION ANYWHERE UNDER ANY CIRCUMSTANCES :warning:**

## Setup

- Connect to the server with SSH.
- Install [Node.js](https://nodejs.org) 24.x:

  ```bash
  $> sudo apt-get update
  $> sudo apt-get install -y ca-certificates curl

  # Download and install nvm:
  $> curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
  $> source "$HOME/.nvm/nvm.sh"

  # Download and install Node.js:
  $> nvm install 24

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
