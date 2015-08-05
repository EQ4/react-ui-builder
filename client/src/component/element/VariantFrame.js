'use strict';

var React = require('react/addons');
var Repository = require('../../api/Repository.js');

var VariantFrame = React.createClass({

    render: function() {
        return (<iframe {...this.props} />);
    },

    componentDidUpdate: function(){
        this._renderFrameContent();
    },

    componentDidMount: function() {
        var domNode = React.findDOMNode(this);
        domNode.onload = (function(){
            this._renderFrameContent();
        }).bind(this);
    },

    _renderFrameContent: function() {
        var doc = React.findDOMNode(this).contentDocument;
        var win = React.findDOMNode(this).contentWindow;
        if(doc.readyState === 'complete' && win.endpoint && win.endpoint.Page) {
            win.endpoint.replaceState(this.props.templatePageModel);
        }
    }


});

module.exports = VariantFrame;
