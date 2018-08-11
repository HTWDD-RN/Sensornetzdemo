#!/bin/bash

if [ ! -z $1 ]
then 
echo "COMMONNAME = "$1""
else 
echo ""$'\n'"No "$'\033[1m'"common-name"$'\033[0m'" has been specified "\$1"; "$0" "$'\033[1m'"localhost"$'\033[0m'""$'\n'""
exit -1;
fi

PASSWORD = "!a_P&p?l#E"

# generate ca
openssl req -new -x509 -newkey rsa:2048 -keyout cakey.pem -out cacert.pem -days 3650 -passout pass:"'$PASSWORD'" -subj '/C=DE/L=Dresden/O=HTW/CN=FS'

# only with root permission for reading
chmod 600 cakey.pem

# echo key with defined password
openssl rsa -in cakey.pem -noout -text -passin pass:"'$PASSWORD'"

# generate key for server certificate
openssl genrsa -out serverkey.pem -passout pass:"jaja" -aes128 2048 -days 3650 

# remove password
openssl rsa -in serverkey.pem -passin pass:"jaja" -out serverkey.pem 

# generate certificate signing request
openssl req -new -key serverkey.pem -out req.pem -nodes -subj '/C=DE/L=Dresden/O=HTW/CN='$1''

# generate files
echo 01 > serial
touch index.txt

# sign server certifiacte, passwd: 'passwd'
openssl ca -in req.pem -notext -out servercert.pem -passin pass:"'$PASSWORD'"
