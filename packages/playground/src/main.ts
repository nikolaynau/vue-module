import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { VueModule } from '@vuemodule/vue';
import {
  AppModule,
  RouterModule,
  PostRouterModule,
  PrintModule
} from '@vuemodule/builtin';

const app = createApp(App);

app.use(VueModule, {
  modules: [
    AppModule(app),
    RouterModule(router),
    PostRouterModule(),
    PrintModule(),
    () => import('./modules/counter'),
    () => import('./modules/idx')
  ]
});

app.mount('#app');
