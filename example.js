const Etcd3Env = require('./lib');

async function main () {
  const etcd3env = new Etcd3Env({
    prefix: '/config'
  });

  etcd3env.watch('main', async () => {
    const result = await etcd3env.export('main');
    console.log(result);
  });

  return etcd3env.export('main');
}

main().then(console.log).catch(console.error);