// gcc client.c -o client -D_REENTRANT -lpthread

#include <arpa/inet.h>
#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include <unistd.h>

#define BUF_SIZE 1024
#define MSG_CONNECTED "Connected"
#define MSG_TURN "Turn"
#define MSG_NOT_TURN "NotTurn"
#define MSG_YOU_WIN "당신이 이겼습니다."
#define MSG_YOU_LOST "당신은 패배했습니다."
#define MSG_KEEP_GOING "KeepGoing"

int board[5][5];
int check[25];            // 빙고판에서 해당 숫자가 지워졌는지를 표시하는 배열
int turn; 		  // 0 : 시작 전 or send_msg 휴식 / 1 : 자신 턴 / 2 : 상대 턴
pthread_mutex_t mutex;

void error_handling(char *message);
void board_init();        // 빙고판을 입력받아서 초기화하는 함수
int check_bingo();        // 빙고 검증 함수
void print_board();       // 빙고판과 빙고 수를 출력하는 함수
void check_input(int n);  // 입력받은 숫자의 유효성을 확인하고 유효하지 않으면 다시 입력 받는 함수
void update_board(int n); // 해당 숫자를 빙고판에서 지우는 함수

// 아래 두 함수에서 서버 클라 커뮤니케이션과 빙고 게임을 구현하시면 될 것 같습니다.
void *send_msg(void *arg);
void *recv_msg(void *arg);

int main(int argc, char *argv[]) {
  if (argc != 3) {
    printf("Usage : %s <IP> <PORT>\n", argv[0]);
    exit(1);
  }

  board_init();

  int sock;
  struct sockaddr_in serv_adr;
  pthread_t snd_thread, rcv_thread;
  void *thread_return;

  sock = socket(PF_INET, SOCK_STREAM, 0);
  if (sock == -1) {
    error_handling("socket() error!");
  }

  memset(&serv_adr, 0, sizeof(serv_adr));
  serv_adr.sin_family = AF_INET;
  serv_adr.sin_addr.s_addr = inet_addr(argv[1]);
  serv_adr.sin_port = htons(atoi(argv[2]));

  if (connect(sock, (struct sockaddr *)&serv_adr, sizeof(serv_adr)) == -1) {
    error_handling("connect() error!");
  }
  pthread_mutex_init(&mutex, NULL);
  pthread_create(&snd_thread, NULL, send_msg, (void *)&sock);
  pthread_create(&rcv_thread, NULL, recv_msg, (void *)&sock);
  pthread_join(snd_thread, &thread_return);
  pthread_join(rcv_thread, &thread_return);

  close(sock);

  return 0;
}

void error_handling(char *message) {
  fputs(message, stderr);
  fputc('\n', stderr);
  exit(1);
}

void board_init() {
  while (1) {
    memset(check, 0, sizeof(check));

    printf("빙고판을 생성합니다. 1 ~ 25 사이에서 중복되지 않게 숫자를 입력하세요.\n");
    for (int i = 0; i < 5; i++) {
      for (int j = 0; j < 5; j++) {
        scanf("%d", &board[i][j]);
        check[board[i][j] - 1] = 1;
      }
    }

    int flag = 0;
    for (int i = 0; i < 25; i++) {
      if (!check[i]) {
        flag = 1;
        break;
      }
    }

    if (flag) {
      printf("중복되지 않은 숫자로 빙고판을 생성해주세요.\n");
    } else
      break;
  }
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

void check_input(int n) {
  while(1) {
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

  if(turn == 1){  			// 자신의 턴일때
    pthread_mutex_lock(&mutex);		// mutex lock
    print_board();			// 보드 출력
    check_input(input);			// 값 입력
    update_board(input);		// 값 보드에 업데이트
    sprintf(msg,"%d",input);		// int형인 input을 string으로 
    write(sock, msg, strlen(msg));	// msg 전송
    sprintf(msg,"%d",check_bingo());	// 몇줄 빙고인지 msg에 입력
    write(sock, msg, strlen(msg));	// msg 전송
    turn = 0;				// 턴 값 초기화
    pthread_mutex_unlock(&mutex);	// mutex unlock
  }
  else if(turn == 2){ 			// 상대의 턴일때
    pthread_mutex_lock(&mutex);		// mutex lock
    sprintf(msg,"%d",check_bingo());	// 몇줄 빙고인지 msg에 입력
    write(sock, msg, strlen(msg));	// msg 전송
    turn = 0;				// 턴 값 초기화
    pthread_mutex_unlock(&mutex);	// mutex unlock
  }
  
  return NULL;
}

void *recv_msg(void *arg)
{
  int sock = *((int *)arg);
  char msg[BUF_SIZE];
  char output[BUF_SIZE + 20];
  int str_len;

  while (1)
  {
    str_len = read(sock, msg, BUF_SIZE - 1);
    if (str_len == -1)
      return (void *)-1;

    msg[str_len] = 0;

    // 서버에서 받는 메세지 처리
    if (msg == MSG_CONNECTED)
    {
      fputs(msg, stdout);
    }
    else if (msg == MSG_TURN)
    {
      turn = 1;
    }
    else if (msg == MSG_NOT_TURN)
    {
      turn = 2;
    }
    else if (msg == MSG_YOU_WIN)
    {
      fputs(msg, stdout);
      break;
    }
    else if (msg == MSG_YOU_LOST)
    {
      fputs(msg, stdout);
      break;
    }
    // 숫자를 받았을 때 처리: 상대방이 보낸 숫자를 받아서 보드에 업데이트하고 빙고 수를 체크한 후 빙고 수를 보냄
    else
    {
      sprintf(output, "상대의숫자: %s", msg);
      fputs(output, stdout);
      update_board(atoi(msg));
      print_board();

      pthread_mutex_lock(&mutex); // mutex lock
      sprintf(msg, "%d", check_bingo());
      write(sock, msg, strlen(msg));
      pthread_mutex_unlock(&mutex); // mutex unlock
    }
  }

  return NULL;
}
