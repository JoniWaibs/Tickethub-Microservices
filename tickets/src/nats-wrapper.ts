import nats, { Stan } from 'node-nats-streaming';

class NatsWrapper {
  private _client?: Stan;

  get client() {
    if (!this._client) {
      throw new Error('Cannot access NATS client before connecting');
    }
    return this._client;
  }

  connect(clusterName: string, clientId: string, url: string) {
    this._client = nats.connect(clusterName, clientId, { url });
    return new Promise<void>((resolve, reject) => {
      this._client!.on('connect', () => {
        console.log('Listener connected to NATS');
        resolve();
      });
      this._client!.on('error', err => {
        reject(err);
      });
    });
  }
}

export const natsWrapper = new NatsWrapper();
