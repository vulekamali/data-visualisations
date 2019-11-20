require('weakmap-polyfill');
import 'es6-shim'
import 'es5-shim';
import "core-js";
import "core-js/stable";
import "core-js/es/set";
import "core-js/es/weak-map";
import "core-js/es/map";
import "regenerator-runtime/runtime";

import { configure } from '@storybook/html';

configure(require.context('../src', true, /\.stories\.js$/), module);
