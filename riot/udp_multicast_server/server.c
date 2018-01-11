#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>

#include "net/af.h"

#include "net/sock/udp.h"
#include "net/ipv6/addr.h"
#include "thread.h"

#define SERVER_MSG_QUEUE_SIZE   (8)
#define SERVER_BUFFER_SIZE      (64)

static const int UDP_PORT = 5683;
static char *PORTSTRING = "5683";

static sock_udp_t sock;
static char server_buffer[SERVER_BUFFER_SIZE];
static char server_stack[THREAD_STACKSIZE_DEFAULT];
static msg_t server_msg_queue[SERVER_MSG_QUEUE_SIZE];

int udp_send(char *addr, char *payload)
{
    int res;
    sock_udp_ep_t remote = { .family = AF_INET6 };

    if (ipv6_addr_from_str((ipv6_addr_t *)&remote.addr, addr) == NULL) {
        puts("Error: unable to parse destination address");
        return 1;
    }
    remote.port = UDP_PORT;
    if((res = sock_udp_send(NULL, payload, strlen(payload), &remote)) < 0) {
        puts("could not send");
    }
    else {
        printf("Success: send %u byte to %s\n", (unsigned) res, addr);
    }
    return 0;
}

void *_udp_server(void *args)
{
    sock_udp_ep_t server = { .port = atoi(args), .family = AF_INET6 };
    msg_init_queue(server_msg_queue, SERVER_MSG_QUEUE_SIZE);

    if(sock_udp_create(&sock, &server, NULL, 0) < 0) {
        return NULL;
    }

    printf("Success: started UDP server on port %u\n", server.port);

    while (1) {
        int res;

        if ((res = sock_udp_recv(&sock, server_buffer,
                                 sizeof(server_buffer) - 1, SOCK_NO_TIMEOUT,
                                 NULL)) < 0) {
            puts("Error while receiving");
        }
        else if (res == 0) {
            puts("No data received");
        }
        else {
            server_buffer[res] = '\0';
            printf("Recvd: %s\n", server_buffer);

            // send packages as multicast
            udp_send("ff02::1", server_buffer);
        }
    }

    return NULL;
}

kernel_pid_t startServer(void) {
    return thread_create(server_stack, sizeof(server_stack), THREAD_PRIORITY_MAIN - 1,
                      THREAD_CREATE_STACKTEST, _udp_server, PORTSTRING, "UDP Server");
}
