import * as FormData from 'form-data';
import * as qs from 'qs';
import { URL } from 'url';
import { sendEmail } from './sendEmail';
import { AccountRecord } from '../db/types';

export function sendResetPassword(account: AccountRecord): Promise<any> {
  const email = process.env.OVERRIDE_EMAIL_ADDR || account.email;
  const resetUrl = new URL(process.env.PUBLIC_URL);
  resetUrl.pathname = '/account/reset';
  resetUrl.search = qs.stringify({
    email: account.email,
    token: account.verificationToken,
  }, { addQueryPrefix: true });

  // Text body
  const textBody = `
    Password reset for: ${account.display || account.email}.

    There was recently a request to change the password for your account.
    Use this link to set a new password: ${resetUrl.toString()}
    If you did not make this request, you can ignore this message and your password will
    remain the same.
  `;

  const htmlBody = `
<section>
  <p>Password reset for: ${account.display || account.email}.</p>
  <p>There was recently a request to change the password for your account.</p>
  <a href="${resetUrl.toString()}">Click here to set a new password.</a>
  <p>If you did not make this request, you can ignore this message and your password will
  remain the same.</p>
</section>
  `;

  // HTML email
  const form = new FormData();
  form.append('from', 'Klendathu <noreply@mail.klendathu.io>');
  form.append('to', email);
  form.append('subject', 'Klendathu Password Reset');
  form.append('text', textBody);
  form.append('html', htmlBody);
  return sendEmail(form);
}
