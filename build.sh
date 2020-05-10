#!/usr/bin/env bash
NAME=compactmoon
VER=${1:-dev}
DIR=$2
if [[ $DIR == "theme" ]]
then
  FILE=$NAME-theme-$VER-pm.xpi
  if test -f "$FILE"
  then
    rm $FILE
  fi
  cd src/theme/
  zip -qr9XD ../../$FILE *
elif [[ $DIR == "options" ]]
then
  FILE=$NAME-options-$VER-pm.xpi
  if test -f "$FILE"
  then
    rm $FILE
  fi
  cd src/options/
  zip -qr9XD ../../$FILE *
else
  FILE=$NAME-$VER-pm.xpi
  if test -f "$FILE"
  then
    rm $FILE
  fi
  cd src/theme/
  zip -qr9XD ../theme.xpi *
  cd ../options/
  zip -qr9XD ../options.xpi *
  cd ../
  zip -qr9XD ../$FILE install.rdf theme.xpi options.xpi
  rm theme.xpi
  rm options.xpi
fi
