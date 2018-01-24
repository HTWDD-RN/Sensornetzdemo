#include "include/light_ws2812_examples_arm.h"

struct cRGB led[MAXPIX];

void set_simple_color(int rgb)
{
  printf(">>>>>>>>> SETTING COLOR %X\n", rgb);

	// set simple color to pixs
	if(rgb < 0 || rgb > 0xffffff)
	{
		printf("#ERROR: INVALID COLOR FORMAT! GOT (%X), EXPECTED BETWEEN 0x000000 and 0xFFFFFF\n");
		return;
	}

  printf(">>>>>>>>> RED:   %d\n>>>>>>>>> GREEN: %d\n>>>>>>>>> BLUE:  %d\n\n", (rgb & 0xff0000) >> 16, (rgb & 0x00ff00) >> 8, rgb & 0x0000ff);

	for(int i= 0; i < MAXPIX; i++)
	{
		led[i].r = (rgb & 0xff0000) >> 16;
		led[i].g = (rgb & 0x00ff00) >> 8;
		led[i].b = rgb & 0x0000ff;
	}

	ws2812_sendarray((uint8_t *)&led, MAXPIX*3);
}


void moving_light(int rgb, int _delay_us, int *state)
{
  // moving light dot
  if (*state == 0) {
    led[*state].r = (rgb & 0xff0000) >> 16;
    led[*state].g = (rgb & 0x00ff00) >> 8;
    led[*state].b = rgb & 0x0000ff;
  }

  ws2812_sendarray((uint8_t *)&led, MAXPIX*3);
  led[*state+1] = led[*state];
  led[*state].r = 0; led[*state].g = 0; led[*state].b = 0;
  *state++;
  xtimer_usleep(_delay_us);
  if(*state == MAXPIX)
  {
    *state = 0;
    led[MAXPIX-1].r=0; led[MAXPIX-1].g=0; led[MAXPIX-1].b=0;
    led[*state].r = (rgb & 0xff0000) >> 16;
    led[*state].g = (rgb & 0x00ff00) >> 8;
    led[*state].b = rgb & 0x0000ff;
  }
}


void hsv_crawling_lights(int intensity)
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

  // HSV color wheel crawling lights
  int i=0, H=0;
  float V=1, S=1, h, f, p, q, t;

  intensity*=2.55;

  while(1)
  {
    // HSV in RGB
    h=(int)(H/60);
    f=((float)H/60)-h;
    p=(V*(1-S))*intensity;
    q=(V*(1-(S*f)))*intensity;
    t=(V*(1-(S*(1-f))))*intensity;

    H++;
    if(H >=360)
      H=0;

    for(i=0;i<MAXPIX;i++)
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
    xtimer_usleep(5000);
  }
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

void pulsating_light_waves(void)
{
  int direction = 1, pix = 0;

  while(1)
  {
    pix++;

    if(pix >= MAXPIX*13*15)
      pix = 0;

    int j = 0, offset = map2PI(pix);
    float rsin, gsin, bsin;

    if ((rand()/(float)RAND_MAX) > .995)
      direction *= -1; // All skate, reverse direction!

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
      j = map2PI(i * direction) + offset;   // calculate angle
      rsin = sin(j);                 // sin(t)
      gsin = sin(2 * j / 13 + map2PI(MAXPIX / 6)); // sin(2/3 t + 1/3 PI)
      bsin = sin(4 * j / 15 + map2PI(MAXPIX / 3)); // sin(4/5 t + 2/3 PI)

      //this.ledstrip.buffer[i] = [this.scale(rsin), this.scale(gsin), this.scale(bsin)];
      led[i].r = scale(rsin);
      led[i].g = scale(gsin);
      led[i].b = scale(bsin);
    }

    ws2812_sendarray((uint8_t *)&led, MAXPIX*3);
    xtimer_usleep(50000);
  }
}