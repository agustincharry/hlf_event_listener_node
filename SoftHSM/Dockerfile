FROM ubuntu:latest

RUN apt-get update && apt-get install softhsm2 openssl nano -y
RUN apt-get install libengine-pkcs11-openssl opensc opensc-pkcs11 -y

#RUN softhsm2-util --init-token --slot 0 --label "Token-1" --so-pin 1234 --pin 1234
#RUN export SLOT=$(softhsm2-util --show-slots | grep Slot | head -n 1 | cut -d ' ' -f 2)


COPY openssl.cnf .

#RUN pkcs11-tool --module /usr/lib/x86_64-linux-gnu/softhsm/libsofthsm2.so --pin 1234 -k --id 10 --label "10" --key-type EC:prime256v1
#RUN OPENSSL_CONF=openssl.cnf openssl req -engine pkcs11 -keyform engine -new -key $SLOT:10 -out serverClear.csr -subj "/C=US/ST=California/L=San Francisco/O=Org0/OU=client/OU=clear/CN=Clear@Org0"

#RUN chown -R 1000 /etc/softhsm && chown -R 1000 /var/lib/softhsm

