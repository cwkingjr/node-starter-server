# Secure Node Starter Server 
Not secure yet
Needs https, secure cookie auth token

# Getting started with server app

    Terminal 1:
    brew install mongodb
    sudo mkdir -p /data/db
    sudo chmod -R youruser:wheel /data/db
    mongod
    
    Terminal 2:
    git clone repo to local folder
    cd into folder
    npm install
    nodemon server.js
    open browser to https://localhost:3000/
    see png's for registering via json and confirming token is working
