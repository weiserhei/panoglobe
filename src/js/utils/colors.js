/* COLORS */
// https://krazydad.com/tutorials/makecolors.php

const byte2Hex = (n) => {
  var nybHexString = '0123456789ABCDEF';
  return String(nybHexString.substr((n >> 4) & 0x0F, 1)) + nybHexString.substr(n & 0x0F, 1);
};

const randomColorRoute = () => {
  var Rrand;
  var Grand;
  var Brand;

  do {
    Rrand = Math.random();
    Grand = Math.random();
    Brand = Math.random();
  } while ((Rrand + Brand + Grand) < 1.5); // ONLY ALLOW BRIGHT RANDOM COLORS
  // while((Rrand,Grand,Brand)<0.5); //ONLY PASTELL RANDOMS
};


const makeColorGradient = (i, redFrequency, grnFrequency, bluFrequency, phase1, phase2, phase3) => {
  var center = 128;
  var width = 127;

  if (redFrequency === undefined) redFrequency = 0.3;
  if (grnFrequency === undefined) grnFrequency = redFrequency;
  if (bluFrequency === undefined) bluFrequency = redFrequency;

  if (phase1 === undefined) phase1 = 0;
  if (phase2 === undefined) phase2 = phase1 + 2;
  if (phase3 === undefined) phase3 = phase1 + 4;

  const red = Math.sin(redFrequency * i + phase1) * width + center;
  const green = Math.sin(grnFrequency * i + phase2) * width + center;
  const blue = Math.sin(bluFrequency * i + phase3) * width + center;

  return Number('0x' + byte2Hex(red) + byte2Hex(green) + byte2Hex(blue));
};

const makeColorGradient2 = (i, redFrequency, grnFrequency, bluFrequency, phase1, phase2, phase3) => {
  var center = 250;
  var width = 255;

  if (redFrequency === undefined) redFrequency = 0.3;
  if (grnFrequency === undefined) grnFrequency = redFrequency;
  if (bluFrequency === undefined) bluFrequency = redFrequency;

  if (phase1 === undefined) phase1 = 0;
  if (phase2 === undefined) phase2 = phase1 + 2;
  if (phase3 === undefined) phase3 = phase1 + 4;

  const red = Math.sin(redFrequency * i + phase1) * width + center;
  const green = Math.sin(grnFrequency * i + phase2) * width + center;
  const blue = Math.sin(bluFrequency * i + phase3) * width + center;

  // return parseInt( '0x' + byte2Hex( red ) + byte2Hex( green ) + byte2Hex( blue ) );
  // return parseInt( '0x' + byte2Hex( red ) + byte2Hex( green ) + "00" );
  return Number('0x' + byte2Hex(red) + '0000');
};

export {
  makeColorGradient,
  makeColorGradient2,
  randomColorRoute,
};
