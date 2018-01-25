/*
 * Copyright (C) 2015 Kaspar Schleiser <kaspar@schleiser.de>
 *
 * This file is subject to the terms and conditions of the GNU Lesser
 * General Public License v2.1. See the file LICENSE in the top level
 * directory for more details.
 */

/**
 * @ingroup     examples
 * @{
 *
 * @file
 * @brief       CoAP example server application (using microcoap)
 *
 * @author      Kaspar Schleiser <kaspar@schleiser.de>
 * @}
 */

#include <stdio.h>
#include "msg.h"
#include "xtimer.h"
#include "periph/gpio.h"
#include "include/myCoapStuff.h"
#include "include/microCoAPServer.h"

#define MAIN_QUEUE_SIZE     (8)
static msg_t _main_msg_queue[MAIN_QUEUE_SIZE];

// Per convention, RIOT defines a macro that is assigned the pin number of an
// on-board LED. If no LED is available, the pin number defaults to 0. For
// compatibility with the Arduino IDE, we also fall back to pin 0 here, if the
// RIOT macro is not available

void microcoap_server_loop(void);

/* import "ifconfig" shell command, used for printing addresses */
extern int _netif_config(int argc, char **argv);

int main(void)
{
    msg_init_queue(_main_msg_queue, MAIN_QUEUE_SIZE);

    puts("RIOT microcoap example application");
    xtimer_sleep(3);
    led0_blink(LED0_PIN, 3);
    init_out(PIN_LED_GREEN);
    init_out(PIN_LED_RED);
    init_out(PIN_LED_STRIP);
    clear(PIN_LED_RED);
    clear(PIN_LED_GREEN);
    clear(PIN_LED_STRIP);
    puts("SETUP successfull");
    puts("Waiting for address autoconfiguration...");
    xtimer_sleep(3);

    /* print network addresses */
    puts("Configured network interfaces:");
    _netif_config(0, NULL);

    /* start thread */
    startThread();

    /* start coap server loop */
    microcoap_server_loop();

    /* should be never reached */
    return 0;
}
