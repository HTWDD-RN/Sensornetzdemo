/*
 * myCoapStuff.c
 */

#include "include/myCoapStuff.h"

#include "net/gnrc/netif.h"
#include "net/gnrc/ipv6/netif.h"

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
        printf("Error to initialize GPIO_PIN(%u)\n", (unsigned int)pin);
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
        printf("GPIO_PIN(%u) is HIGH\n", (unsigned int)pin);
    }
    else {
        printf("GPIO_PIN(%u) is LOW\n", (unsigned int)pin);
    }

    return 0;
}

int parse_payload(const uint8_t *input, size_t size )
{
    unsigned int i=0, val=0;
    for ( ; i < size && isdigit( input[i] ); i++ )
        val = val * 10 + input[i] - '0';

    return( val );
}

int parse_payload_rgb(const char *input)
{
    return strtol(input, NULL, 10);
}

/// Returns 1 if given addr is matching one my self IPs; 0 otherwise.
int isMyIP(char *addr)
{
    ipv6_addr_t givenAddr;
    if (ipv6_addr_from_str(&givenAddr, addr) == NULL) {
        printf("ERROR: Tried to compare IP address, but (%s) is not a valid IP.\n", addr);
        return 0;
    }

    kernel_pid_t ifs[GNRC_NETIF_NUMOF];
    size_t numof = gnrc_netif_get(ifs);

    for (size_t i = 0; i < numof && i < GNRC_NETIF_NUMOF; i++) {
        kernel_pid_t dev = ifs[i];
        gnrc_ipv6_netif_t *entry = gnrc_ipv6_netif_get(dev);
        for (int i = 0; i < GNRC_IPV6_NETIF_ADDR_NUMOF; i++) {
            ipv6_addr_t addr = entry->addrs[i].addr;
            if (ipv6_addr_is_unspecified(&addr)) continue;

            if (ipv6_addr_equal(&givenAddr, &addr)) {
                return 1;
            }
        }
    }
    return 0;
}

/// input:
///        IP#somePayload
///        IP2#payload2
///
/// returns: length of found input
///
/// *NOTE*: Could return NULL if no payload for this node was included!
unsigned long extract_payload(const char *input, char *output) {
    char *copy = strdup(input);
    char *line;
    char *lineToken;
    line = strtok_r(copy, "\n", &lineToken);
    while (line != NULL)
    {
        char *hashtagToken;
        char *lineCopy = strdup(line);
        char *content;
        
        content = strtok_r(lineCopy, "#", &hashtagToken);
        // check if equal to ip
        if (isMyIP(content) != 0) {
            content = strtok_r(NULL, "\n", &hashtagToken);
            strcpy(output, content);
            // output[strlen(content)] = '\0';
            return strlen(content);
        }
        
        line = strtok_r(NULL, "\n", &lineToken);
    }
    return 0;
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
