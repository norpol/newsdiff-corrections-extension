var settings = JSON.parse(localStorage['newsdiff-settings']);

var sendMessage = function() {
  var sandbox = document.getElementById('sandbox');

  var diffs = getDiffs();
  diffs = Object.values(groupBy(diffs,'url')).map(function(x) {
    return x.sort(function(y,z) { return y.severity - z.severity; }).reverse()[0];
  });

  var message = {
    command: 'correction_template',
    context: {
      corrections: diffs,
      BASE_URL: BASE_URL(),
      TESTMODE: JSON.parse(localStorage['newsdiff-TESTMODE']),
    }
  };

  sandbox.contentWindow.postMessage(message,
                                    '*');
};

document.addEventListener('DOMContentLoaded', function() {
  setTimeout(sendMessage,1000);
  document.querySelector('button#markread').addEventListener('click', function() {
    var read = JSON.parse(localStorage['newsdiff-diffs-seen']);
    var tobemarked = getDiffs_basic();
    tobemarked.map(function(x) {
      read.push(x.id);
    });
    localStorage['newsdiff-diffs-seen'] = JSON.stringify(read)
    log('discarded in popup', tobemarked.length);
    window.close();
  });
});

window.addEventListener('message', function(event) {
  var data = event.data;
  document.getElementById('correction_list').innerHTML = data.html;
  Array.prototype.slice.call(document.querySelectorAll("#correction_list a")).map(function(e) {
    e.addEventListener('click', function(x) {
      var id = e.getAttribute('data-id');
      var diffs = [].concat.apply([], Object.values(JSON.parse(localStorage['newsdiff-diffs'])));
      var diff = diffs.filter(function(x) {
        return x.id == id;
      })[0];
      log('opened from popup', 1);
      log('opened from popup-hour-'+(new Date().getHours()), 1); // by hour
      log('opened from popup-severity-'+diff.severity, 1); // by hour
      markAsRead(e.getAttribute('data-url'));
    });
  });
});

