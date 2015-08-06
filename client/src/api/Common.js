'use strict';

var _ = require('lodash');

var Common = {

    fulfil: function (obj1, obj2) {
        if (_.isArray(obj2)) {
            if (!obj1 || obj1 == null) {
                obj1 = [];
                for (var i = 0; i < obj2.length; i++) {
                    obj1.push(this.fulfil(null, obj2[i]));
                }
            }
        } else if (_.isObject(obj2)) {
            if (!obj1) {
                obj1 = {};
            }
            var items = Object.getOwnPropertyNames(obj2);
            for (var item = 0; item < items.length; item++) {
                obj1[items[item]] = this.fulfil(obj1[items[item]], obj2[items[item]]);
            }
        } else {
            if (obj1 == undefined) {
                obj1 = obj2;
            }
        }
        return obj1;
    },
    fulex: function (obj2) {
        var obj1 = null;
        if (_.isArray(obj2)) {
            obj1 = [];
            for (var i = 0; i < obj2.length; i++) {
                obj1.push(this.fulex(obj2[i]));
            }
        } else if (_.isObject(obj2)) {
            obj1 = {};
            for (var item in obj2) {
                if (obj2.hasOwnProperty(item)) {
                    obj1[item] = this.fulex(obj2[item]);
                }
            }
        } else {
            obj1 = obj2;
        }
        return obj1;
    },
    isVisible: function (element) {
        var invisibleParent = false;
        if ($(element).css("display") === "none") {
            invisibleParent = true;
        } else {
            $(element).parents().each(function (i, el) {
                if ($(el).css("display") === "none") {
                    invisibleParent = true;
                    return false;
                }
                return true;
            });
        }
        return !invisibleParent;
    },
    getCSSClasses: function(doc){
        var resultList = [{ value: "undefined", label: "undefined" }];
        var sSheetList = doc.styleSheets;
        for (var sSheet = 0; sSheet < sSheetList.length; sSheet++)
        {
            //console.log(doc.styleSheets[sSheet].ownerNode);
            var href = doc.styleSheets[sSheet].ownerNode.attributes['href'];
            //if(href.indexOf('uikit.min.css') < 0
            //    || href.indexOf('tooltip.min.css') < 0
            //    || href.indexOf('umyproto.deskpage.css') < 0){
            if(!href){
                var ruleList = doc.styleSheets[sSheet].cssRules;
                for (var rule = 0; rule < ruleList.length; rule ++)
                {
                    if(ruleList[rule].selectorText && ruleList[rule].selectorText.charAt(0) === '.'){
                        var val = ruleList[rule].selectorText.substr(1);
                        if(val !== "undefined"
                            //&& val.indexOf(" ") < 0
                            //&& val.match(/^[0-9a-zA-Z_-]+$/g)
                        ){
                            resultList.push({
                                value: val,
                                label: val
                            });
                        }
                    }
                }
            }
        }
        return resultList;
    },

    setupPropsUmyId: function(modelItem, force){
        modelItem.props = modelItem.props || {};
        if(!force){
            modelItem.props['data-umyid'] = modelItem.props['data-umyid'] || _.uniqueId();
        } else {
            modelItem.props['data-umyid'] = _.uniqueId();
        }
        _.forOwn(modelItem.props, function(value, prop){
            if(_.isObject(value) && value.type){
                this.setupPropsUmyId(value, force);
            }
        }, this);
        if(modelItem.children && modelItem.children.length > 0){
            for(var i = 0; i < modelItem.children.length; i++){
                this.setupPropsUmyId(modelItem.children[i], force);
            }
        }
    },

    cleanPropsUmyId: function(modelItem){
        if(modelItem.props && modelItem.props['data-umyid']){
            modelItem.props['data-umyid'] = undefined;
            delete modelItem.props['data-umyid'];
        }
        _.forOwn(modelItem.props, function(value, prop){
            if(_.isObject(value) && value.type){
                this.cleanPropsUmyId(value);
            }
        }, this);
        if(modelItem.children && modelItem.children.length > 0){
            for(var i = 0; i < modelItem.children.length; i++){
                this.cleanPropsUmyId(modelItem.children[i]);
            }
        }
    },

    /**
     *
     * @param {object} modelItem
     * @param {object} value
     * @param {function} visitorCallback
     * @param {array} parentList
     * @returns boolean true if umyId is equals to component id
     */
    _findByPropsUmyId: function(modelItem, value, visitorCallback, parentList){
        //
        var _parentList = [];
        if(parentList && parentList.length > 0){
            parentList.map(function(parent){
                _parentList.push(parent);
            });
        }
        //
        if(modelItem.props && modelItem.props['data-umyid'] === value){
            return true;
        } else {
            if(modelItem.props){
                _.forOwn(modelItem.props,
                    function(propValue, prop){
                        if(_.isObject(propValue) && propValue.type){
                            _parentList.push(propValue);
                            if(this._findByPropsUmyId(propValue, value, visitorCallback, _parentList)){
                                visitorCallback({
                                    found: propValue,
                                    foundProp: prop,
                                    parent: modelItem,
                                    index: 0,
                                    parentList: _parentList
                                });
                            }
                        }
                    }, this);
            }
            if(modelItem.children && modelItem.children.length > 0){
                _parentList.push(modelItem);
                for(var i = 0; i < modelItem.children.length; i++){
                    if(this._findByPropsUmyId(modelItem.children[i], value, visitorCallback, _parentList)){
                        visitorCallback({
                            found: modelItem.children[i],
                            foundProp: '/!#child',
                            parent: modelItem,
                            index: i,
                            parentList: _parentList
                        });
                    }
                }
            }
            return false;
        }
    },

    /**
     *
     * @param {object} model
     * @param {function} visitorCallback
     */
    _traverseModel: function(model, visitorCallback){
        if(model.props){
            _.forOwn(model.props,
                function(propValue, prop){
                    if(_.isObject(propValue) && propValue.type){
                        visitorCallback({
                            found: propValue,
                            foundProp: prop
                        });
                        this._traverseModel(propValue, visitorCallback);
                    }
                }, this);
        }
        if(model.children && model.children.length > 0){
            for(var i = 0; i < model.children.length; i++){
                visitorCallback({
                    found: model.children[i],
                    foundProp: '/!#child'
                });
                this._traverseModel(model.children[i], visitorCallback);
            }
        }
    },

    /**
     *
     * @param {object} model
     * @param {string} umyId
     * @returns {object}
     */
    findByUmyId: function(model, umyId){
        var items = [];
        var searchResult = null;
        Common._findByPropsUmyId(model, umyId, function(item){
            items.push(item);
        });
        if(items.length == 1){
            searchResult = items[0];
        } else if(items.length > 1){
            console.error('There are multiple components with the same id: ' + umyId);
        } else {
            // do nothing
            //console.error('Component with id: ' + umyId + ' was not found');
        }
        return searchResult;
    },

    /**
     *
     * @param model
     * @returns {{}}
     */
    getFlatUmyIdModel: function(model){
        var flatModel = {};
        Common._traverseModel(model, function(item){
            if(item.found.props && item.found.props['data-umyid']){
                flatModel[item.found.props['data-umyid']] = {};
            }
        });
        return flatModel;
    },

    /**
     *
     * @param srcUmyId
     * @param destUmyId
     * @param projectModel
     * @param modifyMode
     * @returns {*}
     */
    pasteInModelFromUmyId: function(srcUmyId, destUmyId, projectModel, modifyMode){
        if(srcUmyId && destUmyId && projectModel && modifyMode){
            //
            var srcSearchResult = null;
            var searchResult = null;
            for(var i = 0; i < projectModel.pages.length; i++){
                if(!srcSearchResult){
                    srcSearchResult = Common.findByUmyId(projectModel.pages[i], srcUmyId);
                }
                if(!searchResult){
                    searchResult = Common.findByUmyId(projectModel.pages[i], destUmyId);
                }
            }
            if (searchResult && srcSearchResult) {
                var clipboard = Common.fulex(srcSearchResult.found);
                Common.setupPropsUmyId(clipboard, true);
                var modelItem = null;
                var modelIndex = null;
                switch (modifyMode) {
                    case 'addBefore':
                        if (searchResult.foundProp === '/!#child') {
                            modelItem = searchResult.parent;
                            modelIndex = searchResult.index;
                            modelItem.children = modelItem.children || [];
                            modelItem.children.splice(modelIndex, 0, clipboard);
                        }
                        break;
                    case 'insertFirst':
                        modelItem = searchResult.found;
                        modelItem.children = modelItem.children || [];
                        modelItem.children.splice(0, 0, clipboard);
                        break;
                    case 'insertLast':
                        modelItem = searchResult.found;
                        modelItem.children = modelItem.children || [];
                        modelItem.children.push(clipboard);
                        break;
                    case 'addAfter':
                        if (searchResult.foundProp === '/!#child') {
                            modelItem = searchResult.parent;
                            modelIndex = searchResult.index;
                            modelItem.children = modelItem.children || [];
                            modelItem.children.splice(modelIndex + 1, 0, clipboard);
                        }
                        break;
                    case 'wrap':
                        if (searchResult.foundProp === '/!#child') {
                            modelItem = searchResult.parent;
                            //console.log(JSON.stringify(modelItem, null, 4));
                            modelIndex = searchResult.index;
                            modelItem.children = modelItem.children || [];
                            var buffer = modelItem.children.splice(modelIndex, 1, clipboard);
                            clipboard.children = clipboard.children || [];
                            if(buffer && buffer.length > 0){
                                clipboard.children.push(buffer[0]);
                            }
                            //console.log(JSON.stringify(modelItem, null, 4));
                            //modelItem.children.splice(modelIndex, 0, clipboard);
                        }
                        break;
                    case 'replace':
                        if (searchResult.foundProp === '/!#child') {
                            modelItem = searchResult.parent;
                            //console.log(JSON.stringify(modelItem, null, 4));
                            modelIndex = searchResult.index;
                            modelItem.children = modelItem.children || [];
                            modelItem.children.splice(modelIndex, 1, clipboard);
                            //console.log(JSON.stringify(modelItem, null, 4));
                            //modelItem.children.splice(modelIndex, 0, clipboard);
                        }
                        break;
                    default:
                        break;
                }
                //
                srcSearchResult = null;
                clipboard = null;
                searchResult = null;
                modelItem = null;
            }
            return projectModel;
        } else {
            throw new Error('Some parameters are not set');
        }
    },

    /**
     *
     * @param clipboard
     * @param destUmyId
     * @param projectModel
     * @param modifyMode
     * @returns {*}
     */
    pasteInModelFromClipboard: function(clipboard, destUmyId, projectModel, modifyMode){
        if(clipboard && destUmyId && projectModel && modifyMode){
            //
            var searchResult = null;
            for(var i = 0; i < projectModel.pages.length; i++){
                if(!searchResult){
                    searchResult = Common.findByUmyId(projectModel.pages[i], destUmyId);
                }
            }

            if (searchResult) {
                var options = Common.fulex(clipboard);
                Common.setupPropsUmyId(options, true);
                var modelItem = null;
                var modelIndex = null;
                switch (modifyMode) {
                    case 'addBefore':
                        if(searchResult.foundProp === '/!#child'){
                            modelItem = searchResult.parent;
                            modelIndex = searchResult.index;
                            modelItem.children = modelItem.children || [];
                            modelItem.children.splice(modelIndex, 0, options);
                        }
                        break;
                    case 'insertFirst':
                        modelItem = searchResult.found;
                        modelItem.children = modelItem.children || [];
                        modelItem.children.splice(0, 0, options);
                        break;
                    case 'insertLast':
                        modelItem = searchResult.found;
                        modelItem.children = modelItem.children || [];
                        modelItem.children.push(options);
                        break;
                    case 'addAfter':
                        if(searchResult.foundProp === '/!#child') {
                            modelItem = searchResult.parent;
                            modelIndex = searchResult.index;
                            modelItem.children = modelItem.children || [];
                            modelItem.children.splice(modelIndex + 1, 0, options);
                        }
                        break;
                    case 'wrap':
                        if (searchResult.foundProp === '/!#child') {
                            modelItem = searchResult.parent;
                            //console.log(JSON.stringify(modelItem, null, 4));
                            modelIndex = searchResult.index;
                            modelItem.children = modelItem.children || [];
                            var buffer = modelItem.children.splice(modelIndex, 1, options);
                            options.children = options.children || [];
                            if(buffer && buffer.length > 0){
                                options.children.push(buffer[0]);
                            }
                            //console.log(JSON.stringify(modelItem, null, 4));
                            //modelItem.children.splice(modelIndex, 0, clipboard);
                        }
                        break;
                    case 'replace':
                        if (searchResult.foundProp === '/!#child') {
                            modelItem = searchResult.parent;
                            modelIndex = searchResult.index;
                            modelItem.children = modelItem.children || [];
                            modelItem.children.splice(modelIndex, 1, options);
                        }
                        break;
                    default:
                        break;
                }
                //
                options = null;
                searchResult = null;
                modelItem = null;
            }
            return projectModel;
        } else {
            throw new Error('Some parameters are not set');
        }
    },

    /**
     *
     * @param srcUmyId
     * @param destUmyId
     * @param projectModel
     * @param modifyMode
     * @returns {*}
     */
    moveInModel: function(srcUmyId, destUmyId, projectModel, modifyMode){
        if(srcUmyId && destUmyId && projectModel && modifyMode){
            //
            var destSearchResult = null;
            var srcSearchResult = null;
            for(var i = 0; i < projectModel.pages.length; i++){
                if(!destSearchResult){
                    destSearchResult = Common.findByUmyId(projectModel.pages[i], destUmyId);
                }
                if(!srcSearchResult){
                    srcSearchResult = Common.findByUmyId(projectModel.pages[i], srcUmyId);
                }
            }
            //
            if (destSearchResult && srcSearchResult) {
                var modelItem = null;
                var modelIndex = null;
                switch (modifyMode) {
                    case 'addBefore':
                        if(destSearchResult.foundProp === '/!#child') {
                            modelItem = destSearchResult.parent;
                            modelIndex = destSearchResult.index;
                            modelItem.children = modelItem.children || [];
                            srcSearchResult.parent.children.splice(srcSearchResult.index, 1);
                            modelItem.children.splice(modelIndex, 0, srcSearchResult.found);
                        }
                        break;
                    case 'insertFirst':
                        modelItem = destSearchResult.found;
                        modelItem.children = modelItem.children || [];
                        srcSearchResult.parent.children.splice(srcSearchResult.index, 1);
                        modelItem.children.splice(0, 0, srcSearchResult.found);
                        break;
                    case 'insertLast':
                        modelItem = destSearchResult.found;
                        modelItem.children = modelItem.children || [];
                        srcSearchResult.parent.children.splice(srcSearchResult.index, 1);
                        modelItem.children.push(srcSearchResult.found);
                        break;
                    case 'addAfter':
                        if(destSearchResult.foundProp === '/!#child') {
                            modelItem = destSearchResult.parent;
                            modelIndex = destSearchResult.index;
                            modelItem.children = modelItem.children || [];
                            srcSearchResult.parent.children.splice(srcSearchResult.index, 1);
                            modelItem.children.splice(modelIndex + 1, 0, srcSearchResult.found);
                        }
                        break;
                    case 'wrap':
                        if (destSearchResult.foundProp === '/!#child') {
                            modelItem = destSearchResult.parent;
                            modelIndex = destSearchResult.index;
                            modelItem.children = modelItem.children || [];
                            srcSearchResult.parent.children.splice(srcSearchResult.index, 1);
                            // the same parent component, index is decremented
                            if(srcSearchResult.parent == modelItem && modelIndex > srcSearchResult.index){
                                modelIndex--;
                            }
                            var buffer = modelItem.children.splice(modelIndex, 1, srcSearchResult.found);
                            srcSearchResult.found.children = srcSearchResult.found.children || [];
                            if(buffer && buffer.length > 0){
                                srcSearchResult.found.children.push(buffer[0]);
                            }
                        }
                        break;
                    case 'replace':
                        if (destSearchResult.foundProp === '/!#child') {
                            modelItem = destSearchResult.parent;
                            modelIndex = destSearchResult.index;
                            modelItem.children = modelItem.children || [];
                            srcSearchResult.parent.children.splice(srcSearchResult.index, 1);
                            // the same parent component, index is decremented
                            if(srcSearchResult.parent == modelItem && modelIndex > srcSearchResult.index){
                                modelIndex--;
                            }
                            modelItem.children.splice(modelIndex, 1, srcSearchResult.found);
                        }
                        break;
                    default:
                        break;
                }
                //
                destSearchResult = null;
                srcSearchResult = null;
                modelItem = null;
                modelIndex = null;
            }
            return projectModel;
        } else {
            throw new Error('Some parameters are not set');
        }
    },

    /**
     *
     * @param projectModel
     * @param umyId
     * @returns {*}
     */
    moveUpInModel: function(projectModel, umyId){

        var searchResult = null;
        for(var i = 0; i < projectModel.pages.length; i++){
            if(!searchResult){
                searchResult = Common.findByUmyId(projectModel.pages[i], umyId);
            }
        }
        if(searchResult
            && searchResult.foundProp === '/!#child'
            && searchResult.parent
            && searchResult.parent.children
            && searchResult.index > 0){
            //
            searchResult.parent.children.splice(searchResult.index, 1);
            searchResult.parent.children.splice(searchResult.index - 1, 0, searchResult.found);
        }

        return projectModel;
    },

    /**
     *
     * @param projectModel
     * @param umyId
     * @returns {*}
     */
    moveDownInModel: function(projectModel, umyId){

        var searchResult = null;
        for(var i = 0; i < projectModel.pages.length; i++){
            if(!searchResult){
                searchResult = Common.findByUmyId(projectModel.pages[i], umyId);
            }
        }
        if(searchResult
            && searchResult.foundProp === '/!#child'
            && searchResult.parent
            && searchResult.parent.children
            && searchResult.index < searchResult.parent.children.length){
            //
            searchResult.parent.children.splice(searchResult.index, 1);
            searchResult.parent.children.splice(searchResult.index + 1, 0, searchResult.found);
        }

        return projectModel;
    },

    /**
     *
     * @param projectModel
     * @param umyId
     * @returns {*}
     */
    deleteFromModel: function(projectModel, umyId){
        var searchResult = null;
        for(var i = 0; i < projectModel.pages.length; i++){
            if(!searchResult){
                searchResult = Common.findByUmyId(projectModel.pages[i], umyId);
                if(searchResult
                    && searchResult.parent == projectModel.pages[i]
                    && searchResult.parent.children
                    && searchResult.parent.children.length == 1){
                    //
                    console.error("Can't delete the last component on the page");
                    return projectModel;
                }
            }
        }
        if(searchResult && searchResult.parent && searchResult.index >= 0){
            if(searchResult.foundProp && searchResult.foundProp === '/!#child'){
                searchResult.parent.children.splice(searchResult.index, 1);
            }
        }
        return projectModel;
    }

};

module.exports = Common;
