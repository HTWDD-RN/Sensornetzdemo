import React, { Component } from 'react';

export default class SwitchAction extends Component {

    render() {
        const action = this.props.action;

        return (
        <div>
            {action.name}: 
            <input 
                ref="switch" 
                checked={ action.parameter.current === action.parameter.on } 
                onChange={this._onChange.bind(this)}
                className="switch" 
                type="checkbox" />
        </div>
    );}

    _onChange() {
        const on = this.props.action.parameter.on;
        const off = this.props.action.parameter.off;
        const newValue = this.props.action.parameter.current === on ? off : on;

        this.props.client.setStatus(this.props.id, this.props.action.id, newValue)
            .then(res => {
                let action = this.props.action;
                action.parameter.current = res.value;
                this.props.actionChanged(action);
            })
    }
}
