/*
 * Copyright (C) 2015 Kaspar Schleiser <kaspar@schleiser.de>
 *
 * This file is subject to the terms and conditions of the GNU Lesser
 * General Public License v2.1. See the file LICENSE in the top level
 * directory for more details.
 */

#include <coap.h>
#include <string.h>
#include <stdlib.h>
#include "include/myCoapStuff.h"
#include "include/microCoAPServer.h"
#define MAX_RESPONSE_LEN 500
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

const coap_endpoint_t endpoints[] =
{
    { COAP_METHOD_GET,	handle_get_well_known_core,
        &path_well_known_core, "ct=40" },
    { COAP_METHOD_GET,	handle_get_riot_board,
        &path_riot_board,	   "ct=0"  },
    { COAP_METHOD_POST,	handle_get_toggle_red,
		    &path_toggle_red,	   "ct=0"  },
    { COAP_METHOD_POST,	handle_get_toggle_green,
  		  &path_toggle_green,	   "ct=0"  },
    { COAP_METHOD_POST,	handle_get_seconds_led0_blink,
		    &path_led0_blink,	   "ct=0"  },
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


  	    int onOff = parse_payload( inpkt->payload.p, inpkt->payload.len );
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