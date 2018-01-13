#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

#include "msg.h"
#include "shell.h"
#include "thread.h"

#define MAIN_QUEUE_SIZE     (8)
static msg_t _main_msg_queue[MAIN_QUEUE_SIZE];
kernel_pid_t thread_pid = KERNEL_PID_UNDEF;

int send(int argc, char **argv) {
    // exit early if thread not running
    if (thread_pid == KERNEL_PID_UNDEF) {
        puts("thread is not running. abort.");
        return -1;
    }

    if (argc != 2) {
        puts("Usage:\n\tsend <number>");
        return -1;
    }

    int number = atoi(argv[1]);
    msg_t msg;
    msg.content.value = number;
    msg_send(&msg, thread_pid);
    return 0;
}

static const shell_command_t shell_commands[] = {
    { "s", "send message with number to thread", send },
    { NULL, NULL, NULL }
};

static char thread_stack[THREAD_STACKSIZE_DEFAULT];

void *_event_loop(void *args) {
    (void) args; // to ignore unused parameter warning
    msg_t msg; // the message to receive

    printf("Thread is now running. PID: %d. Args: %p\n", thread_getpid(), args);
    while(1) {
        if (msg_try_receive(&msg) != -1) {
            // message was received
            int content = msg.content.value;
            printf(">>> Received: %d\n", content);
        }
        sleep(1);
    }
}

void startThread(void) {
    thread_pid = thread_create(thread_stack, sizeof(thread_stack), THREAD_PRIORITY_MAIN - 1,
                      THREAD_CREATE_STACKTEST, _event_loop, NULL, "Eventloop");
}

int main(void)
{
    msg_init_queue(_main_msg_queue, MAIN_QUEUE_SIZE);

    startThread();

    char line_buf[SHELL_DEFAULT_BUFSIZE];
    shell_run(shell_commands, line_buf, SHELL_DEFAULT_BUFSIZE);

    return 0;
}
