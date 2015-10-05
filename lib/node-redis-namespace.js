/* undef=true */
var redis = require('redis');

var NO_KEY = -1,//no argument to a function is a key
    FIRST_KEY = 0,//the first argument to a function is a key
    LAST_KEY = 1,//the last argument to a function is a key
    NOT_FIRST_KEY = 2,//everything but the first argument to a function is a key
    NOT_LAST_KEY = 3,//everything but the last argument to a function is a key
    ALL_KEYS = 4;//every argument to a function is a key

var COMMANDS = {
  "append" : FIRST_KEY,
  "auth" : NO_KEY,
  "bgrewriteaof" : NO_KEY,
  "bgsave" : NO_KEY,
  "bitcount" : FIRST_KEY,
  "bitop" : ALL_KEYS,
  "bitpos" : FIRST_KEY,
  "blpop" : NOT_LAST_KEY,
  "brpop" : NOT_LAST_KEY,
  "brpoplpush" : NOT_LAST_KEY,
  "config get" : NO_KEY,
  "config set" : NO_KEY,
  "config resetstat" : NO_KEY,
  "dbsize" : NO_KEY,
  "debug object" : FIRST_KEY,
  "debug segfault" : NO_KEY,
  "decr" : FIRST_KEY,
  "decrby" : FIRST_KEY,
  "del" : ALL_KEYS,
  "discard" : NO_KEY,
  "dump" : FIRST_KEY,
  "echo" : NO_KEY,
  "exec" : NO_KEY,
  "exists" : ALL_KEYS,
  "expire" : FIRST_KEY,
  "expireat" : FIRST_KEY,
  "flushall" : NO_KEY,
  "flushdb" : NO_KEY,
  "get" : FIRST_KEY,
  "getbit" : FIRST_KEY,
  "getrange" : FIRST_KEY,
  "getset" : FIRST_KEY,
  "hdel" : FIRST_KEY,
  "hexists" : FIRST_KEY,
  "hget" : FIRST_KEY,
  "hgetall" : FIRST_KEY,
  "hincrby" : FIRST_KEY,
  "hkeys" : FIRST_KEY,
  "hlen" : FIRST_KEY,
  "hmget" : FIRST_KEY,
  "hmset" : FIRST_KEY,
  "hset" : FIRST_KEY,
  "hsetnx" : FIRST_KEY,
  "hvals" : FIRST_KEY,
  "incr" : FIRST_KEY,
  "incrby" : FIRST_KEY,
  "incrbyfloat" : FIRST_KEY,
  "info" : NO_KEY,
  "keys" : FIRST_KEY,
  "lastsave" : NO_KEY,
  "lindex" : FIRST_KEY,
  "linsert" : FIRST_KEY,
  "llen" : FIRST_KEY,
  "lpop" : FIRST_KEY,
  "lpush" : FIRST_KEY,
  "lpushx" : FIRST_KEY,
  "lrange" : FIRST_KEY,
  "lrem" : FIRST_KEY,
  "lset" : FIRST_KEY,
  "ltrim" : FIRST_KEY,
  "mget" : ALL_KEYS,
  "monitor" : NO_KEY,
  "move" : FIRST_KEY,
  "multi" : NO_KEY,
  "object" : NO_KEY,
  "persist" : FIRST_KEY,
  "ping" : NO_KEY,
  "psubscribe" : NO_KEY,
  "publish" : NO_KEY,
  "pubsub" : NO_KEY,
  "punsubscribe" : NO_KEY,
  "quit" : NO_KEY,
  "randomkey" : NO_KEY,
  "rename" : ALL_KEYS,
  "renamenx" : ALL_KEYS,
  "rpop" : FIRST_KEY,
  "rpoplpush" : ALL_KEYS,
  "rpush" : FIRST_KEY,
  "rpushx" : FIRST_KEY,
  "sadd" : FIRST_KEY,
  "save" : NO_KEY,
  "scard" : FIRST_KEY,
  "sdiff": ALL_KEYS,
  "sdiffstore" : ALL_KEYS,
  "select" : NO_KEY,
  "set" : FIRST_KEY,
  "setbit" : FIRST_KEY,
  "setex" : FIRST_KEY,
  "setnx" : FIRST_KEY,
  "setrange" : FIRST_KEY,
  "shutdown" : NO_KEY,
  "sinter" : ALL_KEYS,
  "sinterstore" : ALL_KEYS,
  "sismember" : FIRST_KEY,
  "slaveof" : NO_KEY,
  "smembers" : FIRST_KEY,
  "smove" : NOT_LAST_KEY,
  "sort" : FIRST_KEY,
  "spop" : FIRST_KEY,
  "srandmember" : FIRST_KEY,
  "srem" : FIRST_KEY,
  "strlen" : FIRST_KEY,
  "subscribe" : NO_KEY,
  "sunion" : ALL_KEYS,
  "sunionstore" : ALL_KEYS,
  "sync" : NO_KEY,
  "ttl" : FIRST_KEY,
  "type" : FIRST_KEY,
  "unsubscribe" : NO_KEY,
  "unwatch" : NO_KEY,
  "watch" : ALL_KEYS,
  "zadd" : FIRST_KEY,
  "zcard" : FIRST_KEY,
  "zcount" : FIRST_KEY,
  "zincrby" : FIRST_KEY,
  "zrange" : FIRST_KEY,
  "zrangebyscore" : FIRST_KEY,
  "zrank" : FIRST_KEY,
  "zrem" : FIRST_KEY,
  "zremrangebylex" : FIRST_KEY,
  "zremrangebyrank" : FIRST_KEY,
  "zremrangebyscore" : FIRST_KEY,
  "zrevrange" : FIRST_KEY,
  "zrevrangebyscore" : FIRST_KEY,
  "zrevrank" : FIRST_KEY,
  "zscore" : FIRST_KEY,
};

var RedisNamespaceClient = function (key_prefix, redis) {
  var generate_key = function(key) {
    return key_prefix + ":" + key;
  };

  this.on = function (evt, callback) {
    redis.on(evt, callback);
  };

  Object.keys(COMMANDS).forEach(function (method) {
    RedisNamespaceClient.prototype[method] = function () {
      return function () {
        var args = arguments;
        var argslength = args.length;
        if (typeof args[argslength-1] == 'function'){
            argslength -= 1;
        }
        if(COMMANDS[method] == FIRST_KEY) {
          args[0] = generate_key(args[0]);
        }
        else if(COMMANDS[method] == LAST_KEY) {
          args[argslength - 1] = generate_key(args[argslength - 1]);
        }
        //3: everything but the last element is a key
        //4: everything is a key
        else if(COMMANDS[method] ==  ALL_KEYS || COMMANDS[method] == NOT_FIRST_KEY || COMMANDS[method] == NOT_LAST_KEY) {
          var loop_start = 0;
          var loop_end = argslength;
          if(COMMANDS[method] == NOT_FIRST_KEY) {
            loop_start++;
          }
          else if(COMMANDS[method] == NOT_LAST_KEY) {
            loop_end--;
          }

          for(var i = loop_start; i < loop_end; i++) {
            args[i] = generate_key(args[i]);
          }
        }
        return redis[method].apply(redis, args);
      };
    }();
  });
};

exports.createClient = function (prefix, port, host, opts) {
  return new RedisNamespaceClient(prefix, redis.createClient(port, host, opts));
};
