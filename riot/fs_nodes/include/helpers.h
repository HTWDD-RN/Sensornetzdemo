/*
 * myCoapStuff.h
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

void led0_blink(gpio_t led0_pin, int times);
int init_pin(gpio_t pin, gpio_mode_t mode);
int init_out(gpio_t pin);
int init_in(gpio_t pin);
int readPin(gpio_t pin);
int set(gpio_t pin);
int clear(gpio_t pin);
int toggle(gpio_t pin);
int parse_payload(const uint8_t *input, size_t size );
int parse_payload_rgb(const char *input);
unsigned long extract_payload(char *input, char *output);

#endif /* EXAMPLES_MYCOAPSERVER_MYCOAPSTUFF_H_ */
