import { createApp, VueElement } from 'vue'
import hljs from 'highlight.js/lib/core';
import dart from 'highlight.js/lib/languages/dart';
import hljsVuePlugin from "@highlightjs/vue-plugin";

import App from './App.vue'


import 'bootstrap';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'highlight.js/styles/github.css';

hljs.registerLanguage('dart', dart);

const app = createApp(App);
app.use(hljsVuePlugin);

app.mount('#app');
