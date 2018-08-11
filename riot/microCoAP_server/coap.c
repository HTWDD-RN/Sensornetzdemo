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

#include "include/myCoAP.h"
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
    { COAP_METHOD_POST, handle_post_led_animation,
        &path_led_animation, "ct=0;rt=animation"  },
    { COAP_METHOD_POST, handle_post_led_fft,
        &path_led_fft, "ct=0;rt=fft"  },
    /* marks the end of the endpoints array: */
    { (coap_method_t)0, NULL, NULL, NULL }
};


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


static int handle_post_led_animation(coap_rw_buffer_t *scratch,
    const coap_packet_t *inpkt, coap_packet_t *outpkt,
    uint8_t id_hi, uint8_t id_lo)
{
  // red by default to indicate parsing error visually
  int type = SET_COLOR, parameter = 0xff0000;
  const char *input = (const char*)inpkt->payload.p;

  char buffer[10];
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
  // red by default to indicate parsing error visually
  int type = SET_COLOR, parameter = 0xff0000;

  char *input = "";

  input = (char*)inpkt->payload.p; 

  char buffer[10]; // hex-code color + type

  if (extract_payload(input, buffer)) {
    printf("Parsed my payload: %s\n", buffer);

    char *action_type;
    char *andToken;
    action_type = strtok_r(buffer, "&", &andToken);

    type = strtol(action_type, NULL, 10);

    parameter = strtol(andToken, NULL, 16);

    message_content *msg_content = malloc(sizeof(message_content));
    msg_content->action = type;
    msg_content->parameter = parameter;
    msg_t msg;
    msg.content.value = (int)msg_content;
    msg_send(&msg, animation_pid);

  }else {
      printf("WARN: Couldn't extract payload (nothing for me?!) [buffer: %s]\n", input);
    return -1;
  }

  memcpy(response, "TODO", 4);

  return coap_make_response(scratch, outpkt, (const uint8_t *)response, 1,
                            id_hi, id_lo, &inpkt->tok, COAP_RSPCODE_CONTENT,
                            COAP_CONTENTTYPE_TEXT_PLAIN);
}