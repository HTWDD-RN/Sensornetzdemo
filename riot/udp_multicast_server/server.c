#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <unistd.h>

#include "net/af.h"

#include "net/gnrc/coap.h"
#include "net/sock/udp.h"
#include "net/ipv6/addr.h"
#include "thread.h"

#define SERVER_MSG_QUEUE_SIZE   (1)
#define SERVER_BUFFER_SIZE      (1024)

static char *PORTSTRING = "5683";
static char *MULTICAST_ADDRESS = "ff02::1";

bool sending = false;

static sock_udp_t sock;
static char server_buffer[SERVER_BUFFER_SIZE];
static char server_stack[THREAD_STACKSIZE_DEFAULT];
static char mutlicast_stack[THREAD_STACKSIZE_DEFAULT];
static msg_t server_msg_queue[SERVER_MSG_QUEUE_SIZE];

kernel_pid_t multicast_pid = KERNEL_PID_UNDEF;

int udp_send(char *addr, char *payload)
{
    int res;
    sock_udp_ep_t remote = { .family = AF_INET6 };

    if (ipv6_addr_from_str((ipv6_addr_t *)&remote.addr, addr) == NULL) {
        puts("Error: unable to parse destination address");
        return 1;
    }
    remote.port = GCOAP_PORT;

    printf(">>>>>> playload %s\n", payload);
    printf(">>>>>> addr %s\n", addr);

    if((res = sock_udp_send(NULL, payload, strlen(payload), &remote)) < 0) {
        puts("could not send");
    }
    else {
        printf("Success: send %u byte to %s\n", (unsigned) res, addr);
    }
    return 0;
}

void _resp_handler(unsigned req_state, coap_pkt_t* pdu) {
    (void) req_state;
    (void) pdu;
    sending = false;
}

void *_multicast_event_loop(void *args) {
    (void)args;

    while (1) {
        msg_t msg;
        msg_receive(&msg);
        char *content = (char *)msg.content.value;
        printf(">>>>>>  >>>> content %s\n", content);
        udp_send(MULTICAST_ADDRESS, content);
        free(content);
    }
    return NULL;
}

int test_multicast(int argc, char **argv) {

    (void)argc;
    (void)argv;

    char *path = "/LED/strip";
    char *payloadOff = "ff02::1#0"; // 0x000000 -> 100% off
    char *payloadOn = "ff02::1#16711680"; // 0xff0000 -> 100% red
    int POST = 2;
    ipv6_addr_t addr;

    if (ipv6_addr_from_str(&addr, MULTICAST_ADDRESS) == NULL) {
        printf("Invalid address!\n");
        return -1;
    }

    for (int i = 0; i < 20; i++) {
        uint8_t buf[GCOAP_PDU_BUF_SIZE];
        coap_pkt_t pdu;

        gcoap_req_init(&pdu, &buf[0], GCOAP_PDU_BUF_SIZE, POST, path);
        char *payload = i % 2 == 0 ? payloadOn : payloadOff;
        printf("Sending: %s\n", payload);
        memcpy(pdu.payload, payload, strlen(payload));
        size_t len = gcoap_finish(&pdu, strlen(payload), COAP_FORMAT_TEXT);

        gcoap_req_send(buf, len, &addr, GCOAP_PORT, _resp_handler);
        sending = true;
        while (sending); // wait until response arrived
        usleep(500000);
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

    // start thread for multicast sending if not started already
    if (multicast_pid == KERNEL_PID_UNDEF) {
        multicast_pid = thread_create(mutlicast_stack, sizeof(mutlicast_stack), THREAD_PRIORITY_MAIN - 1,
                    THREAD_CREATE_STACKTEST, _multicast_event_loop, NULL, "Multicast Loop");
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
            msg_t msg;
            char *msg_content = malloc(sizeof(server_buffer));
            strcpy(msg_content, server_buffer);
            msg.content.value = (int)msg_content;
            
            printf(">>>>>>> ### value %i\n", (int)msg.content.value);

            msg_try_send(&msg, multicast_pid);
        }
    }

    return NULL;
}

kernel_pid_t startServer(void) {
    return thread_create(server_stack, sizeof(server_stack), THREAD_PRIORITY_MAIN - 1,
                      THREAD_CREATE_STACKTEST, _udp_server, PORTSTRING, "UDP Server");
}
