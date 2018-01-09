import React, { Component } from 'react';
import SwitchAction from './Actions/SwitchAction';
import RangeAction from './Actions/RangeAction';
import ColorRangeAction from './Actions/ColorRangeAction';

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
    switch (action.type) {
        case 'SWITCH': return <SwitchAction action={action} id={id} client={client}/>;
        case 'RANGE': return <RangeAction action={action} id={id} client={client} />;
        case 'COLOR_RANGE': return <ColorRangeAction action={action} id={id} client={client} />;
        default: return <ErrorActionComponent action={action} />;
    }
}
