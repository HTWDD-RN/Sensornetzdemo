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

#include "include/helpers.h"
#include "include/microCoAPServer.h"
#include "include/light_ws2812_examples_arm.h"

#define MAX_RESPONSE_LEN 500

//#define MAXPIX 6
//#define COLORLENGTH (MAXPIX/2)
//#define FADE (8/COLORLENGTH)
//struct cRGB colors[8];
//struct cRGB led[MAXPIX];

static uint8_t response[MAX_RESPONSE_LEN] = {0};

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
                                 uint8_t id_hi, uint8_t id_lo); //pin PB02

static int handle_get_toggle_green(coap_rw_buffer_t *scratch,
                                   const coap_packet_t *inpkt,
                                   coap_packet_t *outpkt,
                                   uint8_t id_hi, uint8_t id_lo); // pin PA14

static int handle_post_led_strip(coap_rw_buffer_t *scratch,
                                 const coap_packet_t *inpkt,
                                 coap_packet_t *outpkt,
                                 uint8_t id_hi, uint8_t id_lo); // pin PA14

static const coap_endpoint_path_t path_well_known_core =
    {2, {".well-known", "core"}};

static const coap_endpoint_path_t path_riot_board =
    {2, {"riot", "board"}};

static const coap_endpoint_path_t path_toggle_red =
    {2, {"LED", "red"}};

static const coap_endpoint_path_t path_toggle_green =
    {2, {"LED", "green"}};

static const coap_endpoint_path_t path_led0_blink =
    {2, {"htw", "led0"}};

static const coap_endpoint_path_t path_led_strip =
    {2, {"LED", "strip"}};

const coap_endpoint_t endpoints[] =
    {
        // GET /.well-known/core
        {COAP_METHOD_GET, handle_get_well_known_core, &path_well_known_core, "ct=40"},
        // GET /riot/board
        {COAP_METHOD_GET, handle_get_riot_board, &path_riot_board, "ct=0"},
        // POST /LED/red
        {COAP_METHOD_POST, handle_get_toggle_red, &path_toggle_red, "ct=0"},
        // POST /LED/green
        {COAP_METHOD_POST, handle_get_toggle_green, &path_toggle_green, "ct=0"},
        // POST /htw/led0
        {COAP_METHOD_POST, handle_get_seconds_led0_blink, &path_led0_blink, "ct=0"},
        // POST /LED/strip
        {COAP_METHOD_POST, handle_post_led_strip, &path_led_strip, "ct=0"},
        {(coap_method_t)0, NULL, NULL, NULL}};

static int toggle_LED(gpio_t pin,
                     coap_rw_buffer_t *scratch,
                     const coap_packet_t *inpkt,
                     coap_packet_t *outpkt,
                     uint8_t id_hi,
                     uint8_t id_lo)
{
    char buffer[50];
    if (extract_payload((char *)inpkt->payload.p, buffer) <= 0) return -1;

    int onOff = strtol(buffer, NULL, 10);

    onOff == 0 ? clear(pin) : set(pin);

    char str[1];
    sprintf(str, "%d", onOff);
    int len = sizeof(str);
    memcpy(response, str, len);
    return coap_make_response(scratch, outpkt, (const uint8_t *)response, len,
                              id_hi, id_lo, &inpkt->tok, COAP_RSPCODE_CONTENT,
                              COAP_CONTENTTYPE_TEXT_PLAIN);
}

static int handle_get_toggle_red(coap_rw_buffer_t *scratch,
                                 const coap_packet_t *inpkt, coap_packet_t *outpkt,
                                 uint8_t id_hi, uint8_t id_lo) {
    return toggle_LED(PIN_LED_RED, scratch, inpkt, outpkt, id_hi, id_lo);
}

static int handle_get_toggle_green(coap_rw_buffer_t *scratch,
                                   const coap_packet_t *inpkt, coap_packet_t *outpkt,
                                   uint8_t id_hi, uint8_t id_lo) {

    return toggle_LED(PIN_LED_GREEN, scratch, inpkt, outpkt, id_hi, id_lo);
}

static int handle_post_led_strip(coap_rw_buffer_t *scratch,
                                 const coap_packet_t *inpkt, coap_packet_t *outpkt,
                                 uint8_t id_hi, uint8_t id_lo)
{
    // red by default to indicate parsing error visually
    int rgb = 0xff0000;

    char buffer[1024];
    if (extract_payload((char *)inpkt->payload.p, buffer) > 0) {
        rgb = parse_payload_rgb(buffer);
    } else {
        return -1;
    }

    set_simple_color(rgb);

    //moving_light(rgb, 500000);

    //hsv_crawling_lights(100);

    char str[8]; // maximum is 0xffffff -> 16777215
    sprintf(str, "%d", rgb);
    memcpy(response, str, strlen(str));

    return coap_make_response(scratch, outpkt, (const uint8_t *)response, 1,
                              id_hi, id_lo, &inpkt->tok, COAP_RSPCODE_CONTENT,
                              COAP_CONTENTTYPE_TEXT_PLAIN);
}

static int handle_get_seconds_led0_blink(coap_rw_buffer_t *scratch,
                                         const coap_packet_t *inpkt, coap_packet_t *outpkt,
                                         uint8_t id_hi, uint8_t id_lo)
{
    char buffer[50];
    if (extract_payload((char *)inpkt->payload.p, buffer) <= 0) return -1;

    int times = strtol(buffer, NULL, 10);

    char str[80];
    sprintf(str, "Blinked %d times", times);
    puts(str);
    int len = sizeof(str);
    memcpy(response, str, len);

    led0_blink(LED0_PIN, times);
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

    while (NULL != ep->handler)
    {
        if (NULL == ep->core_attr)
        {
            ep++;
            continue;
        }

        if (0 < strlen(rsp))
        {
            strncat(rsp, ",", len);
            len--;
        }

        strncat(rsp, "<", len);
        len--;

        for (i = 0; i < ep->path->count; i++)
        {
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
