import React, { Component } from 'react';

export default class RangeAction extends Component {

    render() {
        const action = this.props.action;

        return (
            <div>
                <input type='range' min={action.parameter.min} max={action.parameter.max} value={action.parameter.current} onChange={v => this._onChange(v)} />
            </div>
        )
    }

    _onChange(v) {
        console.log(v);
    }

}