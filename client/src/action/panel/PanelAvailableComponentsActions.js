'use strict';

var Reflux = require('reflux');

var PanelAvailableComponentsActions = Reflux.createActions([
    'selectComponent',
    'refreshComponentList',
    'selectComponentItem',
    'deselectComponentItem',
    'selectComponentItemDefaultsIndex',
    'deleteDefaultsIndex'
]);

module.exports = PanelAvailableComponentsActions;
