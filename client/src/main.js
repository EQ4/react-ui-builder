'use strict';

// third-party libs
require('../lib/bootstrap/css/yeti/bootstrap.min.css');
require('../lib/bootstrap/js/bootstrap.min.js');
require('../lib/font-awesome/css/font-awesome.min.css');
require('../lib/slider/css/bootstrap-slider.min.css');
require('../lib/slider/js/bootstrap-slider.min.js');
require('../lib/select/css/default.css');
require('../lib/colorpicker/css/bootstrap-colorpicker.min.css');
require('../lib/colorpicker/js/bootstrap-colorpicker.min.js');
// umyproto libs
require('../css/umyproto.deskpage.css');
//
var React = require('react/addons');
var plugins = require('./plugin/plugins.js');
var docCookie = require('./api/cookies.js');

var Server = require('./api/Server.js');
var Application = require('./component/application/Application.js');
var ApplicationActions = require('./action/application/ApplicationActions.js');

$(document).ready(function(){


    plugins.init();

    React.render(<Application/>, document.body, function(){
        //!function (d, s, id) {
        //    var js, fjs = d.getElementsByTagName(s)[0], p = /^http:/.test(d.location) ? 'http' : 'https';
        //    if (!d.getElementById(id)) {
        //        js = d.createElement(s);
        //        js.id = id;
        //        js.src = p + '://platform.twitter.com/widgets.js';
        //        fjs.parentNode.insertBefore(js, fjs);
        //    }
        //}(document, 'script', 'twitter-wjs');
    });

    console.log(JSON.stringify(window.location, null, 4));

    Server.init({location: window.location});


});

