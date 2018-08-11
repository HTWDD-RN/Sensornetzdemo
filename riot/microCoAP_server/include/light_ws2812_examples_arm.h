#include <stdlib.h>
#include <stdio.h>
#include <math.h>
#include <xtimer.h>

#include "light_ws2812_cortex.h"

#define MAXPIX 4
#define PI 3.14159265

/*
set_simple_color
*/
void set_simple_color(int rgb);

/*
default: _delay_us=500000
*/
void moving_light(int rgb, int _delay_us, int *state);

/*
default: intensity=100
*/
void hsv_color_wheel(int intensity, int *H, int *state);


/*
pulsating_light_waves
*/
float map2PI(int pix);

int scale(float val);

void pulsating_light_waves(int *direction, int *pix);

/*
fft_light_organ
*/
//void fft_light_organ(int *fft_array);