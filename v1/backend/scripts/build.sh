#!/bin/bash

rm ./mipmapper.zip
mkdir dist;
cd dist;
ln -s ../src/* .
ln -s ../node_modules .
zip -r ../mipmapper.zip ./*
