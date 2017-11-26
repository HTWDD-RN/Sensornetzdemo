import React, { Component } from 'react';
import SwitchAction from './Actions/SwitchAction';

class ErrorActionComponent extends Component {
    render() {
        return (
            <div style={{backgroundColor: 'red'}}>
                Unsupported action: {this.props.action.type}
            </div>
        );
    }
}

export default function Action(props) {
    const action = props.action;
    const client = props.client;
    const id = props.id;
    const actionChanged = props.actionChanged;
    switch (action.type) {
        case 'SWITCH': return <SwitchAction action={action} id={id} client={client} actionChanged={actionChanged}/>;
        default: return <ErrorActionComponent action={action} />;
    }
}
