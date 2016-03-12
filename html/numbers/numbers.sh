#!/bin/bash

for i in {0..127};
do
    convert \
    -size 64x64 \
    xc:lightblue \
    -font Bookman-DemiItalic \
    -pointsize 24 \
    -fill blue \
    -gravity center \
    -draw "text 0,0 '$i'" \
    ${i}.png
done
