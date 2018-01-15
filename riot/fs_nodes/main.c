#include <stdio.h>
#include <unistd.h>

#include "periph/gpio.h"
#include "include/helpers.h"
#include "include/microCoAPServer.h"

extern void microcoap_server_loop(void);

void initialSetup(void) {
    sleep(3);
    led0_blink(LED0_PIN, 3);
    init_out(PIN_LED_GREEN);
    init_out(PIN_LED_RED);
    init_out(PIN_LED_STRIP);
    clear(PIN_LED_RED);
    clear(PIN_LED_GREEN);
    clear(PIN_LED_STRIP);
}

int main(void) {
    initialSetup();
    puts("SETUP successfull");
    puts("Waiting for address autoconfiguration...");
    sleep(3);

    /* start coap server loop */
    microcoap_server_loop();

    // should be never reached
    return 0;
}
