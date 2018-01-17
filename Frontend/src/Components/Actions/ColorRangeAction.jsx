import React, { Component } from 'react';
import { ChromePicker } from 'react-color';
import Switch from 'react-ios-switch';
import './ColorRangeAction.css';

export default class ColorRangeAction extends Component {

    constructor(props) {
        super(props);
        this.state = {
            lastUpdateTime: -1
        };
        this.lastSentValue = -1;
    }

    render() {
        const action = this.props.action;
        const current = action.parameter.current; // 0xff0220
        const color = {
            r: (current & 0xff0000) >> 16,
            g: (current & 0x00ff00) >> 8,
            b: current & 0x0000ff
        }

        return (
            <div>
                <p style={{
                    fontWeight: 'bold'
                }}>{action.name}</p>
                <ChromePicker
                    color={color}
                    disableAlpha={true}
                    onChange={this.handleChange.bind(this)}
                />
            </div>
        )
    }

    handleChange(color, event) {
        // remove # sign and parse hex number to integer
        const newColor = parseInt(color.hex.substring(1), 16);

        if (this.lastSentValue === newColor) return;
        this.lastSentValue = newColor;

        var currTime = new Date().getTime();
        if (currTime - this.state.lastUpdateTime > 200) {
            this.props.client.setStatus(this.props.id, this.props.action.id, newColor.toString());
            this.setState({ lastUpdateTime: currTime });
        }
        this.props.action.parameter.current = newColor;
    }
}