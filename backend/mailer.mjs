import nodemailer from 'nodemailer';
import juice from 'juice';
import handlebars from 'handlebars';

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import Config from './config';

import BASEDIR from './basedir';

const readFile = promisify(fs.readFile);

const cache = new Map();

const transport = nodemailer.createTransport(Config.mailer, {
  from: Config.mailer.from,
});

export async function send(rcpt, title, tmpl, data) {
  let tmplFunc = cache.get(tmpl);
  if(!tmplFunc) {
    const cont = await readFile(path.join(BASEDIR, 'mail', `${tmpl}.html`), 'utf-8');
    const juiced = juice(cont);
    tmplFunc = handlebars.compile(juiced);
    cache.set(tmpl, tmplFunc);
  }

  const injected = tmplFunc(data);

  const mail = {
    to: rcpt,
    subject: title,
    html: injected,
    text: injected,
  };

  const resp = await transport.sendMail(mail);

  console.log(resp);
}

export default {
  send,
};
