# @teqfw/http2

This package adds HTTP/2 server to Tequila Framework based projects. HTTP/2 server can replace HTTP/1 server from `web`-plugin and uses  it's DTOs:
* [local configuration](https://github.com/teqfw/web/blob/main/src/Back/Api/Dto/Config.mjs)
* [plugin descriptor](https://github.com/teqfw/web/blob/main/src/Back/Api/Dto/Plugin/Desc.mjs)


## Install

```shell
$ npm i @teqfw/http2 --save 
```


## Namespace

This plugin uses `TeqFw_Http2` namespace.


## CLI commands

These commands are in the `http2`-plugin:

```shell
$ node ./bin/tequila.mjs help
Usage: tequila [options] [command]
...
Commands:
  http2-server-start [options]  Start the HTTP/2 server.
  http2-server-stop             Stop the HTTP/2 server.
```
