FROM debian:jessie

MAINTAINER michaelatdocker <michael.kunzmann@gmail.com>
# Edited by Tino Herrmann for Sensornetz-Demo on HTW Dresden

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update
RUN apt-get -y --force-yes install wget apt-transport-https

# Install perl packages for FHEM
RUN apt-get -y --force-yes install libalgorithm-merge-perl \
		libclass-isa-perl \
		libcommon-sense-perl \
		libdpkg-perl \
		liberror-perl \
		libfile-copy-recursive-perl \
		libfile-fcntllock-perl \
		libio-socket-ip-perl \
		libio-socket-multicast-perl \
		libjson-perl \
		libjson-xs-perl \
		libmail-sendmail-perl \
		libsocket-perl \
		libswitch-perl \
		libsys-hostname-long-perl \
		libterm-readkey-perl \
		libterm-readline-perl-perl \
		libxml-simple-perl \
		libcrypt-pbkdf2-perl \
		libcpan-meta-yaml-perl \
		build-essential

# Install oracle java 8 packages for our custom CoAP-WrapperClient
RUN \
    echo "===> add webupd8 repository..."  && \
    echo "deb http://ppa.launchpad.net/webupd8team/java/ubuntu trusty main" | tee /etc/apt/sources.list.d/webupd8team-java.list  && \
    echo "deb-src http://ppa.launchpad.net/webupd8team/java/ubuntu trusty main" | tee -a /etc/apt/sources.list.d/webupd8team-java.list  && \
    apt-key adv --keyserver keyserver.ubuntu.com --recv-keys EEA14886  && \
    apt-get update  && \
    \
    \
    echo "===> install Java"  && \
    echo debconf shared/accepted-oracle-license-v1-1 select true | debconf-set-selections  && \
    echo debconf shared/accepted-oracle-license-v1-1 seen true | debconf-set-selections  && \
    DEBIAN_FRONTEND=noninteractive  apt-get install -y --force-yes oracle-java8-installer oracle-java8-set-default  && \
    \
    \
    echo "===> clean up..."  && \
    rm -rf /var/cache/oracle-jdk8-installer  && \
    apt-get clean  && \
    rm -rf /var/lib/apt/lists/*

# Define default command
CMD ["java"]

# Install MQTT
RUN cpan install Net::MQTT:Simple

# Install FHEM
RUN wget -qO - https://debian.fhem.de/archive.key | apt-key add -
RUN echo "deb https://debian.fhem.de/nightly/ /" | tee -a /etc/apt/sources.list.d/fhem.list
RUN apt-get update
RUN apt-get -y --force-yes install supervisor fhem telnet
RUN mkdir -p /var/log/supervisor

# Set german time
RUN echo Europe/Berlin > /etc/timezone && dpkg-reconfigure tzdata

# Copy custom supervisord configuration for easier command handling
COPY ./config/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy our custom fhem configuration
COPY ./config/fhem.cfg /opt/fhem

# Copy our custom fhem moduls for connection with CoAP-WrapperClient
COPY ./fhem-moduls /opt/fhem/FHEM

# Copy our custom CoAP-WrapperClient, which handles the coap communication
COPY ./coap-wrapper-client /opt/coap-wrapper-client

# Define a mount point for fhem and coap-wrapperclient directory
VOLUME ["/opt/fhem"]
VOLUME ["/opt/coap-wrapper-client"]

# listen on port 8083 for default webfrontend of fhem
EXPOSE 8083

# listen on port 8088 for our custom webfrontend of fhem for frontend-service
EXPOSE 8088

# Start supervisord
CMD ["/usr/bin/supervisord"]
