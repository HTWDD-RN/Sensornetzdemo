import React, { Component } from 'react';
import FileBase64 from 'react-file-base64';
import ColorBar from '../ColorBar'

export default class ImageToColorAction extends Component {
    render() {
        return <div>
            <img src={this.props.action.parameter.current} width="100" />
            <FileBase64
                multiple={false}
                onDone={this.onFileSelected.bind(this)} />
            <ColorBar
                colors={this.props.action.parameter.colors} />
        </div>
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