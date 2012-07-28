self.port.on('update', function(param) {
    
    div = document.firstChild;

    console.log(div.offsetWidth)

    /*
    var div = document.getElementById('mtgox-ticker');

    while (div.firstChild)
        div.removeChild(div.firstChild);

    if (param.icon) {
        var img = document.createElement('img');
        img.setAttribute('src', param.icon);
        div.appendChild(img);
    }

    if (param.text) {
        var span = document.createElement('span');
        span.setAttribute('id', 'last');
        text = document.createTextNode((param.icon ? ' ':'') + param.text);
        span.appendChild(text);
        div.appendChild(span);
    }
*/
    self.port.emit('resize', div.offsetWidth, div.offsetHeight);

});
