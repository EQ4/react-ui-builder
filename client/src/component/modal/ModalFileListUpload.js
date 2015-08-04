'use strict';

var _ = require('underscore');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;
var Input = ReactBootstrap.Input;
var Panel = ReactBootstrap.Panel;
var Alert = ReactBootstrap.Alert;
var Grid = ReactBootstrap.Grid;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var InputValue = require('../element/InputValue.js');
var ProjectNameInput = require('../element/ProjectNameInput.js');
var ProjectDescriptionInput = require('../element/ProjectDescriptionInput.js');
var CollapsibleLabel = require('../element/CollapsibleLabel.js');

var ModalFileListUploadStore = require('../../store/modal/ModalFileListUploadStore.js');
var ModalFileListUploadActions = require('../../action/modal/ModalFileListUploadActions.js');
var ApplicationActions = require('../../action/application/ApplicationActions.js');

var ModalFileListUpload = React.createClass({

    _handleUploadFiles: function(e){
        e.stopPropagation();
        e.preventDefault();
        ModalFileListUploadActions.uploadFiles(
            {
                files: this.state.dataList,
                projectName: this.refs.projectNameInput.getValue(),
                projectDescription: this.refs.projectDescriptionInput.getValue(),
                projectLicense: this.refs.licenseInput.getValue()
            }
        );
    },

    _handleClose: function(e){
        e.stopPropagation();
        e.preventDefault();
        ModalFileListUploadActions.hideModal();
    },

    _handleItemChange: function(e){
        var newState = {
            dataList: this.state.dataList
        };
        newState.dataList[e.currentTarget.value].checked = e.currentTarget.checked;
        this.setState(newState);
    },

    _handleLoginForm: function(e){
        e.stopPropagation();
        e.preventDefault();
        ModalFileListUploadActions.hideModal();
        ApplicationActions.goToSignInForm();
    },

    getInitialState: function () {
        return ModalFileListUploadStore.model;
    },

    onModelChange: function(model) {
        this.setState(model);
    },
    componentDidMount: function() {
        this.unsubscribe = ModalFileListUploadStore.listen(this.onModelChange);
    },
    componentWillUnmount: function() {
        this.unsubscribe();
    },

    getDefaultProps: function () {
        return {
            onHide: function(){/* do nothing */}
        };
    },

    render: function(){

        var alerts = [];
        if(this.state.errors && this.state.errors){
            this.state.errors.map(function(error, index){
                alerts.push(
                    <p className='text-danger' key={'error' + index}><strong>{JSON.stringify(error)}</strong></p>
                );
            });
            alerts.push(<hr/>);
        }
        var modalContent = null;
        var modalFooter = null;
        if(this.state.stage === 'chooseFiles'){
            modalContent = (
            <Grid fluid={true}>
                <Row>
                    <Col xs={7} md={7} sm={7} lg={7}>
                        <ProjectNameInput value={this.state.projectName} ref='projectNameInput'/>
                        <ProjectDescriptionInput value={this.state.projectDescription} ref='projectDescriptionInput'/>
                        <InputValue
                            ref='licenseInput'
                            type='text'
                            value={this.state.projectLicense}
                            label='License:' placeholder='MIT'/>
                        <CollapsibleLabel title='Legal stuff'>
                            <div style={{padding: '0.5em'}}>
                                <p>Data published to the React UI Builder gallery is not part of React UI Builder itself,
                                    and is the sole property of the publisher.</p>
                                <p>Any data published to the React UI Builder gallery (including user account information)
                                    may be removed or modified at the sole discretion of the UMyProto Team administration.</p>
                            </div>
                        </CollapsibleLabel>
                    </Col>
                    <Col xs={5} md={5} sm={5} lg={5}>
                        <p style={{borderBottom: '1px solid #cdcdcd', width: '100%'}}><strong>Files:</strong></p>
                        <div style={{maxHeight: '20em', overflow: 'auto'}}>
                            {this.state.dataList.map(function(item, index){
                                var label = null;
                                if(item.isDirectory){
                                    label = <div><span className='fa fa-folder fa-fw'></span>&nbsp;&nbsp;<strong>{item.name}</strong></div>;
                                } else {
                                    label = <div><span className='fa fa-file-o fa-fw'></span>&nbsp;&nbsp;{item.name}</div>;
                                }
                                return (
                                    <Input
                                        type="checkbox"
                                        key={'checkBoxItem' + index}
                                        checked={item.checked}
                                        label={label}
                                        value={index}
                                        disabled={item.mandatory}
                                        onChange={this._handleItemChange} />
                                );
                            }.bind(this))}
                        </div>
                    </Col>
                </Row>
            </Grid>
            );
            modalFooter = (
                <div>
                    {alerts.length > 0 ? null : <Button onClick={this._handleUploadFiles} bsStyle="primary">Upload files</Button>}
                    <Button onClick={this._handleClose}>Cancel</Button>
                </div>
            );
        } else if(this.state.stage === 'uploadingFiles') {
            modalContent = (
                <h5>Uploading files please wait ...</h5>
            );
        } else if(this.state.stage === 'uploadingEnd'){
            modalContent = (
                <h5>Project is uploaded successfully. Please go to gallery to check.</h5>
            );
            modalFooter = (
                <div>
                    <Button onClick={this._handleClose}>Close</Button>
                </div>
            );
        } else if(this.state.stage === 'serverConnectionError'){
            modalContent = (
                <h5>Error connection with server. If you are not authenticated, please sign in on &nbsp;
                    <a href='#' onClick={this._handleLoginForm}>this form</a>
                </h5>
            );
            modalFooter = (
                <div>
                    <Button onClick={this._handleClose}>Close</Button>
                </div>
            );
        }

        return (
            <Modal show={this.state.isModalOpen}
                   onHide={this.props.onHide}
                   dialogClassName='umy-modal-overlay'
                   backdrop={true}
                   keyboard={true}
                   bsSize='large'
                   animation={true}>
                <Modal.Header closeButton={false}>
                    <Modal.Title>Uploading project files to gallery</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {alerts}
                    {modalContent}
                </Modal.Body>
                <Modal.Footer>
                    {modalFooter}
                </Modal.Footer>
            </Modal>
        );
    }

});

module.exports = ModalFileListUpload;
