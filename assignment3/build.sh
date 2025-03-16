#! /bin/bash

npm i --prefix ./discord-back
npm run build --prefix ./discord-back

npm i --prefix ./discord-front
npm run build --prefix ./discord-front