/**
 * Styles
 */
var styles = {
  //styles
  'bold' : ['\x1B[1m',  '\x1B[22m'],
  'italic' : ['\x1B[3m',  '\x1B[23m'],
  'underline' : ['\x1B[4m',  '\x1B[24m'],
  'inverse' : ['\x1B[7m',  '\x1B[27m'],
  'strikethrough' : ['\x1B[9m',  '\x1B[29m'],

  //text colors
  //grayscale
  'white' : ['\x1B[37m', '\x1B[39m'],
  'lightWhite' : ['\x1B[97m', '\x1B[39m'],
  'black' : ['\x1B[30m', '\x1B[39m'],
  'lightBlack' : ['\x1B[90m', '\x1B[39m'],
  //colors
  'blue' : ['\x1B[34m', '\x1B[39m'],
  'lightBlue' : ['\x1B[94m', '\x1B[39m'],
  'cyan' : ['\x1B[36m', '\x1B[39m'],
  'lightCyan' : ['\x1B[96m', '\x1B[39m'],
  'green' : ['\x1B[32m', '\x1B[39m'],
  'lightGreen' : ['\x1B[92m', '\x1B[39m'],
  'magenta' : ['\x1B[35m', '\x1B[39m'],
  'lightMagenta' : ['\x1B[95m', '\x1B[39m'],
  'red' : ['\x1B[31m', '\x1B[39m'],
  'lightRed' : ['\x1B[91m', '\x1B[39m'],
  'yellow' : ['\x1B[33m', '\x1B[39m'],
  'lightYellow' : ['\x1B[93m', '\x1B[39m'],

  //background colors
  //grayscale
  'whiteBG' : ['\x1B[47m', '\x1B[49m'],
  'lightWhiteBG' : ['\x1B[107m', '\x1B[49m'],
  'blackBG' : ['\x1B[40m', '\x1B[49m'],
  'lightBlackBG' : ['\x1B[100m', '\x1B[49m'],
  //colors
  'blueBG' : ['\x1B[44m', '\x1B[49m'],
  'lightBlueBG' : ['\x1B[104m', '\x1B[49m'],
  'cyanBG' : ['\x1B[46m', '\x1B[49m'],
  'lightCyanBG' : ['\x1B[106m', '\x1B[49m'],
  'greenBG' : ['\x1B[42m', '\x1B[49m'],
  'lightGreenBG' : ['\x1B[106m', '\x1B[49m'],
  'magentaBG' : ['\x1B[45m', '\x1B[49m'],
  'lightMagentaBG' : ['\x1B[105m', '\x1B[49m'],
  'redBG' : ['\x1B[41m', '\x1B[49m'],
  'lightRedBG' : ['\x1B[101m', '\x1B[49m'],
  'yellowBG' : ['\x1B[43m', '\x1B[49m'],
  'lightYellowBG' : ['\x1B[103m', '\x1B[49m'],
};
// gray / grey
styles.grey        = styles.gray        = styles.lightBlack;
styles.greyBG      = styles.grayBG      = styles.lightBlackBG;
styles.lightGrey   = styles.lightGray   = styles.white;
styles.lightGreyBG = styles.lightGrayBG = styles.whiteBG;


/**
 * Iterate through all default styles and colors
 */

Object.keys(styles).forEach(function(style){
  Object.defineProperty(String.prototype, style, {
    enumerable: false,
    configurable: true,
    get: function() {
      return styles[style][0] + this + styles[style][1];
    }
  });
});