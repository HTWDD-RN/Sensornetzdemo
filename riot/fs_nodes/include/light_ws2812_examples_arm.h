#include <stdlib.h>
#include <stdio.h>

#include "light_ws2812_cortex.h"

#define MAXPIX 6

void set_simple_color(int rgb);

/*
default: _delay_us=500000
*/
void moving_light(int rgb, int _delay_us);

/*
default: intensity=100
*/
void hsv_crawling_lights(int intensity);