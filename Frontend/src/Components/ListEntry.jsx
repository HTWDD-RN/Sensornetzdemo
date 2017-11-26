import React, {Component} from 'react';
import Action from './Action';

export default class ListEntry extends Component {

    render() {
        const actions = this.props.resource.actions.map(a => 
            <Action 
                key={a.id}
                id={this.props.resource.id}
                action={a} 
                client={this.props.client}
                actionChanged={this.props.actionChanged}
                />);

        return (
        <div>
            <li>
            {this.props.resource.name}
            {actions}
            </li>
        </div>
        );
    }

}
