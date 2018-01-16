import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import ColorBar from '../ColorBar'
import fetch from 'isomorphic-fetch';


export default class ImageToColorAction extends Component {
    render() {
        return <div>
            <img src={this.props.action.parameter.base64} style={{
                width: '100%',
                maxWidth: '600px'
            }} alt="" />
            <Dropzone
                multiple={false}
                accept="image/*"
                onDrop={this.onImageDrop.bind(this)}>
                <p>Drop an image or click to select a file to upload.</p>
            </Dropzone>
            <ColorBar
                colors={this.props.action.parameter.colors} />
        </div>
    }

    onImageDrop(files) {
        const imageFormData = new FormData();
        imageFormData.append('imageFiles', files[0], files[0].name);
        let response = fetch(this.props.client.getImageUploadPath(), {
            method: 'POST',
            body: imageFormData,
            headers: {}
        }).then(function (response) {
            if (response.status >= 400) {
                throw new Error("Bad response from server");
            }
            return response.json();
        }).then(result => {
            this.props.client.setStatus(this.props.id, this.props.action.id, files[0].name)
                .then(res => {
                    console.log('Updated value, got ', res, 'as response');
                });
        });

    }

    onFileSelected(file) {
        console.log(file);
        const newValue = file.base64;
        this.props.client.setStatus(this.props.id, this.props.action.id, newValue)
            .then(res => {
                console.log('Updated value, got ', res, 'as response');
            });
    }
}