/*
 * myCoAP.c
 */

#include "include/myCoAP.h"

#include "net/gnrc/netif.h"
#include "net/gnrc/ipv6/netif.h"

#include "include/light_ws2812_examples_arm.h"

kernel_pid_t animation_pid = KERNEL_PID_UNDEF;

static char animation_stack[THREAD_STACKSIZE_DEFAULT];

void *_animation_loop(void *args)
{
    (void) args; // to ignore unused parameter warning

    int state = 0; // the state used in the animations

    ACTION action = NONE;
    int parameter = 0;

    // HSV animation
    int H = 0;
    // light waves
    int direction = 1, pix = 0;
     
    printf("Thread is now running. PID: %d. Args: %p\n", thread_getpid(), args);
    
    while(1)
    {
        msg_t msg;

        // if incoming message was received
        if (msg_try_receive(&msg) != -1) 
        {
            message_content *content;
            content = (message_content *)msg.content.value;

            printf("turns off annoying green led\n");

            // set action type
            action = content->action;
            if(!(action >= 0 || action <=5))
            {
                printf("ERROR: content->action %i _ return -1\n", action);
                exit(-1);
            }

            parameter = content->parameter;

            state = 0;      // reset state
            /* reset animation parameters */
            H = 0;          // reset HSV animation
            direction = 1;  // reset light waves animation
            pix = 0;        // reset light waves animation
            set_simple_color(0x000000);
        }

        switch(action) // switch for action type
        {
            case SET_COLOR:
                set_simple_color(parameter);
                break;
            case MOVING_LIGHT:
                moving_light(parameter, 500000, &state);
                break;
            case HSV_COLOR:
                hsv_color_wheel(parameter, &H, &state);
                break;
            case LIGHT_WAVES:
                pulsating_light_waves(&direction, &pix);
                break;
            case FFT:
                set_simple_color(parameter);
                break;
            default:
                break;
        }
    }
}


void startThread(void) 
{
    animation_pid = thread_create(animation_stack, sizeof(animation_stack), THREAD_PRIORITY_MAIN + 1,
                      THREAD_CREATE_STACKTEST, _animation_loop, NULL, "Eventloop");
}


int init_pin(gpio_t pin, gpio_mode_t mode)
{
    if (gpio_init(pin, mode) < 0) 
    {
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
    if (gpio_read(pin)) 
    {
        printf("GPIO_PIN(%u) is HIGH\n", (unsigned int)pin);
    }
    else
    {
        printf("GPIO_PIN(%u) is LOW\n", (unsigned int)pin);
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


void parse_animation_payload(const char *input, int *type, int *parameter)
{
	*type = 0; *parameter = 0;
	char *copy = strdup(input);

    char *action_type;
    char *andToken;
    action_type = strtok_r(copy, "&", &andToken);
    if (action_type == NULL || strlen(action_type) == 0) return;

    *type = strtol(action_type, NULL, 10);
    printf("type %i\n", *type);

    if (andToken == NULL || strlen(andToken) == 0) return;

    *parameter = strtol(andToken, NULL, 16);
    printf("parameter %i\n", *parameter);
}


unsigned long extract_payload(const char *input, char *output) 
{
    char *copy = strdup(input);

    char *line;
    char *lineToken;
    line = strtok_r(copy, "#", &lineToken);

    while (line != NULL)
    {
        char *lineCopy = strdup(line);

        char *content;
        char *andToken;
        content = strtok_r(lineCopy, "&", &andToken);

        // check if equal to ip
        if (isMyIP(content) != 0)
        {
            strcpy(output, andToken);
            return 1;
        }
        line = strtok_r(NULL, "#", &lineToken);
    }
    return 0;
}


// Returns 1 if given addr is matching one my self IPs; 0 otherwise.
int isMyIP(char *addr)
{
    ipv6_addr_t givenAddr;
    if (ipv6_addr_from_str(&givenAddr, addr) == NULL) 
    {
        printf("ERROR: Tried to compare IP address, but (%s) is not a valid IP.\n", addr);
        return 0;
    }

    kernel_pid_t ifs[GNRC_NETIF_NUMOF];
    size_t numof = gnrc_netif_get(ifs);

    for (size_t i = 0; i < numof && i < GNRC_NETIF_NUMOF; i++) 
    {
        kernel_pid_t dev = ifs[i];
        gnrc_ipv6_netif_t *entry = gnrc_ipv6_netif_get(dev);
        for (int i = 0; i < GNRC_IPV6_NETIF_ADDR_NUMOF; i++)
        {
            ipv6_addr_t addr = entry->addrs[i].addr;
            if (ipv6_addr_is_unspecified(&addr)) continue;

            if (ipv6_addr_equal(&givenAddr, &addr)) return 1;
        }
    }
    return 0;
}