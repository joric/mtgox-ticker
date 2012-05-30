/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var data = require("self").data;
var timer = require("timers");
var prefs = require("simple-prefs").prefs;
var timeout = null;
var names = {"Last":"last", "High":"high", "Low":"low", "Avg":"avg","Vol":"vol","Bid":"buy", "Ask":"sell"};
var ticker = {};
var tickerTimeout = 60000;
var editTimeout = 1000;

var widget = require("widget").Widget({
    id:'mtgox-widget',
    label: 'MtGox ticker',
    content: '<span id="mtgox-ticker"></span>',
    contentScriptFile: data.url('widget.js'),
    onClick: function() {
        require('window-utils').activeBrowserWindow.BrowserOpenAddonsMgr("addons://detail/"+require("self").id);
    },
});

function updateWidget() {
    var lines = [];
    lines.push('Currency: ' + prefs.currency);

    var last = 0.00;
    for (var name in names) {
        var id = names[name];

        try {
            var n = parseFloat(ticker['return'][id]['value']);
        } catch (err) {
            var n = 0;
        }

        n = (id == 'vol') ? Math.floor(n) : n.toFixed(2);

        if (id == 'last')
            last = n;

        lines.push(name +':   \t' + n);
    }

    widget.tooltip = lines.join('\n');

    var img = data.url('icon.png');
    var content = 'Mt.Gox';
    if (prefs.icon && prefs.caption) {
        content = '<nobr><img src="'+img+'" width=16><span style="vertical-align:top; padding-left: 3px;">'+last+'</span></nobr>';
    } else if (prefs.icon) {
        content = '<img src="'+img+'"/>';
    } else if (prefs.caption) {
        content = last;
    }

    widget.port.emit('update', {content: content});
}

function update() {
    var Request = require("request").Request;
    var request = Request({
        url: 'https://mtgox.com/api/1/BTC' + prefs.currency + '/ticker',
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

    widget.port.on('width', function(param) {
        widget.content = '<span id="mtgox-ticker">'+param.content+'</span>';
        widget.width = param.width;
    });

    updateWidget();
    update();
}
