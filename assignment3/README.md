# Assignment 3: Discord

프론트와 백엔드 모두 HTTPS, WSS 등 암호화 통신을 해야 하므로 각각 로컬 인증서를 발급해 사용해야 합니다.

**📢 Windows 환경의 경우 본 경로의 `run.bat` 파일을 실행하면 자동으로 아래 과정을 처리해줍니다.**

**📢 macOS 환경의 경우 본 경로의 `run.sh` 파일을 실행하면 자동으로 아래 과정을 처리해줍니다.**

아래 인증서 및 환경변수 설정을 진행해주세요.

## TLS 인증서 설정

1. [mkcert](https://github.com/FiloSottile/mkcert)를 설치합니다.
   - macOS에서는 `brew install mkcert` 명령어로 설치할 수 있습니다.
   - Windows 환경의 경우 본 경로의 `mkcert.exe` 파일을 이용해주세요.
     - 또는, [release](https://github.com/FiloSottile/mkcert/releases)에서 실행 파일을 다운로드 할 수 있습니다. Windows x86 CPU에서는 windows-amd64.exe 버전을 다운로드 하면 됩니다. 다운로드 후 해당 파일을 mkcert.exe로 명명한 뒤 현재 폴더에 있는 파일과 바꿔주세요.
2. `mkcert --install` 명령어로 루트 인증서를 발급합니다.
3. `mkcert localhost` 명령어로 localhost 도메인에 대한 루트 인증서를 발급합니다.
   - discord-front 및 discord-back 각각의 프로젝트 루트 경로에서 실행해야 합니다.

## 실행 환경

node 20 버전 이상의 런타임 환경에서 실행하는 것을 권장합니다.

## 실행

각 프로젝트 루트 경로에서 터미널을 열고 `npm i`, `npm start`를 차례로 수행하면 됩니다.