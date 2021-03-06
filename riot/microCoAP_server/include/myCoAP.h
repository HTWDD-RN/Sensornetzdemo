/*
 * myCoAP.h
 * functions to use GPIO-Pins
 */

#ifndef EXAMPLES_MYCOAPSERVER_MYCOAPSTUFF_H_
#define EXAMPLES_MYCOAPSERVER_MYCOAPSTUFF_H_


#include "xtimer.h"
#include "periph/gpio.h"

#include <ctype.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>

#include "msg.h"
#include "shell.h"
#include "thread.h"

#include "light_ws2812_examples_arm.h"

typedef enum action { 
    NONE = 0,
    SET_COLOR = 1, 
    MOVING_LIGHT = 2, 
    HSV_COLOR = 3, 
    LIGHT_WAVES = 4,
    FFT = 5
} ACTION;

typedef struct {
    ACTION action;
    int parameter;
} message_content;

void *_event_loop(void *args);
void startThread(void);

int init_pin(gpio_t pin, gpio_mode_t mode);
int init_out(gpio_t pin);
int init_in(gpio_t pin);
int read(gpio_t pin);
int set(gpio_t pin);
int clear(gpio_t pin);
int toggle(gpio_t pin);

void parse_animation_payload(const char *input, int *type, int *parameter);
unsigned long extract_payload(const char *input, char *output);
int isMyIP(char *addr);

#endif /* EXAMPLES_MYCOAPSERVER_MYCOAPSTUFF_H_ */
