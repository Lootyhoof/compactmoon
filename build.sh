#!/bin/bash
NAME=compactmoon
VER=${1:-dev}
DIR=$2
rm $NAME-$VER-pm.xpi
cd src/
if [[ $DIR == "theme" ]]
then
  cd theme/
  zip -qr9XD ../../$NAME-theme-$VER-pm.xpi *
elif [[ $DIR == "options" ]]
then
  cd options/
  zip -qr9XD ../../$NAME-options-$VER-pm.xpi *
else
  cd theme/
  zip -qr9XD ../theme.xpi *
  cd ../options/
  zip -qr9XD ../options.xpi *
  cd ../
  zip -qr9XD ../$NAME-$VER-pm.xpi install.rdf theme.xpi options.xpi
  rm theme.xpi
  rm options.xpi
fi
