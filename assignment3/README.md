# Assignment 3: Discord

프론트와 백엔드 모두 HTTPS, WSS 등 암호화 통신을 해야 하므로 각각 로컬 인증서를 발급해 사용해야 합니다.

아래 인증서 및 환경변수 설정을 진행해주세요.

## TLS 인증서 설정

1. [mkcert](https://github.com/FiloSottile/mkcert)를 설치합니다.
2. `mkcert --install` 명령어로 루트 인증서를 발급합니다.
3. `mkcert localhost` 명령어로 localhost 도메인에 대한 루트 인증서를 발급합니다.
   - discord-front 및 discord-back 각각의 프로젝트 루트 경로에서 실행해야 합니다.

## 환경변수 설정

프로젝트 루트 경로에 `.env` 파일을 생성하고 아래 내용을 참고하여 채워주세요.

### 프론트엔드

```
REACT_APP_WS_SERVER=wss://localhost:8080
HTTPS=true
SSL_CRT_FILE=위에서 생성한 인증서 파일명 (경로 없이 파일명만 적습니다. ex. localhost.pem)
SSL_KEY_FILE=위에서 생성한 인증서 파일명 (경로 없이 파일명만 적습니다. ex. localhost-key.pem)
```

### 백엔드

```
WS_SERVER=wss://localhost:8080
HTTPS=true
SSL_CRT_FILE=위에서 생성한 인증서 파일명 (경로 없이 파일명만 적습니다. ex. localhost.pem)
SSL_KEY_FILE=위에서 생성한 인증서 파일명 (경로 없이 파일명만 적습니다. ex. localhost-key.pem)
```

## 실행 환경

node 20.10.0 런타임 환경에서 실행하는 것을 권장합니다.

## 실행

각 프로젝트 루트 경로에서 터미널을 열고 `npm i`, `npm start`를 차례로 수행하면 됩니다.