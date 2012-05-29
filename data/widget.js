self.port.on('update', function(param) {
    var widget = document.getElementById("mtgox-ticker");
    widget.innerHTML = param.content;
    self.port.emit('width', {width: widget.offsetWidth, content: param.content});
});
