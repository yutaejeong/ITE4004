#include <arpa/inet.h>
#include <fcntl.h>
#include <pthread.h>
#include <semaphore.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include <sys/stat.h>
#include <unistd.h>

#define BUF_SIZE 1024
#define MSG_CONNECTED "Connected"
#define MSG_READY "Ready"
#define MSG_TURN "Turn"
#define MSG_NOT_TURN "NotTurn"
#define MSG_YOU_WIN "당신이 이겼습니다."
#define MSG_YOU_LOST "당신은 패배했습니다."
#define MSG_KEEP_GOING_1 "KeepGoing1"
#define MSG_KEEP_GOING_2 "KeepGoing2"

int board[5][5];
int check[25];  // 빙고판에서 해당 숫자가 지워졌는지를 표시하는 배열
int turn;       // 0 : 시작 전 or send_msg 휴식 / 1 : 자신 턴 / 2 : 상대 턴

char *__debug__input_file__;

pthread_mutex_t mutex_send_msg;
pthread_mutex_t mutex_recv_msg;

void board_init();         // 빙고판을 입력받아서 초기화하는 함수
int check_bingo();         // 빙고 검증 함수
void print_board();        // 빙고판과 빙고 수를 출력하는 함수
int get_input();           // 입력받은 숫자의 유효성을 확인하고 유효하지 않으면 다시 입력 받는 함수
void update_board(int n);  // 해당 숫자를 빙고판에서 지우는 함수

void *recv_msg(void *arg);  // 서버로부터 메세지를 받는 함수 (스레드)
void *send_msg(void *arg);  // 서버로 메세지를 보내는 함수 (스레드)

int main(int argc, char *argv[]) {
  int sock;
  struct sockaddr_in serv_adr;
  pthread_t snd_thread, rcv_thread;

  if (argc < 3) {
    printf("Usage : %s <IP> <PORT>\n", argv[0]);
    exit(1);
  }

  __debug__input_file__ = NULL;
  if (argc == 4) {
    __debug__input_file__ = argv[3];
  }

  sock = socket(PF_INET, SOCK_STREAM, 0);
  if (sock == -1) {
    perror("failed to create socket");
    exit(1);
  }

  memset(&serv_adr, 0, sizeof(serv_adr));
  serv_adr.sin_family = AF_INET;
  serv_adr.sin_addr.s_addr = inet_addr(argv[1]);
  serv_adr.sin_port = htons(atoi(argv[2]));
  if (connect(sock, (struct sockaddr *)&serv_adr, sizeof(serv_adr)) == -1) {
    perror("failed to connect");
    exit(1);
  }
  printf("서버와 연결이 되었습니다.\n");

  pthread_mutex_init(&mutex_recv_msg, NULL);
  pthread_mutex_init(&mutex_send_msg, NULL);

  pthread_mutex_lock(&mutex_send_msg);
  pthread_create(&rcv_thread, NULL, recv_msg, (void *)&sock);
  pthread_create(&snd_thread, NULL, send_msg, (void *)&sock);

  pthread_join(rcv_thread, NULL);
  pthread_join(snd_thread, NULL);

  pthread_mutex_destroy(&mutex_recv_msg);
  pthread_mutex_destroy(&mutex_send_msg);

  close(sock);

  return 0;
}

void read_safely(int sock, char *buf) {
  int total_len, len;
  char c = 1;

  total_len = 0;
  while (c != 0) {
    len = read(sock, &c, 1);
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
  // printf("서버로부터 다음의 값을 수신했습니다: %s (%d)\n", buf, total_len);
}

void write_safely(int sock, const char *message) {
  int result = write(sock, message, strlen(message) + 1);
  if (result == -1) {
    perror("Failed to write to the client.");
    abort();
  };
  // printf("서버로 다음의 값을 송신했습니다: %s (%d)\n", message, result);
}

void board_init() {
  int i, j;
  int row[5];
  int out_of_range = 0;
  int duplicated = 0;
  FILE *__debug_input_file_descriptor__ = NULL;

  if (__debug__input_file__) {
    __debug_input_file_descriptor__ = fopen(__debug__input_file__, "r");
  }

  while (1) {
    memset(check, 0, sizeof(check));

    printf("5x5 크기의 빙고판을 한 행씩 입력해주세요.\n");
    printf("빙고판에는 1 ~ 25 사이의 숫자가 중복되지 않게 들어가야 합니다.\n");
    for (int i = 0; i < 5; i++) {
      printf("%d번째 행을 입력해주세요: ", i + 1);
      for (int j = 0; j < 5; j++) {
        if (__debug_input_file_descriptor__) {
          fscanf(__debug_input_file_descriptor__, "%d", row + j);
        } else {
          scanf("%d", row + j);
        }
      }
      if (__debug_input_file_descriptor__) {
        printf("DONE\n");
      }

      for (j = 0; j < 5; j++) {
        if (row[j] < 1 || row[j] > 25) {
          printf("1 ~ 25 사이의 숫자를 입력해주세요. 입력하신 행에는 범위를 벗어나는 값 %d(이)가 존재합니다.\n", row[j]);
          out_of_range = 1;
          break;
        }
      }

      if (out_of_range) {
        out_of_range = 0;
        i--;
        continue;
      }

      for (j = 0; j < 5; j++) {
        board[i][j] = row[j];
        check[row[j] - 1] += 1;
      }
    }

    for (i = 0; i < 25; i++) {
      if (check[i] > 1) {
        printf("중복되지 않은 숫자로 빙고판을 생성해주세요. 입력하신 빙고판에는 값 %d(이)가 중복됩니다.\n\n", i + 1);
        duplicated = 1;
        break;
      }
    }

    if (duplicated) {
      continue;
    }

    break;
  }

  fclose(__debug_input_file_descriptor__);

  printf("생성된 빙고판은 다음과 같습니다.\n");
  for (i = 0; i < 5; i++) {
    for (j = 0; j < 5; j++) {
      printf("%2d ", board[i][j]);
    }
    printf("\n");
  }
  printf("\n");
}

// 숫자를 입력받아서 지우면 board의 값이 0이 된다고 생각하고 구현했습니다.
int check_bingo() {
  int cnt = 0;

  for (int i = 0; i < 5; i++) {
    if (!(board[i][0] || board[i][1] || board[i][2] || board[i][3] || board[i][4]))
      cnt++;
    if (!(board[0][i] || board[1][i] || board[2][i] || board[3][i] || board[4][i]))
      cnt++;
  }
  if (!(board[0][0] || board[1][1] || board[2][2] || board[3][3] || board[4][4]))
    cnt++;
  if (!(board[0][4] || board[1][3] || board[2][2] || board[3][1] || board[4][0]))
    cnt++;

  return cnt;
}

void print_board() {
  for (int i = 0; i < 5; i++) {
    for (int j = 0; j < 5; j++) {
      if (board[i][j])
        printf("%2d ", board[i][j]);
      else
        printf(" X ");
    }
    printf("\n");
  }

  printf("현재 빙고 수: %d\n\n", check_bingo());
}

int get_input() {
  int n = -1;

  while (1) {
    if (n < 1 || n > 25) {
      printf("1 ~ 25 사이의 숫자를 입력하세요: ");
      scanf("%d", &n);
      continue;
    }
    if (!check[n - 1]) {
      printf("1 ~ 25 사이의 숫자 중에서 지워지지 않은 숫자를 입력하세요: ");
      scanf("%d", &n);
      continue;
    }
    break;
  }

  return n;
}

void update_board(int n) {
  for (int i = 0; i < 5; i++) {
    for (int j = 0; j < 5; j++) {
      if (n == board[i][j]) {
        board[i][j] = 0;
        check[n - 1] = 0;
        return;
      }
    }
  }
}

void *send_msg(void *arg) {
  int sock = *((int *)arg);
  char msg[BUF_SIZE];
  int input = -1;
  int n, m;

  while (1) {
    pthread_mutex_lock(&mutex_send_msg);

    switch (turn) {
      case 0:  // 빙고판 입력을 받을 차례, 준비가 되면 서버로 메시지를 보낸다.
        board_init();
        write_safely(sock, MSG_READY);
        break;
      case 1:  // 지울 칸을 입력 받을 차례
        n = get_input();
        update_board(n);
        m = check_bingo();
        sprintf(msg, "%d %d", n, m);
        write_safely(sock, msg);
        print_board();
        break;
      case 2:  // 내 빙고 개수를 계산하여 보낼 차례
        m = check_bingo();
        sprintf(msg, "%d", m);
        write_safely(sock, msg);
        break;
      case 3:  // 게임이 종료됐을 때
        pthread_mutex_unlock(&mutex_recv_msg);
        return NULL;
      default:
        printf("올바르지 않은 차례 값입니다: %d\n", turn);
        abort();
    }

    pthread_mutex_unlock(&mutex_recv_msg);
  }

  return NULL;
}

void *recv_msg(void *arg) {
  int sock = *((int *)arg);
  char msg[BUF_SIZE];
  int str_len, n;

  while (1) {
    pthread_mutex_lock(&mutex_recv_msg);

    // 서버에서 받는 메세지 처리
    // printf("서버로부터 응답을 기다리는 중입니다. (turn: %d)\n", turn);
    read_safely(sock, msg);
    if (strcmp(msg, MSG_CONNECTED) == 0) {
      printf("상대편과 연결이 되었습니다.\n");
      turn = 0;
    } else if (strcmp(msg, MSG_TURN) == 0) {
      printf("당신의 차례입니다.\n");
      turn = 1;
    } else if (strcmp(msg, MSG_NOT_TURN) == 0) {
      printf("상대편의 차례입니다.\n");
      turn = 2;
      pthread_mutex_unlock(&mutex_recv_msg);
      continue;
    } else if (strcmp(msg, MSG_YOU_WIN) == 0) {
      printf("%s\n", msg);
      pthread_mutex_unlock(&mutex_send_msg);
      turn = 3;
      return NULL;
    } else if (strcmp(msg, MSG_YOU_LOST) == 0) {
      printf("%s\n", msg);
      pthread_mutex_unlock(&mutex_send_msg);
      turn = 3;
      return NULL;
    } else if (strcmp(msg, MSG_KEEP_GOING_1) == 0) {  // 첫 번째 결과 대기 후 게임 지속 판정
      if (turn == 1) {
        printf("당신이 부른 값에 따른 상대편의 결과를 기다립니다\n");
        pthread_mutex_unlock(&mutex_recv_msg);
        continue;
      }

      printf("상대편의 응답을 기다립니다.\n");

      read_safely(sock, msg);

      n = atoi(msg);
      if (n == 0) {
        printf("상대편이 부른 값을 제대로 불러오지 못 했습니다.\n");
        return NULL;
      }
      printf("상대편은 %d(을)를 불렀습니다.\n", n);

      update_board(n);
      print_board();
    } else if (strcmp(msg, MSG_KEEP_GOING_2) == 0) {  // 두 번째 결과 대기 후 게임 지속 판정
      pthread_mutex_unlock(&mutex_recv_msg);
      continue;
    } else {
      printf("처리되지 않은 메시지입니다: %s\n", msg);
      abort();
    }

    pthread_mutex_unlock(&mutex_send_msg);
  }

  return NULL;
}
