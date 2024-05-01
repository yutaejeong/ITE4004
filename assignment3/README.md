# Assignment 3

웹 소켓을 이용하여 실시간 텍스트, 음성, 비디오 채팅 서비스를 만듭니다.

프론트엔드와 백엔드 서버는 모두 [Render](https://render.com) 플랫폼에 배포되고 있습니다.

Hobby 플랜을 사용 중이라 인스턴스가 수시로 비활성화됩니다.

그래서 네트워크 요청 후 인스턴스가 다시 활성화될 때까지 시간이 소요될 수 있습니다.

| 서비스     | 주소                         |
| ---------- | ---------------------------- |
| 프론트엔드 | https://ite4004.onrender.com |
| 백엔드     | wss://ite4004.onrender.com   |

실시간 통신 데이터 유형마다 백엔드 도메인 하위 경로가 다르게 지정되어 있습니다.

| 경로      | 데이터 유형 |
| --------- | ----------- |
| `/chat`   | 채팅        |
| `/voice`  | 음성        |
| `/camera` | 비디오      |

## 개발 환경

프론트엔드와 백엔드 모두 [node.js](https://nodejs.org/en) 기반으로 개발되며, TypeScript를 사용합니다.

### 백엔드

백엔드 서버는 node.js 기반으로 간단하게 구성되어 있습니다. (버전은 20을 사용합니다.)

[ws 라이브러리](https://www.npmjs.com/package/ws)를 이용하여 웹 소켓 서버 구성을 합니다.

통신 데이터 유형마다 다른 모듈로 분리되어 있어, 담당한 유형의 모듈만 수정하면 됩니다.

| 파일                         | 데이터 유형 |
| ---------------------------- | ----------- |
| `discord-back/src/chat.ts`   | 채팅        |
| `discord-back/src/voice.ts`  | 음성        |
| `discord-back/src/camera.ts` | 비디오      |

### 프론트엔드

프론트엔드에서 사용하는 주요 라이브러리와 그 사용 용도는 다음과 같습니다.

| 라이브러리                             | 용도                                        |
| -------------------------------------- | ------------------------------------------- |
| [React.js](https://react.dev)          | 페이지 구성                                 |
| [Chakra UI](https://v2.chakra-ui.com)  | UI 라이브러리                               |
| [jotai](https://jotai.org)             | 전역 상태 관리 라이브러리                   |
| [moment.js](https://momentjs.com)      | 날짜와 시간을 다룰 때 사용하는 라이브러리   |
| [nanoid](https://github.com/ai/nanoid) | 유니크한 값을 생성할 때 사용하는 라이브러리 |

프론트엔드에서 백엔드 서버에 웹 소켓 연결을 하는 코드는 [useCommunicate](discord-front/src/hooks/useCommunicate.ts) 훅에 정의되어 있습니다.

백엔드와 마찬가지로 통신 데이터 유형마다 다른 모듈로 분리되어 있어, 담당한 유형의 모듈만 수정하면 됩니다.

| 파일                                                                                                                               | 데이터 유형 |
| ---------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| [discord-front/src/components/room/Chatting/Chatting.tsx](discord-front/src/components/room/Chatting/Chatting.tsx)                 | 채팅        |
| [discord-front/src/components/room/VoiceSharing/VoiceSharing.tsx](discord-front/src/components/room/VoiceSharing/VoiceSharing.tsx) | 음성        |
| [discord-front/src/components/room/CamSharing/CamSharing.tsx](discord-front/src/components/room/CamSharing/CamSharing.tsx)         | 비디오      |

추가적인 파일 분리가 필요하면 해당 디렉토리 내에서 파일을 분리하면 됩니다.

각 컴포넌트에서 사용자 정보는 다음과 같이 불러올 수 있습니다.

```ts
const { nickname, uuid } = useAtomValue(userAtom);
```

마이크와 비디오는 페이지 좌하단의 버튼으로 켜고 끌 수 있으며, 기본적으로 꺼져있습니다.

현재 마이크와 비디오가 각각 켜져 있는지 여부는 다음과 같이 불러올 수 있습니다.

```ts
const isCameraOn = useAtomValue(cameraConfigAtom);
const isVoiceOn = useAtomValue(voiceConfigAtom);
```

## 환경변수

환경변수는 각 프로젝트의 루트 경로에 위치한 `.env` 파일로 관리합니다.

백엔드 프로젝트에서는 로컬 개발 환경에서 다음의 값이 설정됩니다.

```
WS_SERVER=ws://localhost:8080
```

프론트엔드 프로젝트에서는 로컬 개발 환경에서 다음의 값이 설정됩니다.

```
REACT_APP_WS_SERVER=ws://localhost:8080
```

## 로컬 실행 방법

백엔드 서버를 실행하려면 `discord-back` 경로에서 `npm i`로 의존성 패키지들을 설치한 뒤, `npm start` 명령어를 수행하면 됩니다.

프론트엔드 서버도 마찬가지로 `discord-front` 경로에서 `npm i`로 의존성 패키지들을 설치한 뒤, `npm start` 명령어를 수행하면 됩니다.
