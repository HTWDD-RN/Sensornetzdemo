/*
 * myCoapStuff.c
 */

#include "include/myCoapStuff.h"

#include "net/gnrc/netif.h"
#include "net/gnrc/ipv6/netif.h"

#include "include/light_ws2812_examples_arm.h"

kernel_pid_t animation_pid = KERNEL_PID_UNDEF;

static char animation_stack[THREAD_STACKSIZE_DEFAULT];

void *_animation_loop(void *args) {
    (void) args; // to ignore unused parameter warning

    int state = 0; // the state used in the animations

    ACTION action = NONE;
    int parameter = 0;
    int parameters[MAXPIX];
    for(int i=0;i<MAXPIX;i++)
        parameters[i] = 0;

    // HSV animation
    int H = 0;
    // light waves
    int direction = 1, pix = 0;
     
    printf("Thread is now running. PID: %d. Args: %p\n", thread_getpid(), args);
    
    while(1) {
        msg_t msg;

        // if incoming message was received
        if (msg_try_receive(&msg) != -1) {
            
            message_content *content;
            content = (message_content *)msg.content.value;
            printf("turns off annoying green led\n");

            // set action type 
            action = content->action;

            //printf("<<<<>>> action %i\n", action);

            if(action != 5)
            {
                parameter = content->parameter;
                //printf("<<<<>>> parameter %i\n", parameter);
            }else if(action == 5)
            {
                for(int i=0;i<MAXPIX;i++)
                {
                    parameters[i] = content->parameters[i];
                    //printf("<<<<>>> parameters %i\n", parameters[i]);
                }
            }

            state = 0;      // reset state
            /* reset animation parameters */
            H = 0;          // reset HSV animation
            direction = 1;  // reset light waves animation
            pix = 0;        // reset light waves animation
            free(content);
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
                hsv_crawling_lights(parameter, &H, &state);
                break;
            case LIGHT_WAVES:
                pulsating_light_waves(&direction, &pix);
                break;
            case FFT:
                fft_equalizer(&parameters);
                break;
            default:
                break;
        }
    }
}

void startThread(void) {
    animation_pid = thread_create(animation_stack, sizeof(animation_stack), THREAD_PRIORITY_MAIN + 1,
                      THREAD_CREATE_STACKTEST, _animation_loop, NULL, "Eventloop");
}

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

void parse_animation_payload(const char *input, int *type, int *parameter) {
	*type = 0; *parameter = 0;
	char *copy = strdup(input);
	char *line;
	line = strtok(copy, "&");
	if (line == NULL || strlen(line) == 0) return;
	*type = (int)strtol(line, NULL, 10);
	
	line = strtok(NULL, "\n");
	if (line == NULL || strlen(line) == 0) return;
	*parameter = (int)strtol(line, NULL, 10);
}

void parse_payload_fft(const char *input, int *type, int *parameters) {
    //printf("input %s\n", input); // input-example: 5FFFFFFAB536A9BD399AB536A

    char *type_c = (char*)malloc(1);
    strncpy(type_c, input, 1);
    *type = strtol(type_c, NULL, 10);
    free(type_c);

    char *color = (char*)malloc(6);
    for(int i=0; i<MAXPIX; i++)
    {
        strncpy(color, input+1+(i*6), 6);
        parameters[i] = strtol(color, NULL, 16);
    }
    free(color);

/* 
    char *copy = strdup(input);
        
    //printf("copy1 %s\n", copy);

    char *line;
    line = strtok(copy, "&");

    //printf("copy %s\n", copy);
    //printf("line %s\n", line);

    if (line == NULL || strlen(line) == 0) return;
    *type = (int)strtol(line, NULL, 10);
    
    printf(">>>>>> type %i _line %s\n", *type, line);

    line = strtok(NULL, "\n"); // 255,180,80,0;

    //printf(">>>>>> line %s\n", line);
    
    if (line == NULL || strlen(line) == 0) return;
    
    char delimiter[] = ",";
    char *ptr;
    // initialisieren und ersten Abschnitt erstellen
    ptr = strtok(line, delimiter);
    */

    //int i = 0;
    //printf(">><<<>>>>2 param_size %i\n", param_size);

    /*while(ptr != NULL && i<param_size) {
        //printf("Abschnitt gefunden: %s\n", ptr);
        parameters[i] = atoi(ptr);
        //printf(">>>>>> parameters[i] %i\n", parameters[i]);
        // naechsten Abschnitt erstellen
        ptr = strtok(NULL, delimiter);
        i++;
    }*/

    /*for(int i=0; i<param_size; i++)
    {
        if(ptr != NULL)
        {
        //printf("Abschnitt gefunden: %s\n", ptr);
        parameters[i] = atoi(ptr);
        //printf(">>>>>> parameters[i] %i\n", parameters[i]);
        // naechsten Abschnitt erstellen
        ptr = strtok(NULL, delimiter);
        }
    }*/

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

        //printf("givenAddr ERROR %i\n", givenAddr);
        //    printf("addr ERROR %s\n", addr);

        return 0;
    }

    //printf("givenAddr %i\n", givenAddr);
    //printf("addr %s\n", addr);


    kernel_pid_t ifs[GNRC_NETIF_NUMOF];
    size_t numof = gnrc_netif_get(ifs);

    for (size_t i = 0; i < numof && i < GNRC_NETIF_NUMOF; i++) {
        kernel_pid_t dev = ifs[i];
        gnrc_ipv6_netif_t *entry = gnrc_ipv6_netif_get(dev);
        for (int i = 0; i < GNRC_IPV6_NETIF_ADDR_NUMOF; i++) {
            ipv6_addr_t addr = entry->addrs[i].addr;
            if (ipv6_addr_is_unspecified(&addr)) { continue; }

            if (ipv6_addr_equal(&givenAddr, &addr)) {

    //printf("+++++++ givenAddr EQUAL %i\n", givenAddr);
    //printf("+++++++ addr EQUAL  %s\n", addr);

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

    printf(">>> EP input %s\n", input);
    printf(">>> EP strlen copy %i\n", strlen(copy));
    printf(">>> EP copy %s\n", copy);

    char *line;
    char *lineToken;
    line = strtok_r(copy, "\n", &lineToken);
    printf(">>> strlen line %s\n", line);
    printf(">>> EP line %s\n", line);
    //while (line != NULL)
    //{
        char *hashtagToken;
        char *lineCopy = strdup(line);
        printf(">>> EP lineCopy %s\n", lineCopy);
        char *content;
        
        content = strtok_r(lineCopy, "#", &hashtagToken);
         printf(">>> EP content %s\n", content);
        // check if equal to ip
        //if (isMyIP(content) != 0) {
            content = strtok_r(NULL, "\n", &hashtagToken);
            strcpy(output, content);
            
            printf(">>> EP output %s\n", output);

            // output[strlen(content)] = '\0';
            //return strlen(content);
            //return 1;
        //}
        
       // line = strtok_r(NULL, "\n", &lineToken);
    //}
   // *output = 0; // if no ip matched, no string should be parsed
   // return 0;
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
