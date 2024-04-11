#include <arpa/inet.h>
#include <netinet/in.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include <unistd.h>

#define BUF_SIZE 100
#define MSG_CONNECTED "Connected"
#define MSG_READY "Ready"
#define MSG_TURN "Turn"
#define MSG_NOT_TURN "NotTurn"
#define MSG_YOU_WIN "당신이 이겼습니다."
#define MSG_YOU_LOST "당신은 패배했습니다."
#define MSG_KEEP_GOING_1 "KeepGoing1"
#define MSG_KEEP_GOING_2 "KeepGoing2"

void initialize_server(int *serv_sock, in_port_t sin_port);
void connect_to_clients(int serv_sock, int *clnt_sock);
void play(const int *clnt_sock);
void finalize_server(int serv_sock);

int main(int argc, char *argv[]) {
  int serv_sock, clnt_sock[2];
  struct sockaddr_in serv_adr;

  if (argc != 2) {
    printf("Usage: %s <PORT>\n", argv[0]);
    abort();
  }

  initialize_server(&serv_sock, htons(atoi(argv[1])));

  connect_to_clients(serv_sock, clnt_sock);

  play(clnt_sock);

  finalize_server(serv_sock);

  return 0;
}

void read_safely(int clnt_sock, char *buf) {
  int total_len, len;
  char c = 1;

  // 소켓의 입력 버퍼에 쌓여있는 값들을 널 문자 단위로 읽어들이도록 했습니다.
  total_len = 0;
  while (c != 0) {
    len = read(clnt_sock, &c, 1);
    if (len == 0) {
      printf("Disconnected from the server.\n");
      abort();
    }
    if (len == -1) {
      perror("Failed to read from the server");
      abort();
    }
    if (c) {
      total_len += 1;
      buf[total_len - 1] = c;
    }
  }
  buf[total_len] = 0;

  printf("%d 소켓에서 다음의 값을 수신했습니다: %s (%d)\n", clnt_sock, buf, total_len);
}

void write_safely(int clnt_sock, const char *message) {
  int result = write(clnt_sock, message, strlen(message) + 1);
  if (result == -1) {
    perror("Failed to write to the client.");
    abort();
  };

  printf("%d 소켓으로 다음의 값을 송신했습니다: %s (%d)\n", clnt_sock, message, result);
}

/**
 * Function: initialize_server
 * ---------------------------
 * 주어진 포트로 서버를 엽니다.
 * 오류가 발생하면 프로그램을 종료시킵니다.
 * serv_sock: 생성된 소켓을 저장할 포인터입니다.
 * sin_port: 서버를 열 포트 번호입니다.
 */
void initialize_server(int *serv_sock, in_port_t sin_port) {
  struct sockaddr_in serv_adr;

  *serv_sock = socket(PF_INET, SOCK_STREAM, 0);
  if (*serv_sock == -1) {
    perror("failed to create an endpoint for communication");
    abort();
  }

  memset(&serv_adr, 0, sizeof(serv_adr));
  serv_adr.sin_family = AF_INET;
  serv_adr.sin_addr.s_addr = htonl(INADDR_ANY);
  serv_adr.sin_port = sin_port;
  if (bind(*serv_sock, (struct sockaddr *)&serv_adr, sizeof(serv_adr)) == -1) {
    perror("failed to bind a name to a socket");
    abort();
  }

  if (listen(*serv_sock, 5) == -1) {
    perror("failed to listen for connections on a socket");
    abort();
  }

  printf("Server is initialzed successfully.\n");
}

/**
 * Function: connect_to_clients
 * -----------------------------
 * 게임을 시작하기에 앞서 두 클라이언트에 연결을 시도합니다.
 * 각 클라이언트와 연결된 이후 모두 준비가 완료될 때까지 기다립니다.
 * 오류가 발생하면 프로그램을 종료시킵니다.
 * serv_sock: 서버 소켓 디스크립터입니다.
 * clnt_sock: 연결된 클라이언트의 소켓을 저장할 크기 2의 배열 포인터입니다.
 */
void connect_to_clients(int serv_sock, int *clnt_sock) {
  int i, len;
  char msg[BUF_SIZE];
  struct sockaddr_in clnt_adr[2];
  socklen_t clnt_adr_sz[2];

  // 두 플레이어에 각각 연결을 시도합니다.
  for (i = 0; i < 2; i++) {
    clnt_sock[i] = accept(serv_sock, (struct sockaddr *)clnt_adr + i, clnt_adr_sz + i);
    if (clnt_sock[i] == -1) {
      perror("failed to accept a connection on a socket");
      abort();
    }
    printf("Connected: %s:%d\n", inet_ntoa(clnt_adr[i].sin_addr), ntohs(clnt_adr[i].sin_port));
  }

  // 두 플레이어가 모두 연결이 되었을 때, 각 플레이어에 메시지를 보냅니다.
  for (i = 0; i < 2; i++) {
    write_safely(clnt_sock[i], MSG_CONNECTED);
  }

  printf("모든 클라이언트가 연결되었습니다.\n");
}

/**
 * Function: play
 * --------------
 * 두 클라이언트의 차례를 번갈에 게임을 진행합니다.
 * 오류가 발생하면 프로그램을 종료시킵니다.
 * clnt_sock: 두 클라이언트의 소켓 디스크립터가 저장된 크기 2의 배열 포인터입니다.
 */
void play(const int *clnt_sock) {
  int i, len, N, M;
  char message[BUF_SIZE];

  for (i = 0; i < 2; i++) {
    read_safely(clnt_sock[i], message);
    if (strcmp(message, MSG_READY) != 0) {
      printf("%d번째 클라이언트(%d 소켓)이 제대로 준비되지 않았습니다.\n", i, clnt_sock[i]);
      abort();
    }
  }

  for (i = 0;; i++) {
    int leading = i % 2;
    int rival = (i + 1) % 2;

    // 각 클라이언트에 차례를 통보합니다.
    write_safely(clnt_sock[leading], MSG_TURN);
    write_safely(clnt_sock[rival], MSG_NOT_TURN);

    // 차례인 클라이언트로부터 값을 받아옵니다.
    printf("%d번째 클라이언트(%d 소켓)로부터 읽어들인 N, M 값은... \n", leading, clnt_sock[leading]);
    read_safely(clnt_sock[leading], message);
    sscanf(message, "%d %d", &N, &M);
    printf("N: %d, M: %d 입니다.\n", N, M);

    // 차례인 클라이언트의 빙고 상태에 따라 처리합니다.
    if (M >= 3) {
      // 승패통보
      printf("%d번째 클라이언트(%d 소켓)가 승리하였습니다.\n", leading, clnt_sock[leading]);
      write_safely(clnt_sock[leading], MSG_YOU_WIN);
      write_safely(clnt_sock[rival], MSG_YOU_LOST);
      break;  // 서버 종료
    } else {
      // 게임 계속 진행 통보
      write_safely(clnt_sock[leading], MSG_KEEP_GOING_1);
      write_safely(clnt_sock[rival], MSG_KEEP_GOING_1);
    }

    // 다른 클라이언트에 응답을 전달합니다.
    sprintf(message, "%d", N);
    write_safely(clnt_sock[rival], message);

    // 다른 클라이언트로부터 빙고 상태를 받아옵니다.
    read_safely(clnt_sock[rival], message);
    M = atoi(message);

    // 다른 클라이언트의 빙고 상태에 따라 처리합니다.
    if (M >= 3) {
      // 승패통보
      write_safely(clnt_sock[leading], MSG_YOU_LOST);
      write_safely(clnt_sock[rival], MSG_YOU_WIN);
      break;  // 서버 종료
    } else {
      // 게임 계속 진행 통보
      write_safely(clnt_sock[leading], MSG_KEEP_GOING_2);
      write_safely(clnt_sock[rival], MSG_KEEP_GOING_2);
    }
  }
}

/**
 * Function: finalize_server
 * -------------------------
 * 서버를 종료시킵니다.
 * 오류가 발생하면 프로그램을 종료시킵니다.
 * serv_sock: 종료할 서버의 소켓 디스크립터입니다.
 */
void finalize_server(int serv_sock) {
  if (close(serv_sock) == -1) {
    perror("failed to close the socket");
    abort();
  };

  printf("Server is finalized successfully.\n");
}