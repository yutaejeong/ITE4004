# Discord Frontend

`MediaDevices.getUserMedia()`는 [참고자료](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)에도 설명돼 있듯이 HTTPS 프로토콜에서만 작동합니다. 그래서 프론트엔드 서버는 개발 환경에서도 HTTPS 프로토콜 위에서 동작해야 합니다. 그러기 위한 절차로써 아래를 참고해주세요.

## TLS 인증서 설정

1. [mkcert](https://github.com/FiloSottile/mkcert)를 설치합니다.
2. `mkcert --install` 명령어로 루트 인증서를 발급합니다.
3. `mkcert localhost` 명령어로 localhost 도메인에 대한 루트 인증서를 발급합니다.
   - 프로젝트 루트 경로에서 실행해야 합니다.
4. 발급된 두 인증서는 `/certs` 디렉토리에 옮겨둡니다.

## 환경변수 설정

프로젝트 루트 경로에 `.env` 파일을 생성하고 아래 내용을 참고하여 채워주세요.

```
REACT_APP_WS_SERVER=wss://localhost:8080
HTTPS=true
SSL_CRT_FILE=위에서 생성한 인증서 파일명 (경로 없이 파일명만 적습니다. ex. localhost.pem)
SSL_KEY_FILE=위에서 생성한 인증서 파일명 (경로 없이 파일명만 적습니다. ex. localhost-key.pem)
```
