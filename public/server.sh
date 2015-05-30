#!/bin/bash

echo "## Demos"  > index.md
echo ""         >> index.md
for i in html/*.html;
do
    echo "0. [$i]($i)" >> index.md; 
done

pandoc index.md -o index.html
# http-server
