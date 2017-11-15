import React, {Component} from 'react';

export default class ListEntry extends Component {

    render() {
        return (
        <div>
            <li>
            Hello, I'm {this.props.number}!
            </li>
        </div>
        );
    }

}
