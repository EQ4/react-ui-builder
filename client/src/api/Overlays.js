'use strict';

var _ = require('underscore');
var Repository = require('./Repository.js');
var Common = require('./Common.js');
var DeskPageFrameActions = require('../action/desk/DeskPageFrameActions.js');

var Overlays = {

    createComponentOverlay: function(frameWindow, domNodeId, modelNode){

        var shortLabel = modelNode.found.type || 'Unknown';
        var labelClass = 'umyproto-button-success';

        var overlayModel = {
            pageFrameWindow: frameWindow,
            onClose: DeskPageFrameActions.deselectComponent,
            buttons: []
        };
        overlayModel.buttons.push(
            {
                label: '&lt;' + shortLabel + '&gt;&nbsp;&nbsp;',
                icon: 'umyproto-icon-caret-down',
                btnClass: labelClass,
                menu: [
                    {label: 'Test Dropdown', onClick: function(){alert('Clicked on test dropdown!!!');}}
                ]
            });
        overlayModel.buttons.push(
            {
                icon: "umyproto-icon-level-up",
                tooltip: 'Select parent component',
                onClick: (function (_nodeId) {
                    return function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        DeskPageFrameActions.selectParentComponent(_nodeId);
                    }
                })(domNodeId)
            });
        if(modelNode.foundProp === '/!#child'){
            overlayModel.buttons.push(
                {
                    icon: 'umyproto-icon-arrow-up',
                    tooltip: 'Move component up',
                    onClick: (function (_nodeId) {
                        return function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            DeskPageFrameActions.moveUpComponent(_nodeId);
                        }
                    })(domNodeId)
                });
            overlayModel.buttons.push(
                {
                    icon: 'umyproto-icon-arrow-down',
                    tooltip: 'Move component down',
                    onClick: (function (_nodeId) {
                        return function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            DeskPageFrameActions.moveDownComponent(_nodeId);
                        }
                    })(domNodeId)
                });
        }
        overlayModel.buttons.push(
            {
                icon: 'umyproto-icon-cut',
                tooltip: 'Cut component into clipboard',
                onClick: (function (_nodeId) {
                    return function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        DeskPageFrameActions.startCutPasteComponent(_nodeId);
                    }
                })(domNodeId)
            });
        overlayModel.buttons.push(
            {
                icon: 'umyproto-icon-clipboard',
                tooltip: 'Copy component into clipboard',
                onClick: (function (_nodeId) {
                    return function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        DeskPageFrameActions.startCopyComponent(_nodeId);
                    }
                })(domNodeId)
            });
        overlayModel.buttons.push(
            {
                icon: 'umyproto-icon-copy',
                tooltip: 'Duplicate component',
                onClick: (function (_nodeId) {
                    return function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        DeskPageFrameActions.duplicateComponent(_nodeId);
                    }
                })(domNodeId)
            });
        overlayModel.buttons.push(
            {
                icon: 'umyproto-icon-trash-o',
                tooltip: 'Remove component from page',
                onClick: (function (_nodeId) {
                    return function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        DeskPageFrameActions.deleteComponent(_nodeId);
                    }
                })(domNodeId)
            });
        overlayModel.buttons.push(
            {
                icon: 'umyproto-icon-gears',
                tooltip: 'Show component options',
                onClick: (function (_nodeId) {
                    return function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        DeskPageFrameActions.showPropertyEditor();
                    }
                })(domNodeId)
            });
        return $("<div></div>").umyComponentOverlay(overlayModel);
    },

    createCopyPasteOverlay: function(frameWindow, domNodeId, modelNode){

        var shortLabel = modelNode.found.type || 'Unknown';
        var labelClass = 'umyproto-button-success';

        var overlayModel = {
            pageFrameWindow: frameWindow,
            onClose: DeskPageFrameActions.deselectComponent,
            buttons: [
                {
                    label: '&lt;' + shortLabel + '&gt;',
                    btnClass: labelClass,
                    onClick: (function (_nodeId) {
                        return function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                        }
                    })(domNodeId)
                },
                {
                    icon: "umyproto-icon-level-up",
                    tooltip: 'Select parent component',
                    onClick: (function (_nodeId) {
                        return function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            DeskPageFrameActions.selectParentComponent(_nodeId);
                        }
                    })(domNodeId)
                },
                {
                    label: 'Before',
                    tooltip: 'Add component in clipboard before selected one',
                    onClick: (function (_nodeId) {
                        return function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            DeskPageFrameActions.addBefore();
                        }
                    })(domNodeId)
                },
                {
                    label: 'First',
                    tooltip: 'Insert component in clipboard into selected one as the first child component',
                    onClick: (function (_nodeId) {
                        return function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            DeskPageFrameActions.insertFirst();
                        }
                    })(domNodeId)
                },
                {
                    label: 'Wrap',
                    tooltip: 'Wrap selected component with component in clipboard',
                    onClick: (function (_nodeId) {
                        return function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            DeskPageFrameActions.wrap();
                        }
                    })(domNodeId)
                },
                {
                    label: 'Replace',
                    tooltip: 'Replace selected component with component in clipboard',
                    onClick: (function (_nodeId) {
                        return function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            DeskPageFrameActions.replace();
                        }
                    })(domNodeId)
                },
                {
                    label: 'Last',
                    tooltip: 'Insert component in clipboard into selected one as the last child component',
                    onClick: (function (_nodeId) {
                        return function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            DeskPageFrameActions.insertLast();
                        }
                    })(domNodeId)
                },
                {
                    label: 'After',
                    tooltip: 'Add component in clipboard after selected one',
                    onClick: (function (_nodeId) {
                        return function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            DeskPageFrameActions.addAfter();
                        }
                    })(domNodeId)
                },
                {
                    label: 'Cancel',
                    tooltip: 'Clear clipboard',
                    btnClass: 'umyproto-button-success',
                    onClick: (function (_nodeId) {
                        return function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            DeskPageFrameActions.stopClipboardForOptions();
                        }
                    })(domNodeId)
                }
            ]
        };
        return $("<div></div>").umyComponentOverlay(overlayModel);
    },

    createTreeviewOverlay: function(domNode, domNodeId){
        var overlayModel = {
            onClose: DeskPageFrameActions.deselectComponent,
            buttons: [
                {
                    icon: "fa-mail-forward fa-rotate-270",
                    onClick: (function (_node, _nodeId) {
                        return function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            DeskPageFrameActions.selectParentComponent(_nodeId);
                        }
                    })(domNode, domNodeId)
                },
                {
                    icon: 'fa-arrow-up',
                    onClick: (function (_node, _nodeId) {
                        return function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            DeskPageFrameActions.moveUpComponent(_nodeId);
                        }
                    })(domNode, domNodeId)
                },
                {
                    icon: 'fa-arrow-down',
                    onClick: (function (_node, _nodeId) {
                        return function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            DeskPageFrameActions.moveDownComponent(_nodeId);
                        }
                    })(domNode, domNodeId)
                },
                //{
                //    icon: 'fa-clipboard',
                //    onClick: (function (_node, _nodeId) {
                //        return function (e) {
                //            e.preventDefault();
                //            e.stopPropagation();
                //            alert('DOM Node with umyid: ' + _nodeId);
                //        }
                //    })(domNode, domNodeId)
                //},
                {
                    icon: 'fa-cut',
                    onClick: (function (_node, _nodeId) {
                        return function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            DeskPageFrameActions.startCutPasteComponent(_nodeId);
                        }
                    })(domNode, domNodeId)
                },
                {
                    icon: 'fa-copy',
                    onClick: (function (_node, _nodeId) {
                        return function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            DeskPageFrameActions.startCopyComponent(_nodeId);
                        }
                    })(domNode, domNodeId)
                },
                {
                    icon: 'fa-trash-o',
                    onClick: (function (_node, _nodeId) {
                        return function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            DeskPageFrameActions.deleteComponent(_nodeId);
                        }
                    })(domNode, domNodeId)
                },
                {
                    icon: 'fa-plus',
                    onClick: (function (_node, _nodeId) {
                        return function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            alert('DOM Node with umyid: ' + _nodeId);
                        }
                    })(domNode, domNodeId)
                }
            ]
        };
        return $("<div></div>").umyTreeviewOverlay(overlayModel);
    },

    createTreeviewCopyPasteOverlay: function(domNode, domNodeId){
        var overlayModel = {
            onClose: DeskPageFrameActions.deselectComponent,
            buttons: [
                {
                    label: 'Add Before',
                    onClick: (function (_node, _nodeId) {
                        return function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            DeskPageFrameActions.addBefore();
                        }
                    })(domNode, domNodeId)
                },
                {
                    label: 'Insert First',
                    onClick: (function (_node, _nodeId) {
                        return function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            DeskPageFrameActions.insertFirst();
                        }
                    })(domNode, domNodeId)
                },
                {
                    label: 'Insert Last',
                    onClick: (function (_node, _nodeId) {
                        return function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            DeskPageFrameActions.insertLast();
                        }
                    })(domNode, domNodeId)
                },
                {
                    label: 'Add After',
                    onClick: (function (_node, _nodeId) {
                        return function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            DeskPageFrameActions.addAfter();
                        }
                    })(domNode, domNodeId)
                }
            ]
        };
        return $("<div></div>").umyTreeviewOverlay(overlayModel);
    }
};

module.exports = Overlays;
