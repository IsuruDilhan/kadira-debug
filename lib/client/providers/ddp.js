DDPProvider = {
  ignoringMethods: {
    "kadira.debug.updateTimeline": true
  },
  ignoringMethodIds: {}
};

var conn = Meteor.connection;

// watch incoming messages
DDPProvider._livedata_data = function(original) {
  var currentLiveUpdateMessageBlock = null;
  var flushScheduleHandler = null;

  // flush live updates just before sending data to the server
  StoreManager.beforePush(flushLiveUpdates);

  return function(msg) {
    var info = {};
    var eventName = null;

    trackLiveUpdates(msg);

    switch(msg.msg) {
      case "ready": 
        eventName = "ddp-ready";
        info.subs = msg.subs;
        break;
      case "nosub":
        eventName = "ddp-nosub";
        info.id = msg.id
        info.error = msg.error;
        break;
      case "updated":
        var methods = [];
        // removing ignoring methods
        _.each(msg.methods, function(id) {
          if(DDPProvider.ignoringMethodIds[id]) {
            delete DDPProvider.ignoringMethodIds[id];
          } else {
            methods.push(id);
          }
        });

        if(methods.length === 0) {
          break;
        }

        eventName = "ddp-updated";
        info.methods = methods;
        break;
    }

    if(eventName) {
      StoreManager.trackEvent(eventName, info);
    }
    return original.call(conn, msg);
  };

  function trackLiveUpdates(msg) {
    if(msg.msg == "added" || msg.msg == "removed" || msg.msg == "changed") {
      // decide whether to flush or not
      // we don't need to flush if we are getting same type of message
      // fortunately, DDP send similar messages together.
      // so we can group them easily
      var canFlush = 
        !currentLiveUpdateMessageBlock ||
        currentLiveUpdateMessageBlock.type != msg.msg ||
        currentLiveUpdateMessageBlock.collection != msg.collection;
      if(canFlush) {
        flushLiveUpdates();
      } 

      // add the block for first time after reset when flushing
      if(!currentLiveUpdateMessageBlock) {
        currentLiveUpdateMessageBlock = {
          type: msg.msg,
          collection: msg.collection,
          startTime: Date.now(),
          count: 0,
          lastUpdatedAt: Date.now()
        };
      }

      // increment the block
      currentLiveUpdateMessageBlock.count++;
      currentLiveUpdateMessageBlock.lastUpdatedAt = Date.now();
      // scheduleForFlush();
    } else {
      // flush tracking directly for other messages
      flushLiveUpdates();
    }
  }

  function flushLiveUpdates() {
    if(!currentLiveUpdateMessageBlock) {
      return;
    }

    var info = currentLiveUpdateMessageBlock;
    var startAt = info.startTime;
    StoreManager.trackEvent('live-updates', info, startAt);

    // reset the current block
    currentLiveUpdateMessageBlock = null;
  }
};
Utils.override(conn, '_livedata_data', DDPProvider._livedata_data);

// watch outgoing messages
DDPProvider._send = function(original) {
  return function(msg) {
    var info = {};
    var eventName = null;
    switch(msg.msg) {
      case "method":
        if(DDPProvider.ignoringMethods[msg.method]) {
          DDPProvider.ignoringMethodIds["" + msg.id] = true;
          break;
        }
        info.name = msg.method;
        info.id = msg.id;
        eventName = "ddp-method";
        break;
      case "sub":
        info.name = msg.name;
        info.id = msg.id;
        eventName = "ddp-sub";
        break;
      case "unsub":
        info.id = msg.id;
        eventName = "ddp-unsub";
        break;
    }

    if(eventName) {
      StoreManager.trackEvent(eventName, info);
    }
    return original.call(conn, msg);
  };
};
Utils.override(conn, '_send', DDPProvider._send);