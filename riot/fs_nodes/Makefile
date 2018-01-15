APPLICATION = fs_nodes

# hardcode the board - will not change so fast
BOARD = samr21-xpro

RIOTBASE ?= $(CURDIR)/../..

# Include packages that pull up and auto-init the link layer.
USEMODULE += gnrc_netdev_default
USEMODULE += auto_init_gnrc_netif
USEMODULE += gnrc_ipv6_router_default
USEMODULE += gnrc_udp
USEMODULE += gnrc_rpl
USEMODULE += gnrc_sock_udp

USEPKG += microcoap

USEMODULE += shell_commands

# Comment this out to disable code in RIOT that does safety checking
# which is not needed in a production environment but helps in the
# development process:
CFLAGS += -DDEVELHELP -O3

# Change this to 0 show compiler invocation lines by default:
QUIET ?= 1

WERROR = 0

include $(RIOTBASE)/Makefile.include

# Set a custom channel if needed
# ifneq (,$(filter cc110x,$(USEMODULE)))          # radio is cc110x sub-GHz
#   DEFAULT_CHANNEL ?= 0
#   CFLAGS += -DCC110X_DEFAULT_CHANNEL=$(DEFAULT_CHANNEL)
# else
#   ifneq (,$(filter at86rf212b,$(USEMODULE)))    # radio is IEEE 802.15.4 sub-GHz
#     DEFAULT_CHANNEL ?= 5
#     CFLAGS += -DIEEE802154_DEFAULT_SUBGHZ_CHANNEL=$(DEFAULT_CHANNEL)
#   else                                          # radio is IEEE 802.15.4 2.4 GHz
#     DEFAULT_CHANNEL ?= 26
#     CFLAGS += -DIEEE802154_DEFAULT_CHANNEL=$(DEFAULT_CHANNEL)
#   endif
# endif
