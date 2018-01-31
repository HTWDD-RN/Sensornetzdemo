#include "include/light_ws2812_examples_arm.h"

/* declare struct variable */
struct cRGB led[MAXPIX];

void set_simple_color(int rgb)
{
	// set simple color to pixs
	if(rgb < 0 || rgb > 0xffffff)
	{
		printf("#ERROR: INVALID COLOR FORMAT! GOT (%X), EXPECTED BETWEEN 0x000000 and 0xFFFFFF\n");
		return;
	}
  
	for(int i= 0; i < MAXPIX; i++)
	{
		led[i].r = (rgb & 0xff0000) >> 16;
		led[i].g = (rgb & 0x00ff00) >> 8;
		led[i].b = rgb & 0x0000ff;
    //printf("r[%i] g[%i] b[%i]\n", led[i].r, led[i].g, led[i].b);
	}

	ws2812_sendarray((uint8_t *)&led, MAXPIX*3);
  xtimer_usleep(10000);
}

/**
 * moving light animation
 */
void moving_light(int rgb, int _delay_us, int *state)
{
  for (int i = 0; i < MAXPIX; i++) {
    int color = i == *state ? rgb : 0x000000;
    led[i].r = (color & 0xff0000) >> 16;
    led[i].g = (color & 0x00ff00) >> 8;
    led[i].b = color & 0x0000ff;
  }

  ws2812_sendarray((uint8_t *)&led, MAXPIX*3);
  xtimer_usleep(_delay_us);
  *state = (*state == MAXPIX-1) ? 0 : *state + 1;
}

/**
 * HSV color wheel crawling lights
 */
void hsv_crawling_lights(int intensity, int *H, int *state)
{
  if(intensity > 100)
  {
    intensity = 100;
    printf("Intensity value [%i] too high! Set to 100\n", intensity);
  }
  if(intensity < 0)
  {
    intensity=0;
    printf("Intensity value [%i] too low! Set to 0\n", intensity);
  }

  if (*state == 0) {
    intensity *= 2.55;
    *state = 1;
  }

  // HSV in RGB
  float V=1, S=1;
  int h=(int)(*H/60);
  float f=((float)*H/60)-h;
  float p=(V*(1-S))*intensity;
  float q=(V*(1-(S*f)))*intensity;
  float t=(V*(1-(S*(1-f))))*intensity;

  *H += 1;
  if(*H >= 360)
    *H = 0;

  for(int i=0;i<MAXPIX;i++)
  {
    if(0==h || h==6)
    { led[i].r=V*intensity; led[i].g=t; led[i].b=p; }
    if(h==1)
    { led[i].r=q; led[i].g=V*intensity; led[i].b=p; }
    if(h==2)
    { led[i].r=p; led[i].g=V*intensity; led[i].b=t; }
    if(h==3)
    { led[i].r=p; led[i].g=q; led[i].b=V*intensity; }
    if(h==4)
    { led[i].r=t; led[i].g=p; led[i].b=V*intensity; }
    if(h==5)
    { led[i].r=V*intensity; led[i].g=p; led[i].b=q; }
  }

  ws2812_sendarray((uint8_t *)&led, MAXPIX*3);
  xtimer_usleep(10000);
}

/**
 * Map an integer so that 0..ledstrip.len => 0..2PI
 */
float map2PI(int pix)
{
  return (PI*2.0*pix)/(float)MAXPIX;
}

/**
 * scale values [-1.0, 1.0] to [0, 255]
 */
int scale(float val)
{
  val += 1;
  val *= 255/2;
  return (int)val;
}

void pulsating_light_waves(int *direction, int *pix)
{
  *pix += 1;

  if(*pix >= MAXPIX*13*15)
    *pix = 0;

  int j = 0, offset = map2PI(*pix);
  float rsin = 0, gsin = 0, bsin = 0;

  if ((rand()/(float)RAND_MAX) > .995)
    *direction *= -1; // All skate, reverse direction!

  for (int i = 0; i < MAXPIX; i++)
  {
    /**
     * Generate some RGBs, range [-1, +1]
     * If you think about the LED strip as a unit circle, with 
     * circumference 2 PI, then angle between the LEDs is simply
     *   2 PI / count 
     * And the angle for any particular LED will be
     *   (2 PI / count) * position
     * That's what the map2PI() method does.
     */
    j = map2PI(i * (*direction)) + offset;   // calculate angle
    rsin = sin(j);                 // sin(t)
    gsin = sin(2 * j / 13 + map2PI(MAXPIX / 6)); // sin(2/3 t + 1/3 PI)
    bsin = sin(4 * j / 15 + map2PI(MAXPIX / 3)); // sin(4/5 t + 2/3 PI)

    led[i].r = scale(rsin);
    led[i].g = scale(gsin);
    led[i].b = scale(bsin);
  }

  ws2812_sendarray((uint8_t *)&led, MAXPIX*3);
  xtimer_usleep(50000);
}