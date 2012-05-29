/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var self = require("self");
var timer = require("timers");
var names = {"Last":"last", "High":"high", "Low":"low", "Avg":"avg","Vol":"vol","Bid":"buy", "Ask":"sell"};
var widgets = [];

function update_widgets(json) {
    var r = json['ticker'];
    var j = 0;
    for (var name in names) {

         var widget = widgets[j++];
         var tab = require("tabs").activeTab;
         let view = widget.getView(tab.window);
         if (!view)
             return;

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
         view.content = name +': ' + n;
    }
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

function create_widgets() {
    for (var name in names) {
        var widget = require("widget").Widget({
            id:'mtgox-' + name,
            label:'MtGox ' + name,
            content: name + ': ...',
            width: names[name] == 'vol' ? 70 : 65
        });
        widgets.push(widget);
    }
}

exports.main = function(options, callbacks) {
    create_widgets();
    update();
}
