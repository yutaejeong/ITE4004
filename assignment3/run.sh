#! /bin/bash

if command -v node &> /dev/null; then
    echo "Node.js is installed."
else
    echo "Node.js is not installed."
    exit 0
fi

node_version=$(node --version)

node_version=${node_version#v}

IFS='.' read -r -a version_components <<< "$node_version"

if (( ${version_components[0]} >= 18 )); then
    echo "Installed Node.js version is greater than or equal to 18."
else
    echo "Installed Node.js version is less than 18."
    exit 0
fi

if command -v mkcert &> /dev/null; then
    echo "mkcert is installed."
else
    echo "mkcert is not installed."
    exit 0
fi

mkcert -install

mkcert -cert-file discord-back/localhost.pem -key-file discord-back/localhost-key.pem localhost

mkcert -cert-file discord-front/localhost.pem -key-file discord-front/localhost-key.pem localhost

cat <<EOF > discord-back/.env
WS_SERVER=wss://localhost:8080
HTTPS=true
SSL_CRT_FILE=localhost.pem
SSL_KEY_FILE=localhost-key.pem
EOF

nohup scripts/run-back.sh > dev/null

cat <<EOF > discord-front/.env
REACT_APP_WS_SERVER=wss://localhost:8080
HTTPS=true
SSL_CRT_FILE=localhost.pem
SSL_KEY_FILE=localhost-key.pem
EOF

source scripts/run-front.sh