import React, { Component } from 'react';
import { ChromePicker } from 'react-color';
import './ColorRangeAction.css';

export default class ColorRangeAction extends Component {

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
                    color = { color }
                    onChange={ this.handleChange.bind(this) }
                />
            </div>
        )
    }

    handleChange(color, event) {
        // color = {
        //   hex: '#333',
        //   rgb: {
        //     r: 51,
        //     g: 51,
        //     b: 51,
        //     a: 1,
        //   },
        //   hsl: {
        //     h: 0,
        //     s: 0,
        //     l: .20,
        //     a: 1,
        //   },
        // }
        const newColor = [color['rgb']['r'], color['rgb']['g'], color['rgb']['b']];
        this.props.client.setStatus(this.props.id, this.props.action.id, JSON.stringify(newColor))
            .then(res => {
                console.log('Updated value, got ', res, 'as response');
            });
    }


}