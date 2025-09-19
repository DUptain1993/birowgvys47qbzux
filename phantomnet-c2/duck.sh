#!/bin/bash
TOKEN="d6d0b3fa-a957-47c5-ba7f-f17e668990cb"
SUBDOMAINS="into-the-nothingnesssss.duckdns.org"
IP=$(curl -s https://api.ipify.org)
curl "https://www.duckdns.org/update?domains=$SUBDOMAINS&token=$TOKEN&ip=$IP"
