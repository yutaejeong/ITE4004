#include <arpa/inet.h>
#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include <unistd.h>

#define BOARD_WIDTH 5
#define BUF_SIZE 1024
#define CLIENT_NUM 2

char board[BOARD_WIDTH][BOARD_WIDTH];
char saved_message[BUF_SIZE];

pthread_mutex_t mutex;

int draw(char player, int row, int col);
void error_handling(char *message);
void *handle_client(void *port);

int main(int argc, char *argv[]) {
  int i, serv_sock;
  struct sockaddr_in serv_adr, clnt_adr;
  socklen_t clnt_adr_sz;
  pthread_t thread_id[CLIENT_NUM];

  if (argc != 2) {
    // 실행 시 커맨드라인: ./server 9091
    printf("Usage: %s <port>\n", argv[0]);
    exit(1);
  }

  // 서버 소켓 생성
  serv_sock = socket(PF_INET, SOCK_STREAM, 0);
  if (serv_sock == -1) {
    error_handling("socket() error");
  }

  // 서버 소켓 주소 설정
  memset(&serv_adr, 0, sizeof(serv_adr));
  serv_adr.sin_family = AF_INET;
  serv_adr.sin_addr.s_addr = htonl(INADDR_ANY);
  serv_adr.sin_port = htons(atoi(argv[1]));

  // 서버 소켓 주소와 서버 소켓 바인딩
  if (bind(serv_sock, (struct sockaddr *)&serv_adr, sizeof(serv_adr)) == -1) {
    error_handling("bind() error");
  }
  printf("Server is running on port %s\n", argv[1]);

  // 서버 소켓으로 클라이언트 접속 대기
  if (listen(serv_sock, 5) == -1) {
    error_handling("listen() error");
  }

  // 뮤텍스 초기화
  pthread_mutex_init(&mutex, NULL);

  // 클라이언트 연결
  for (i = 0; i < CLIENT_NUM; i++) {
    clnt_adr_sz = sizeof(clnt_adr);
    int *clnt_sock = (int *)malloc(sizeof(int));
    *clnt_sock = accept(serv_sock, (struct sockaddr *)&clnt_adr, &clnt_adr_sz);
    printf("A client is connected (address: %s:%4d, descriptor: %d)\n", inet_ntoa(clnt_adr.sin_addr), ntohs(clnt_adr.sin_port), *clnt_sock);
    pthread_create(&thread_id[i], NULL, handle_client, (void *)clnt_sock);
  }

  // 클라이언트 연결 종료 대기
  for (i = 0; i < CLIENT_NUM; i++) {
    pthread_join(thread_id[i], NULL);
  }

  // 뮤텍스 해제
  pthread_mutex_destroy(&mutex);

  // 서버 소켓 닫기
  close(serv_sock);

  return 0;
}

/**
 * 클라이언트와 연결
 */
void *handle_client(void *_clnt_sock) {
  int clnt_sock = *((int *)_clnt_sock);
  char message[BUF_SIZE];
  int str_len;

  // 클라이언트와 메시지 송수신
  while ((str_len = read(clnt_sock, message, BUF_SIZE)) != 0) {
    message[str_len - 1] = 0;  // 개행 문자 제거 후 널 문자 추가

    pthread_mutex_lock(&mutex);

    printf("saved_message: %s -> ", saved_message);
    write(clnt_sock, message, str_len);
    strcpy(saved_message, message);
    printf("%s\n", saved_message);

    pthread_mutex_unlock(&mutex);
  }

  printf("A client is disconnected (descriptor: %d)\n", clnt_sock);
  close(clnt_sock);

  free(_clnt_sock);
  return NULL;
}

/**
 * 플레이어가 돌을 놓음
 * 0: 성공
 * 1: 범위를 벗어난 입력
 * 2: 이미 표시된 칸임
 */
int draw(char player, int row, int col) {
  pthread_mutex_lock(&mutex);
  if (row < 0 || row >= BOARD_WIDTH || col < 0 || col >= BOARD_WIDTH) {
    return 1;
  }
  if (!board[row][col]) {
    board[row][col] = player;
  } else {
    return 2;
  }
  pthread_mutex_unlock(&mutex);
  return 0;
}

/**
 * 게임이 끝났는지 판단
 * 0: 게임이 끝나지 않음
 * 1: 플레이어 1 승리
 * 2: 플레이어 2 승리
 * 3: 무승부
 */
int determine() {
  return 0;
}

void error_handling(char *message) {
  fputs(message, stderr);
  fputc('\n', stderr);
  exit(1);
}