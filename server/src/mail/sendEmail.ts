import * as https from 'https';
import * as FormData from 'form-data';
import { logger } from '../logger';

export function sendEmail(form: FormData): Promise<any> {
  const request = https.request({
    host: 'api.mailgun.net',
    path: `/v3/${process.env.MAILGUN_API_DOMAIN}/messages`,
    auth: `api:${process.env.MAILGUN_API_KEY}`,
    headers: form.getHeaders(),
    method: 'POST',
  });
  form.pipe(request);
  return new Promise<any>((resolve, reject) => {
    request.on('response', r => {
      if (r.statusCode !== 200) {
        r.on('data', (d: any) => {
          logger.error(r.statusCode, JSON.parse(d).message);
        });
        reject({ error: 'send-error' });
      } else {
        resolve();
      }
    });
  });
}
