Tinytest.addAsync(
'Client - DDPProvider - incoming - ready message', 
function(test, done) {
  var stub = StartStubbing(StoreManager, 'trackEvent');
  var message = {msg: 'ready', subs: ["1", "2"]};
  var caller = DDPProvider._livedata_data(function(msg) {
    test.equal(msg, message);
    test.equal(stub.args[0], ['ddp-ready', {subs: message.subs}]);
    test.equal(stub.callCount, 1);
    stub.stop();
    done();
  });

  caller(message);
});

Tinytest.addAsync(
'Client - DDPProvider - incoming - added messages - tracked with other message', 
function(test, done) {
  var stub = StartStubbing(StoreManager, 'trackEvent');
  var caller = DDPProvider._livedata_data(function() {});

  caller({msg: 'added', collection: 'coll1'});
  caller({msg: 'added', collection: 'coll1'});
  caller({msg: 'some-other'});
  test.equal(stub.args[0][0], 'live-updates');
  test.equal(_.pick(stub.args[0][1], 'collection', 'count', 'type'), {
    collection: 'coll1',
    type: 'added',
    count: 2
  });
  test.equal(stub.callCount, 1);
  stub.stop();
  done();
});

Tinytest.addAsync(
'Client - DDPProvider - incoming - added messages - tracked with diff type', 
function(test, done) {
  var stub = StartStubbing(StoreManager, 'trackEvent');
  var caller = DDPProvider._livedata_data(function() {});

  caller({msg: 'added', collection: 'coll1'});
  caller({msg: 'added', collection: 'coll1'});
  caller({msg: 'changed', collection: 'coll1'});
  test.equal(stub.args[0][0], 'live-updates');
  test.equal(_.pick(stub.args[0][1], 'collection', 'count', 'type'), {
    collection: 'coll1',
    type: 'added',
    count: 2
  });
  test.equal(stub.callCount, 1);
  stub.stop();
  done();
});

Tinytest.addAsync(
'Client - DDPProvider - incoming - added messages - tracked with diff coll', 
function(test, done) {
  var stub = StartStubbing(StoreManager, 'trackEvent');
  var caller = DDPProvider._livedata_data(function() {});

  caller({msg: 'added', collection: 'coll1'});
  caller({msg: 'added', collection: 'coll1'});
  caller({msg: 'added', collection: 'coll2'});
  test.equal(stub.args[0][0], 'live-updates');
  test.equal(_.pick(stub.args[0][1], 'collection', 'count', 'type'), {
    collection: 'coll1',
    type: 'added',
    count: 2
  });
  test.equal(stub.callCount, 1);
  stub.stop();
  done();
});

Tinytest.addAsync(
'Client - DDPProvider - incoming - added messages - tracked with beforePush', 
function(test, done) {
  var stub = StartStubbing(StoreManager, 'trackEvent');
  var stub2 = StartStubbing(StoreManager, 'beforePush');
  var caller = DDPProvider._livedata_data(function() {});

  caller({msg: 'added', collection: 'coll1'});
  caller({msg: 'added', collection: 'coll1'});
  stub2.args[0][0]();

  test.equal(stub.args[0][0], 'live-updates');
  test.equal(_.pick(stub.args[0][1], 'collection', 'count', 'type'), {
    collection: 'coll1',
    type: 'added',
    count: 2
  });
  test.equal(stub.callCount, 1);
  stub.stop();
  stub2.stop();
  done();
});

Tinytest.addAsync(
'Client - DDPProvider - incoming - nosub message', 
function(test, done) {
  var stub = StartStubbing(StoreManager, 'trackEvent');
  var message = {msg: 'nosub', id: "1", error: "the-error"};
  var caller = DDPProvider._livedata_data(function(msg) {
    test.equal(msg, message);
    test.equal(stub.args[0], ['ddp-nosub', _.omit(message, 'msg')]);
    test.equal(stub.callCount, 1);
    stub.stop();
    done();
  });

  caller(message);
});

Tinytest.addAsync(
'Client - DDPProvider - incoming - updated message', 
function(test, done) {
  var stub = StartStubbing(StoreManager, 'trackEvent');
  var message = {msg: 'updated', methods: ["1", "2"]};
  var caller = DDPProvider._livedata_data(function(msg) {
    test.equal(msg, message);
    test.equal(stub.args[0], ['ddp-updated', {methods: message.methods}]);
    test.equal(stub.callCount, 1);
    stub.stop();
    done();
  });

  caller(message);
});

Tinytest.addAsync(
'Client - DDPProvider - incoming - updated message and ignore some messages', 
function(test, done) {
  var stub = StartStubbing(StoreManager, 'trackEvent');
  var message = {msg: 'updated', methods: ["1", "2"]};
  DDPProvider.ignoringMethodIds = {"2": true};
  var caller = DDPProvider._livedata_data(function(msg) {
    test.equal(msg, message);
    test.equal(stub.args[0], ['ddp-updated', {methods: ["1"]}]);
    test.equal(stub.callCount, 1);
    test.equal(DDPProvider.ignoringMethodIds, {});
    stub.stop();
    done();
  });

  caller(message);
});

Tinytest.addAsync(
'Client - DDPProvider - incoming - other incoming message', 
function(test, done) {
  var stub = StartStubbing(StoreManager, 'trackEvent');
  var message = {msg: 'pong'};
  var caller = DDPProvider._livedata_data(function(msg) {
    test.equal(msg, message);
    test.equal(stub.callCount, 0);
    stub.stop();
    done();
  });

  caller(message);
});


Tinytest.addAsync(
'Client - DDPProvider - outgoing - sub message', 
function(test, done) {
  var stub = StartStubbing(StoreManager, 'trackEvent');
  var message = {msg: 'sub', id: "1", name: 'the-name'};
  var caller = DDPProvider._send(function(msg) {
    test.equal(msg, message);
    test.equal(stub.args[0], ['ddp-sub', _.omit(message, 'msg')]);
    test.equal(stub.callCount, 1);
    stub.stop();
    done();
  });

  caller(message);
});

Tinytest.addAsync(
'Client - DDPProvider - outgoing - unsub message', 
function(test, done) {
  var stub = StartStubbing(StoreManager, 'trackEvent');
  var message = {msg: 'unsub', id: "1"};
  var caller = DDPProvider._send(function(msg) {
    test.equal(msg, message);
    test.equal(stub.args[0], ['ddp-unsub', _.omit(message, 'msg')]);
    test.equal(stub.callCount, 1);
    stub.stop();
    done();
  });

  caller(message);
});

Tinytest.addAsync(
'Client - DDPProvider - outgoing - method message', 
function(test, done) {
  var stub = StartStubbing(StoreManager, 'trackEvent');
  var message = {msg: 'method', id: "1", method: "the-method"};
  var caller = DDPProvider._send(function(msg) {
    test.equal(msg, message);
    var info = {name: message.method, id: message.id};
    test.equal(stub.args[0], ['ddp-method', info]);
    test.equal(stub.callCount, 1);
    stub.stop();
    done();
  });

  caller(message);
});

Tinytest.addAsync(
'Client - DDPProvider - outgoing - ignoring method message', 
function(test, done) {
  var stub = StartStubbing(StoreManager, 'trackEvent');
  var message = {msg: 'method', id: Random.id(), method: "kadira.debug.updateTimeline"};
  var caller = DDPProvider._send(function(msg) {
    test.equal(msg, message);
    test.equal(DDPProvider.ignoringMethodIds[message.id], true);
    test.equal(stub.callCount, 0);
    stub.stop();
    done();
  });

  caller(message);
});

Tinytest.addAsync(
'Client - DDPProvider - outgoing - some other message', 
function(test, done) {
  var stub = StartStubbing(StoreManager, 'trackEvent');
  var message = {msg: 'ping'};
  var caller = DDPProvider._send(function(msg) {
    test.equal(msg, message);
    test.equal(stub.callCount, 0);
    stub.stop();
    done();
  });

  caller(message);
});