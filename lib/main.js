var data = require("self").data;
var timer = require("timers");
var prefs = require("simple-prefs").prefs;
var timeout = null;
var names = {"Last":"last", "High":"high", "Low":"low", "Avg":"avg",
    "Vol":"vol","Bid":"buy", "Ask":"sell"};
var ticker = {};
var tickerTimeout = 60000;
var editTimeout = 1000;
var widgets = require("widget")

var panel = require("panel").Panel({
    width: 300,
    height: 150,
    contentURL: data.url('panel.html'),
    contentScriptFile: data.url('panel.js'),
    onShow: function() {
        this.port.emit('update');
    }
});

/*
var widget = require("widget").Widget({
    id: 'mtgox-widget',
    label: 'MtGox Ticker',
    contentURL: data.url('icon16.png'),
//    contentURL: data.url('widget.html'),
    contentScriptFile: data.url('widget.js'),
    panel: panel
});
*/

// A widget that loads a random Flickr photo every 5 minutes.
var widget = widgets.Widget({
  id: "random-flickr",
  label: "Random Flickr Photo Widget",
  contentURL: "http://www.flickr.com/explore/",
  contentScriptWhen: "ready",
  contentScript: 'postMessage(document.querySelector(".pc_img").src);' +
                 'setTimeout(function() {' +
                 '  document.location = "http://www.flickr.com/explore/";' +
                 '}, 10 * 1000);',
  onMessage: function(imgSrc) {
    this.contentURL = imgSrc;
  },
  onClick: function() {
    require("tabs").activeTab.url = this.contentURL;
  }
});

function updateWidget() {
    var lines = [];
    lines.push('Currency: ' + prefs.currency);
    var last = 0;
    for (var name in names) {
        var id = names[name];

        try {
            var n = parseFloat(ticker['return'][id]['value']);
        } catch (err) {
            var n = parseFloat('0.00');
        }

        n = (id == 'vol') ? Math.floor(n) : n.toFixed(2);

        if (id == 'last')
            last = n;

        lines.push(name +':   \t' + n);
    }

    widget.tooltip = lines.join('\n');

    var icon = prefs.icon ? data.url('arrow_up.png') : null;
    var text = prefs.caption ? last : null;

    if (!prefs.icon && !prefs.caption)
        text = "MtGox";

//    widget.port.emit('update', {icon: icon, text: text});

//    widget.content = text;

//    widget.port.emit('update');


}

function updatePanel() {
    panel.port.emit('update');
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

function optionsTab() {
    require('window-utils').activeBrowserWindow
        .BrowserOpenAddonsMgr("addons://detail/"+require("self").id);
}

exports.main = function(options, callbacks) {
    require("simple-prefs").on("currency", updateTicker);
    require("simple-prefs").on("caption", updateWidget);
    require("simple-prefs").on("icon", updateWidget);
    require("simple-prefs").on("update", updateWidget);

    widget.port.on('resize', function(width, height) {
        console.log('resizing', width);
        widget.width = width;
    });

    panel.port.on('resize', function(width, height) {
        panel.resize(width + 16, height + 8);
    });

    panel.port.on('options', function() {
        optionsTab();
        panel.hide();
    });

    updatePanel();
    updateWidget();

    update();
}
