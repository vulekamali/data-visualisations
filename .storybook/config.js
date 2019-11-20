require('weakmap-polyfill');
import 'es6-shim'
import 'es5-shim';
import "core-js";
import "core-js/stable";
import 'core-js/es6/symbol';
import 'core-js/es6/object';
import 'core-js/es6/function';
import 'core-js/es6/parse-int';
import 'core-js/es6/parse-float';
import 'core-js/es6/number';
import 'core-js/es6/math';
import 'core-js/es6/string';
import 'core-js/es6/date';
import 'core-js/es6/array';
import 'core-js/es6/regexp';
import 'core-js/es6/map';
import 'core-js/es6/weak-map';
import 'core-js/es6/set';
import 'core-js/es7/array';
import 'core-js/es6/reflect';
import 'core-js/es7/reflect';
import "regenerator-runtime/runtime";
import 'classlist.js';
import 'web-animations-js';

import { configure } from '@storybook/html';

configure(require.context('../src', true, /\.stories\.js$/), module);
