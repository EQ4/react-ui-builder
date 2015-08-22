'use strict';

var _ = require('lodash');
var Reflux = require('reflux');
var ToolbarTopActions = require('../../action/toolbar/ToolbarTopActions.js');
var ApplicationActions = require('../../action/application/ApplicationActions.js');
var DeskPageFrameActions = require('../../action/desk/DeskPageFrameActions.js');
var DeskActions = require('../../action/desk/DeskActions.js');
var Common = require('../../api/Common.js');
var Repository = require('../../api/Repository.js');
var Server = require('../../api/Server.js');

var defaultModel = {
    pageNames:[],
    currentPageName: '',
    isAddNewComponentMode: false,
    iframeWidth: '100%'
};

var ToolbarTopStore = Reflux.createStore({
    model: defaultModel,
    listenables: ToolbarTopActions,

    onStartAddNewComponentMode: function(inClipboard){
        this.model.isAddNewComponentMode = true;
        this.model.inClipboard = inClipboard;
        this.trigger(this.model);
    },
    onStopAddNewComponentMode: function(){
        this.model.isAddNewComponentMode = false;
        this.model.inClipboard = null;
        this.trigger(this.model);
    },

    onRefreshPageList: function(){
        var pageNames = Repository.getCurrentProjectPageNames();

        this.model.currentPageName = Repository.getCurrentPageName();
        this.model.pages = [];
        _.forEach(pageNames, (function(page, pageIndex){
            //if(page !== this.model.currentPageName){
                this.model.pages.push(
                    {
                        pageName: page,
                        pageIndex: pageIndex
                    });
            //}
        }).bind(this));

        this.trigger(this.model);
    },

    onAddNewPage: function(){
        var projectModel = Repository.getCurrentProjectModel();
        var newPageModel = Repository.getTemplatePageModel();
        newPageModel.pageName = newPageModel.pageName + projectModel.pages.length;
        Common.setupPropsUmyId(newPageModel, true);
        projectModel.pages.push(newPageModel);
        Repository.renewCurrentProjectModel(projectModel);
        Repository.setCurrentPageModelByIndex(projectModel.pages.length - 1);
        this.onRefreshPageList();
        DeskPageFrameActions.renderPageFrame();
    },

    onDeletePage: function(){
        Repository.deleteCurrentPageModel();
        this.onRefreshPageList();
        DeskPageFrameActions.renderPageFrame();
    },

    onCopyPage: function(){
        var projectModel = Repository.getCurrentProjectModel();
        var newPageModel = Repository.getCurrentPageModel();
        newPageModel.pageName = newPageModel.pageName + projectModel.pages.length;
        Common.setupPropsUmyId(newPageModel, true);
        projectModel.pages.push(newPageModel);
        Repository.renewCurrentProjectModel(projectModel);
        Repository.setCurrentPageModelByIndex(projectModel.pages.length - 1);
        this.onRefreshPageList();
        DeskPageFrameActions.renderPageFrame();
    },

    onSwitchToPage: function(pageIndex){
        Repository.setCurrentPageModelByIndex(parseInt(pageIndex));
        this.onRefreshPageList();
        DeskPageFrameActions.renderPageFrame();
    },

    onUndo: function(){
        Repository.undoCurrentProjectModel();
        this.onRefreshPageList();
        DeskPageFrameActions.renderPageFrame();
    },

    onRedo: function(){
        Repository.redoCurrentProjectModel();
        this.onRefreshPageList();
        DeskPageFrameActions.renderPageFrame();
    },

    onChangeIframeWidth: function(options){
        this.model.iframeWidth = options.iframeWidth;
        DeskActions.changeIframeWidth({iframeWidth: this.model.iframeWidth});
        this.trigger(this.model);
    }
});

module.exports = ToolbarTopStore;
