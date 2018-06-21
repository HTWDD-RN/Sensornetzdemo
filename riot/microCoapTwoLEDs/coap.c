/*
 * Copyright (C) 2015 Kaspar Schleiser <kaspar@schleiser.de>
 *
 * This file is subject to the terms and conditions of the GNU Lesser
 * General Public License v2.1. See the file LICENSE in the top level
 * directory for more details.
 */

#include <coap.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>

#include "include/myCoapStuff.h"
#include "include/microCoAPServer.h"
#include "include/light_ws2812_examples_arm.h"

#define MAX_RESPONSE_LEN 500

extern kernel_pid_t animation_pid;

static uint8_t response[MAX_RESPONSE_LEN] = { 0 };

static int handle_get_well_known_core(coap_rw_buffer_t *scratch,
                                      const coap_packet_t *inpkt,
                                      coap_packet_t *outpkt,
                                      uint8_t id_hi, uint8_t id_lo);

static int handle_get_riot_board(coap_rw_buffer_t *scratch,
                                 const coap_packet_t *inpkt,
                                 coap_packet_t *outpkt,
                                 uint8_t id_hi, uint8_t id_lo);

static int handle_get_seconds_led0_blink(coap_rw_buffer_t *scratch,
                                 const coap_packet_t *inpkt,
                                 coap_packet_t *outpkt,
                                 uint8_t id_hi, uint8_t id_lo);

static int handle_get_toggle_red(coap_rw_buffer_t *scratch,
                                 const coap_packet_t *inpkt,
                                 coap_packet_t *outpkt,
                                 uint8_t id_hi, uint8_t id_lo);//pin PB02

static int handle_get_toggle_green(coap_rw_buffer_t *scratch,
                                const coap_packet_t *inpkt,
                                coap_packet_t *outpkt,
                                uint8_t id_hi, uint8_t id_lo); // pin PA14


static int handle_post_led_strip(coap_rw_buffer_t *scratch,
                                const coap_packet_t *inpkt,
                                coap_packet_t *outpkt,
                                uint8_t id_hi, uint8_t id_lo); // pin PA14

static int handle_post_led_animation(coap_rw_buffer_t *scratch,
                                const coap_packet_t *inpkt,
                                coap_packet_t *outpkt,
                                uint8_t id_hi, uint8_t id_lo);

static int handle_post_led_fft(coap_rw_buffer_t *scratch,
                                const coap_packet_t *inpkt,
                                coap_packet_t *outpkt,
                                uint8_t id_hi, uint8_t id_lo);


static const coap_endpoint_path_t path_well_known_core =
        { 2, { ".well-known", "core" } };

static const coap_endpoint_path_t path_riot_board =
        { 2, { "riot", "board" } };

static const coap_endpoint_path_t path_toggle_red =
        { 2, { "LED", "red" } };

static const coap_endpoint_path_t path_toggle_green =
        { 2, { "LED", "green" } };

static const coap_endpoint_path_t path_led0_blink =
        { 2, { "htw", "led0" } };

static const coap_endpoint_path_t path_led_strip =
        { 2, { "LED", "strip" } };

static const coap_endpoint_path_t path_led_animation =
        { 2, { "LED", "animation" } };

static const coap_endpoint_path_t path_led_fft =
        { 2, { "LED", "fft" } };

const coap_endpoint_t endpoints[] =
{
    { COAP_METHOD_GET,  handle_get_well_known_core,
        &path_well_known_core, "ct=40" },
    { COAP_METHOD_GET,	handle_get_riot_board,
        &path_riot_board,	   "ct=0"  },
    { COAP_METHOD_POST,	handle_get_toggle_red,
		    &path_toggle_red,	   "ct=0;rt=switch"  },
    { COAP_METHOD_POST,	handle_get_toggle_green,
  		  &path_toggle_green,	   "ct=0;rt=switch"  },
    { COAP_METHOD_POST,	handle_get_seconds_led0_blink,
		    &path_led0_blink,	   "ct=0"  },
    { COAP_METHOD_POST,	handle_post_led_strip,
		    &path_led_strip,	   "ct=0;rt=rgb"  },
    { COAP_METHOD_POST, handle_post_led_animation,
        &path_led_animation, "ct=0;rt=animation"  },
    { COAP_METHOD_POST, handle_post_led_fft,
        &path_led_fft, "ct=0;rt=fft"  },
    /* marks the end of the endpoints array: */
    { (coap_method_t)0, NULL, NULL, NULL }
};

static int handle_get_toggle_red(coap_rw_buffer_t *scratch,
		const coap_packet_t *inpkt, coap_packet_t *outpkt,
		uint8_t id_hi, uint8_t id_lo)
{


  int onOff = parse_payload( inpkt->payload.p, inpkt->payload.len );
  char str[1];
  if(onOff == 0) {
    clear(PIN_LED_RED);
  } else if(onOff == 1) {
    set(PIN_LED_RED);
  } else {

  }

  sprintf(str, "%d", onOff);
  int len = sizeof(str);
  memcpy(response, str, len);
      return coap_make_response(scratch, outpkt, (const uint8_t *)response, len,
                                id_hi, id_lo, &inpkt->tok, COAP_RSPCODE_CONTENT,
                                COAP_CONTENTTYPE_TEXT_PLAIN);
}

static int handle_get_toggle_green(coap_rw_buffer_t *scratch,
    const coap_packet_t *inpkt, coap_packet_t *outpkt,
    uint8_t id_hi, uint8_t id_lo)
{

        const char *input = (const char*)inpkt->payload.p;
        char buffer[256];
        int payloadLen = (int)extract_payload(input, buffer);
        if (payloadLen <= 0)
            return -1;

        int onOff = parse_payload((const uint8_t*)buffer, payloadLen);

        char str[1];
        if(onOff == 0) {
          clear(PIN_LED_GREEN);
        } else if(onOff == 1) {
          set(PIN_LED_GREEN);
        } else {

        }

        sprintf(str, "%d", onOff);
        int len = sizeof(str);
        memcpy(response, str, len);
      //const char *riot_name = RIOT_BOARD;
      return coap_make_response(scratch, outpkt, (const uint8_t *)response, len,
                                id_hi, id_lo, &inpkt->tok, COAP_RSPCODE_CONTENT,
                                COAP_CONTENTTYPE_TEXT_PLAIN);
}

static int handle_post_led_strip(coap_rw_buffer_t *scratch,
		const coap_packet_t *inpkt, coap_packet_t *outpkt,
		uint8_t id_hi, uint8_t id_lo)
{
    // red by default to indicate parsing error visually
	int rgb = 0xff0000;
	const char *input = (const char*)inpkt->payload.p;

	char buffer[20];
	if (extract_payload(input, buffer)) {
		printf("Parsed my payload: %s\n", buffer);
        	rgb = parse_payload_rgb(buffer);
	} else {
        printf("WARN: Couldn't extract payload (nothing for me?!) [buffer: %s]\n", input);
		return -1;
	}
  
  message_content *msg_content = malloc(sizeof(message_content));
  msg_content->action = SET_COLOR;
  msg_content->parameter = rgb;
  msg_t msg;
  msg.content.value = (int)msg_content;
  msg_send(&msg, animation_pid);

  memcpy(response, "TODO", 4);

	return coap_make_response(scratch, outpkt, (const uint8_t *)response, 1,
	                          id_hi, id_lo, &inpkt->tok, COAP_RSPCODE_CONTENT,
	                          COAP_CONTENTTYPE_TEXT_PLAIN);
}

static int handle_post_led_animation(coap_rw_buffer_t *scratch,
    const coap_packet_t *inpkt, coap_packet_t *outpkt,
    uint8_t id_hi, uint8_t id_lo)
{
    // red by default to indicate parsing error visually
  int type = SET_COLOR, parameter = 0xff0000;
  const char *input = (const char*)inpkt->payload.p;

  char buffer[20];
  if (extract_payload(input, buffer)) {
    printf("Parsed my payload: %s\n", buffer);
    parse_animation_payload(buffer, &type, &parameter);
  } else {
        printf("WARN: Couldn't extract payload (nothing for me?!) [buffer: %s]\n", input);
    return -1;
  }

  message_content *msg_content = malloc(sizeof(message_content));
  msg_content->action = type;
  msg_content->parameter = parameter;
  msg_t msg;
  msg.content.value = (int)msg_content;
  msg_send(&msg, animation_pid);

  memcpy(response, "TODO", 4);

  return coap_make_response(scratch, outpkt, (const uint8_t *)response, 1,
                            id_hi, id_lo, &inpkt->tok, COAP_RSPCODE_CONTENT,
                            COAP_CONTENTTYPE_TEXT_PLAIN);
}

static int handle_post_led_fft(coap_rw_buffer_t *scratch,
    const coap_packet_t *inpkt, coap_packet_t *outpkt,
    uint8_t id_hi, uint8_t id_lo)
{

  int parameters[MAXPIX];
  for(int i=0; i<MAXPIX; i++)
  {
    parameters[i] = 0xff0000;
    printf("parameters %i\n", parameters[i]);
  }

  int type = FFT;


  /*const char *input = (const char*)inpkt->payload.p; 
  // input-example: ip-address + type + color (hex-code) + ; + \n

  char buffer[MAXPIX*6+1+1+5]; // PIX Color + type + ; + \n


  if (extract_payload(input, buffer)) {
    printf("Parsed my payload: %s\n", buffer);

    printf("strlen(buffer): %i\n", strlen(buffer));    

    if(((strlen(buffer)-2)%6) == 0) // buffer-example: type (5) and color (hex) -> 5FFFFFFAB536A9BD399AB536A;
      parse_payload_fft(buffer, &type, &parameters);

    // if(type != 5)
    //   type = 5;
    // if((sizeof(parameters)/sizeof(parameters[0])) != MAXPIX)
    //   for(int i=0;i<MAXPIX;i++)
    //     parameters[i] = 0;

    printf("<>>>>>>> actionType %i\n", type);
    //for(int i=0; i<MAXPIX;i++)
    //  printf("parameters %i\n", parameters[i]);

    message_content *msg_content = malloc(sizeof(message_content));
    msg_content->action = type;
    for(int i=0;i<MAXPIX;i++)
    {
      msg_content->parameters[i] = parameters[i];
      printf(">>>>>>>>>>> msg_content param %i\n", msg_content->parameters[i]);
    }
    msg_t msg;
    msg.content.value = (int)msg_content;
    msg_send(&msg, animation_pid);

  }else {
      printf("WARN: Couldn't extract payload (nothing for me?!) [buffer: %s]\n", input);
    //return -1;
  }*/

    message_content *msg_content = malloc(sizeof(message_content));
    msg_content->action = type;
    for(int i=0;i<MAXPIX;i++)
    {
      msg_content->parameters[i] = parameters[i];
      printf(">>>>>>>>>>> msg_content param %i\n", msg_content->parameters[i]);
    }
    msg_t msg;
    msg.content.value = (int)msg_content;
    msg_send(&msg, animation_pid);

  memcpy(response, "TODO", 4);

  printf("<>>>>>>> before coap_make_response %i\n", response);

  return coap_make_response(scratch, outpkt, (const uint8_t *)response, 1,
                            id_hi, id_lo, &inpkt->tok, COAP_RSPCODE_CONTENT,
                            COAP_CONTENTTYPE_TEXT_PLAIN);
}

static int handle_get_seconds_led0_blink(coap_rw_buffer_t *scratch,
    const coap_packet_t *inpkt, coap_packet_t *outpkt,
    uint8_t id_hi, uint8_t id_lo)
{
      int times = parse_payload( inpkt->payload.p, inpkt->payload.len );
      //size_t lenpayload = inpkt->payload.len;
      //int times = atoi(p);
      char str[80];
      sprintf(str, "Blinked %d times", times);
      puts(str);
      int len = sizeof(str);
      memcpy(response, str, len);

      led0_blink(LED0_PIN,times);
	    return coap_make_response(scratch, outpkt, (const uint8_t *)response, len,
	                              id_hi, id_lo, &inpkt->tok, COAP_RSPCODE_CONTENT,
	                              COAP_CONTENTTYPE_TEXT_PLAIN);
}

static int handle_get_well_known_core(coap_rw_buffer_t *scratch,
        const coap_packet_t *inpkt, coap_packet_t *outpkt,
        uint8_t id_hi, uint8_t id_lo)
{
    char *rsp = (char *)response;
    /* resetting the content of response message */
    memset(response, 0, sizeof(response));
    int len = sizeof(response);
    const coap_endpoint_t *ep = endpoints;
    int i;

    len--; // Null-terminated string

    while (NULL != ep->handler) {
        if (NULL == ep->core_attr) {
            ep++;
            continue;
        }

        if (0 < strlen(rsp)) {
            strncat(rsp, ",", len);
            len--;
        }

        strncat(rsp, "<", len);
        len--;

        for (i = 0; i < ep->path->count; i++) {
            strncat(rsp, "/", len);
            len--;

            strncat(rsp, ep->path->elems[i], len);
            len -= strlen(ep->path->elems[i]);
        }

        strncat(rsp, ">;", len);
        len -= 2;

        strncat(rsp, ep->core_attr, len);
        len -= strlen(ep->core_attr);

        ep++;
    }

    return coap_make_response(scratch, outpkt, (const uint8_t *)rsp,
                              strlen(rsp), id_hi, id_lo, &inpkt->tok,
                              COAP_RSPCODE_CONTENT,
                              COAP_CONTENTTYPE_APPLICATION_LINKFORMAT);
}

static int handle_get_riot_board(coap_rw_buffer_t *scratch,
        const coap_packet_t *inpkt, coap_packet_t *outpkt,
        uint8_t id_hi, uint8_t id_lo)
{
    const char *riot_name = RIOT_BOARD;
    int len = strlen(RIOT_BOARD);

    memcpy(response, riot_name, len);

    return coap_make_response(scratch, outpkt, (const uint8_t *)response, len,
                              id_hi, id_lo, &inpkt->tok, COAP_RSPCODE_CONTENT,
                              COAP_CONTENTTYPE_TEXT_PLAIN);
}
