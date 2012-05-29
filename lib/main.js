/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var self = require("self");
var timer = require("timers");
var names = {"Last":"last", "High":"high", "Low":"low", "Avg":"avg","Vol":"vol","Bid":"buy", "Ask":"sell"};

var widget = require("widget").Widget({
    id:'mtgox-widget',
    label: 'MtGox ticker',
    tooltip: '...',
    content: '...',
    width: 60
});

function update_widgets(json) {
    var r = json['ticker'];
    var j = 0;
    var lines = [];

    var tab = require("tabs").activeTab;
    let view = widget.getView(tab.window);

    if (!view)
        return;

    for (var name in names) {
         var id = names[name];

         try {
             var n = parseFloat(r[id]);
         } catch (err) {
             var n = 0;
         }

         if (id == 'vol') {
             n = Math.floor(n);
         } else {
             n = n.toFixed(2);
         }

         if (id == 'last') {
             view.content = n;
         }

         lines.push(name +': ' + n);
    }

    view.tooltip = lines.join('\n');
}

function update() {
    var Request = require("request").Request;
    var request = Request({
        url: 'https://mtgox.com/api/0/data/ticker.php',
        onComplete: function (response) {
            update_widgets(response.json);
        }
    });
    request.get();
    timer.setTimeout(update, 60000);
}

exports.main = function(options, callbacks) {
    update();
}
