#include <stdlib.h>
#include <stdio.h>
#include <math.h>
#include <xtimer.h>

#include "light_ws2812_cortex.h"

#define MAXPIX 6
#define PI 3.14159265

void set_simple_color(int rgb);

/*
default: _delay_us=500000
*/
void moving_light(int rgb, int _delay_us, int state);

/*
default: intensity=100
*/
void hsv_crawling_lights(int intensity);


float map2PI(int pix);

int scale(float val);

void pulsating_light_waves(void);