import React, { Component } from 'react';
import { ChromePicker } from 'react-color';
import Switch from 'react-ios-switch';
import './ColorRangeAction.css';

const colorArr = [[0, 0, 0], [127, 50, 0], [0, 127, 10], [0, 5, 127], [255, 255, 255]];

export default class ColorRangeAction extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isDemoRunning: false
        };
    }

    render() {
        const action = this.props.action;
        const current = action.parameter.current; // [r, g, b]
        const color = {
            r: current[0],
            g: current[1],
            b: current[2]
        }

        return (
            <div>
                <ChromePicker
                    color={color}
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
        const newColor = [color['rgb']['r'], color['rgb']['g'], color['rgb']['b']];
        this.props.client.setStatus(this.props.id, this.props.action.id, JSON.stringify(newColor))
            .then(res => {
                console.log('Updated value, got ', res, 'as response');
            });
    }

    runDemo(isChecked) {
        console.log("starting demo");
        this.setState(
            {
                isDemoRunning: isChecked
            }
        );
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