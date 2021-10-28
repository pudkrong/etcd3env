const { Etcd3 } = require('etcd3');
class Etcd3Env {
  constructor (options) {
    this.options = Object.assign({
      etcd: {
        hosts: 'http://localhost:2379',
      },
      prefix: '/config'
    }, options);
    if (!/\/$/.test(this.options.prefix)) this.options.prefix += '/';

    this.client = new Etcd3(this.options.etcd);
    this.keys = new Map();
  }

  async watch (prefix, handler) {
    const client = this.client.namespace(`${this.options.prefix}`);
    const watcher = await client
      .watch()
      .prefix(`${prefix}/`)
      .withPreviousKV()
      .create();

    watcher
      .on('data', async (res) => {
        for (let event of res.events) {
          let prev = null;
          if (event.prev_kv) {
            prev = {
              key: event.prev_kv.key.toString(),
              value: event.prev_kv.value.toString()
            };
          }

          await handler(
            event.type,
            {
              key: event.kv.key.toString(),
              value: event.kv.value.toString()
            },
            prev
          ).catch(() => {});
        }
      });
  }

  async export (prefix) {
    const client = this.client.namespace(`${this.options.prefix}${prefix}/`);
    const [includes, result] = await Promise.all([
      client.get('.include').string(),
      client.getAll().strings()
    ]);

    // Load include first, then it will be overwritten later
    await this._parse(includes);

    for (let key in result) {
      if (key !== '.include') this.keys.set(key, result[key]);
    }

    let str = '';
    this.keys.forEach((v, k) => {
      str += `${k}=${v}\n`;
    });

    return str;
  }

  async _parse (includes) {
    if (includes) {
      const regex = /([^,\s]+)/g;
      let m;
      do {
        m = regex.exec(includes);
        if (m) {
          const client = this.client.namespace(`${this.options.prefix}${m[1].replace(/\//g, '')}/`);
          const result = await client.getAll().strings();
          for (let key in result) {
            this.keys.set(key, result[key]);
          }
        }
      } while (m);
    }
  }
}

module.exports = Etcd3Env;