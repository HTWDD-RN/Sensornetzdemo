import React, { Component } from 'react';

export default class SwitchAction extends Component {

    constructor(props) {
        super(props);
        this.state = {
            action: props.action
        }
    }

    render() {
        const action = this.state.action;

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
        const on = this.state.action.parameter.on;
        const off = this.state.action.parameter.off;
        const newValue = this.state.action.parameter.current === on ? off : on;

        this.props.client.setStatus(this.props.id, this.state.action.id, newValue)
            .then(res => {
                let action = this.state.action;
                action.parameter.current = res.value;
                this.setState({action: action})
            })
    }
}
