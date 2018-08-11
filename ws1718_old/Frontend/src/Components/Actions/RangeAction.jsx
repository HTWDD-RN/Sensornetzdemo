import React, { Component } from 'react';

export default class RangeAction extends Component {

    render() {
        const action = this.props.action;

        return (
            <div>
                <input type='range'
                    min={action.parameter.min}
                    max={action.parameter.max}
                    value={action.parameter.current}
                    onChange={this._onChange.bind(this)} />
            </div>
        )
    }

    _onChange(e) {
        const newValue = e.target.value;
        this.props.client.setStatus(this.props.id, this.props.action.id, newValue)
            .then(res => {
                console.log('Updated value, got ', res, 'as response');
            });
    }

}