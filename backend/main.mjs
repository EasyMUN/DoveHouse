import Koa from 'koa';

import DBConnect from './db/conn'; // For side effect

const app = new Koa();

import { routes } from './routes';

const router = routes();
app.use(router.routes(), router.allowedMethods());

const PORT = process.env.PORT || 46350
const HOST = process.env.HOST || '127.0.0.1';

async function bootstrap() {
  await DBConnect();

  app.listen(PORT, HOST, () => {
    console.log(`Server up at ${HOST}:${PORT}`);
  });
}

bootstrap().catch(e => {
  console.error(e);
  process.exit(1);
});
