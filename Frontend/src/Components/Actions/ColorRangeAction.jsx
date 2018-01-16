import React, { Component } from 'react';
import { ChromePicker } from 'react-color';
import Switch from 'react-ios-switch';
import './ColorRangeAction.css';

const colorArr = [0x000000, 0x7f3200, 0x007f0a, 0x00057f, 0xffffff];

export default class ColorRangeAction extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isDemoRunning: false,
            timeoutId: -1
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
                <ChromePicker
                    color={color}
                    disableAlpha={true}
                    onChange={this.handleChange.bind(this)}
                />
                <p>Demo starten:
                <Switch
                        className='switch'
                        checked={this.state.isDemoRunning}
                        onChange={this.runDemo.bind(this)}
                    />
                </p>
            </div>
        )
    }

    handleChange(color, event) {
        // remove # sign and parse hex number to integer
        const newColor = parseInt(color.hex.substring(1), 16);

        if (this.lastSentValue === newColor) return;
        this.lastSentValue = newColor;

        clearTimeout(this.state.timeoutId);
        const timeoutId = setTimeout(function (newColor) {
            this.props.client.setStatus(this.props.id, this.props.action.id, newColor.toString());
        }.bind(this, newColor), 200);
        this.props.action.parameter.current = newColor;
        this.setState({ timeoutId: timeoutId });
    }

    runDemo(isChecked) {
        console.log("starting demo");
        this.setState({ isDemoRunning: isChecked });

        if (this.state.isDemoRunning) {
            const onComplete = function () {
                this.sendColor(colorArr, onComplete, onInterrupted);
            }.bind(this);
            const onInterrupted = function () {
                console.log("User interrupted our cool session");
            }
            this.sendColor(colorArr, onComplete, onInterrupted);
        }
    }

    sendColor(colorArr, onComplete, onInterrupted) {
        if (colorArr.length === 0) {
            onComplete();
            return;
        } else if (!this.state.isDemoRunning) {
            onInterrupted();
            return;
        }
        console.log("Setting color: ", colorArr[0]);
        this.props.client.setStatus(this.props.id, this.props.action.id, JSON.stringify(colorArr[0])).then(res => {
            console.log('Updated value, got ', res, 'as response');
        });
        setTimeout(this.sendColor.bind(this, colorArr.slice(1), onComplete, onInterrupted), 1000);
    }



}