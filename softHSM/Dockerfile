FROM ubuntu:latest

RUN apt-get update && apt-get install softhsm2 openssl nano -y
RUN apt-get install libengine-pkcs11-openssl opensc opensc-pkcs11 -y

COPY openssl.cnf .
COPY entrypoint.sh .

RUN chmod +x entrypoint.sh

ENV KEY_ID=10

ENTRYPOINT ["/bin/sh", "-c"]
CMD ["./entrypoint.sh"]