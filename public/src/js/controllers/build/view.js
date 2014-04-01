define([
  'knockout',
  'session',
  'router',
  'request',
  'dom',
  'timestamp'
], function (ko, session, router, request, dom, timestamp) {

  var view = {

    // Set page title
    pageTitle: 'Build Profile',

    // Create observables
    id: ko.observable(),
    commit: ko.observable(),
    config: ko.observable(),
    start: ko.observable(),
    end: ko.observable(),
    status: ko.observable(),
    log: ko.observable('Loading...'),

    // Check if session exists
    before: function (fn) {
      session(function (res) {
        if (!res) {
          // No session, show login
          router.go('/');
        } else {
          fn(true);
        }
      });
    },

    load: function (project, id) {
      var self = this;
      self.id(id);

      // Request build data
      var req = request({
        url: '/api/build/'+id
      });

      req.done(function (build) {
        var startStamp = timestamp.common(build.data.start);
        var endStamp;
        if (build.data.hasOwnProperty('end')) {
          endStamp = timestamp.common(build.data.end);
        } else {
          endStamp = "N/A";
        }
        self.commit(build.data.commit);
        self.config(JSON.stringify(build.data.config, null, 4));
        self.start(startStamp);
        self.end(endStamp);
        self.status(self.getStatus(build.data.status));
      });

      var reqLog = request({
        url: '/api/build/log/'+id
      });

      reqLog.done(function (log) {
        self.log(log.data);
      });

      reqLog.fail(function () {
        self.log('ERROR');
      });
    },

    getStatus: function (status) {
      var obj = { 0: 'Pass', 1: 'Fail', 2: 'Pending' };
      return obj[status];
    }
  };

  return view;
});
