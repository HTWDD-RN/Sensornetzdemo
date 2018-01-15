#include "include/light_ws2812_examples_arm.h"

struct cRGB led[MAXPIX];

void set_simple_color(int rgb)
{
	// set simple color to pixs
	if(rgb > 16777215)
	{
		printf("#ERROR: INVALID COLOR FORMAT! EXAMPLE: ffffff\n");
		return;
	}

	for(int i=0;i<MAXPIX;i++)
	{
		led[i].r = (rgb & 0xff0000) >> 16;
		led[i].g = (rgb & 0x00ff00) >> 8;
		led[i].b = rgb & 0x0000ff;
	}

	ws2812_sendarray((uint8_t *)&led, MAXPIX*3);
}


void moving_light(int rgb, int _delay_us)
{
  // moving light dot
  int i=0;
  led[i].r = (rgb & 0xff0000) >> 16;
  led[i].g = (rgb & 0x00ff00) >> 8;
  led[i].b = rgb & 0x0000ff;

  while(1)
  {
    ws2812_sendarray((uint8_t *)&led, MAXPIX*3);
    led[i+1] = led[i];
    led[i].r = (rgb & 0xff0000) >> 16;
    led[i].g = (rgb & 0x00ff00) >> 8;
    led[i].b = rgb & 0x0000ff;
    i++;
    xtimer_usleep(_delay_us);
    if(i == MAXPIX)
    {
      i=0;
      led[MAXPIX-1].r=0; led[MAXPIX-1].g=0; led[MAXPIX-1].b=0;
      led[i].r = (rgb & 0xff0000) >> 16;
      led[i].g = (rgb & 0x00ff00) >> 8;
      led[i].b = rgb & 0x0000ff;
    }
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

  	V*=intensity;

    for(i=0;i<MAXPIX;i++)
    {
      if(0==h || h==6)
      { led[i].r=V; led[i].g=t; led[i].b=p; }
      if(h==1)
      { led[i].r=q; led[i].g=V; led[i].b=p; }
      if(h==2)
      { led[i].r=p; led[i].g=V; led[i].b=t; }
      if(h==3)
      { led[i].r=p; led[i].g=q; led[i].b=V; }
      if(h==4)
      { led[i].r=t; led[i].g=p; led[i].b=V; }
      if(h==5)
      { led[i].r=V; led[i].g=p; led[i].b=q; }
    }

    ws2812_sendarray((uint8_t *)&led, MAXPIX*3);
    xtimer_usleep(5000);
  }
}