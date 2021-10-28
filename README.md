# etcd3env
This project is inspried by [etcenv](https://github.com/sorah/etcenv). I borrow many ideas from this tool and implement using nodejs.

## Usage
In the main section, you can include key-pair values from other section using `.include`. Also, you can include many sections as well.

If the key is duplicated, the key will be overwritten from right to left

```
include1 < include2 < mainsection
```

You also can watch the changes and handle the changes by yourself.

## How to run
### Docker
You can setup etcd3 server using the below command
```
docker run -d --rm --name etcd -p 2379:2379 -p 2380:2380 -e ALLOW_NONE_AUTHENTICATION=yes bitnami/etcd:latest
```

### Set up some data to test
You can use any tools you like to manage the data inside etcd. However, I will use `etcdctl` command since it is bundled with etcd3 server

```
$ docker exec -it etcd bash
> etcdctl put /config/main/key1 value1
> etcdctl put /config/main/key2 value2
> etcdctl put /config/main/global1 main_value
> etcdctl put /config/main/.include common,section1

> etcdctl put /config/common/global1 gvalue1
> etcdctl put /config/common/global2 gvalue2
> etcdctl put /config/common/global3 gvalue3

> etcdctl put /config/section1/sec1 sec_value2
> etcdctl put /config/section1/global2 sec1_value
```

### Example
You can run the exmaple by

```
$ node example.js
```

You should see the below output on your screen.

```
$ node example.js

global1=main_value
global2=sec1_value
global3=gvalue3
sec1=sec_value2
key1=value1
key2=value2
```

Try to insert new key under main section
```
> etcdctl put /config/main/test test
```
