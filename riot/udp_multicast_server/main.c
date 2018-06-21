#include <stdio.h>
#include <string.h>

#include "msg.h"
#include "shell.h"

#define MAIN_QUEUE_SIZE     (1)
static msg_t _main_msg_queue[MAIN_QUEUE_SIZE];

extern kernel_pid_t startServer(void);

extern int test_multicast(int argc, char **argv);

static const shell_command_t shell_commands[] = {
    { "test", "test multicast configuration by pinging all nodes", test_multicast },
    { NULL, NULL, NULL }
};

int main(void)
{
    msg_init_queue(_main_msg_queue, MAIN_QUEUE_SIZE);
    puts("Welcome to RIOT!");

    puts("Starting now multicast udp server on port 5683…");
    startServer();
    puts("Success! Starting interactive shell now for you…");

    char line_buf[SHELL_DEFAULT_BUFSIZE];
    shell_run(shell_commands, line_buf, SHELL_DEFAULT_BUFSIZE);

    return 0;
}
