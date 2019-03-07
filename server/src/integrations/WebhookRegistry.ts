import { WebhookService } from './WebhookService';

export class WebHookRegistry {
  public services = new Map<string, WebhookService>();

  public add(svc: WebhookService) {
    this.services.set(svc.serviceId, svc);
  }
}

export const registry = new WebHookRegistry();
