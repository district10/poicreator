#!/bin/bash


echo "## Demos"  > index.md
echo ""         >> index.md
for i in $(ls html);
do
    echo "0. [$i](html/$i)" >> index.md; 
done

pandoc index.md -o index.html
# http-server
