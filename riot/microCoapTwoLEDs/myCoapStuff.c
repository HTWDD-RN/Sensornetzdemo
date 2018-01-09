/*
 * myCoapStuff.c
 */


#include "include/myCoapStuff.h"



void led0_blink(gpio_t led0_pin, int times)
{
		/* initialize the on-board LED */
	int oldFlank = gpio_read(led0_pin);
	for (int var = 0; var < times; var++) {
		toggle(led0_pin);
		xtimer_sleep(1);
	}

	int newFlank = read(led0_pin);
	if(oldFlank==0 && newFlank>0) {
		toggle(led0_pin);
	} else if (oldFlank>0 && newFlank == 0) {
		toggle(led0_pin);
	}
}

int init_pin(gpio_t pin, gpio_mode_t mode)
{

    if (gpio_init(pin, mode) < 0) {
        printf("Error to initialize GPIO_PIN(%lu)\n", pin);
        return 1;
    }

    return 0;
}

int init_out(gpio_t pin)
{
    return init_pin(pin, GPIO_OUT);
}

int init_in(gpio_t pin)
{
    return init_pin(pin, GPIO_IN);
}

int read(gpio_t pin)
{

    if (gpio_read(pin)) {
        printf("GPIO_PIN(%lu) is HIGH\n", pin);
    }
    else {
        printf("GPIO_PIN(%lu) is LOW\n", pin);
    }

    return 0;
}

int parse_payload(const uint8_t *input, size_t size )
{
    int i=0, val=0;
    for ( ; i < size && isdigit( input[i] ); i++ )
        val = val * 10 + input[i] - '0';

    return( val );
}

void parse_payload_rgb(const char *input, int *rgb, size_t rgb_size)
{
	char *copy = strdup(input);
	char delimiter[] = ";";
	char *splitted_string;

	splitted_string = strtok(copy, delimiter);
	int i = 0;
	while (splitted_string != NULL)
	{
	  rgb[i] = atoi(splitted_string);
	  splitted_string = strtok (NULL, delimiter);
	  i++;
	  if(i >= rgb_size)
	    splitted_string = NULL;
	}		
}

int set(gpio_t pin)
{

    gpio_set(pin);

    return 0;
}

int clear(gpio_t pin)
{
    gpio_clear(pin);

    return 0;
}

int toggle(gpio_t pin)
{
    gpio_toggle(pin);

    return 0;
}
