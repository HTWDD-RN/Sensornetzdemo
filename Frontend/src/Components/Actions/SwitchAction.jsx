import React, { Component } from 'react';
import Switch from 'react-ios-switch';
import './SwitchAction.css';

export default class SwitchAction extends Component {

    render() {
        const action = this.props.action;

        return (
        <div className='switch-container'>
            <p>{action.name}: <Switch 
                                    className='switch'
                                    checked={ action.parameter.current === action.parameter.on }
                                    onChange={this._onChange.bind(this)}
            /></p>
        </div>
    );}

    _onChange() {
        const on = this.props.action.parameter.on;
        const off = this.props.action.parameter.off;
        const newValue = this.props.action.parameter.current === on ? off : on;

        this.props.client.setStatus(this.props.id, this.props.action.id, newValue)
            .then(res => {
                console.log('Updated value, got ', res, 'as response');
            })
    }
}
