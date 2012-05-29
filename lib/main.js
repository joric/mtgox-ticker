/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var data = require("self").data;
var timer = require("timers");
var currency = "USD";
var prefs = require("simple-prefs").prefs;
var timeout = null;
var names = {"Last":"last", "High":"high", "Low":"low", "Avg":"avg","Vol":"vol","Bid":"buy", "Ask":"sell"};
var ticker = {};
var iconWidth = 16;
var captionWidth = 50;
var tickerTimeout = 60000;
var editTimeout = 1000;

function widgetContent(caption) {
    var image = data.url('icon.png');
    var icon = '<img src="'+image+'">';
    var style = '<style>* {text-align: center;} img{vertical-align: -25%; margin-right: 5px;}</style>';
    return style + (prefs.icon ? icon : '') + (prefs.caption ? caption : '');
}

var widget = require("widget").Widget({
    id:'mtgox-widget',
    label: 'MtGox ticker',
    content: widgetContent('0.00'),
    width: iconWidth,
    onClick: function() {
        require('window-utils').activeBrowserWindow.BrowserOpenAddonsMgr("addons://detail/"+require("self").id);
    }
});

function updateWidget() {
    var tab = require("tabs").activeTab;
    let view = widget.getView(tab.window);
    if (!view)
        return;

    var lines = [];
    lines.push('Currency: ' + prefs.currency);

    for (var name in names) {
         var id = names[name];

         try {
             var n = parseFloat(ticker['ticker'][id]);
         } catch (err) {
             var n = 0;
         }

         if (id == 'vol')
             n = Math.floor(n);
         else
             n = n.toFixed(2);

         if (id == 'last')
            view.content = widgetContent(n);

         lines.push(name +':  \t' + n);
    }

    view.tooltip = lines.join('\n');
    view.width = (prefs.icon ? iconWidth: 0) + (prefs.caption ? captionWidth : 0);
}

function update() {
    var Request = require("request").Request;
    var request = Request({
        url: 'https://mtgox.com/api/0/data/ticker.php?Currency=' + prefs.currency,
        onComplete: function (response) {
            ticker = response.json;
            updateWidget();
        }
    });
    request.get();
    timer.setTimeout(update, tickerTimeout);
}

function updateTicker(param) {
    timer.clearTimeout(timeout);
    timeout = timer.setTimeout(update, editTimeout);
}

exports.main = function(options, callbacks) {
    require("simple-prefs").on("currency", updateTicker);
    require("simple-prefs").on("caption", updateWidget);
    require("simple-prefs").on("icon", updateWidget);
    require("simple-prefs").on("update", updateWidget);
    update();
}
