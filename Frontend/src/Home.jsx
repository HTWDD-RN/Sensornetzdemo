import React, {Component} from 'react';
import ListEntry from './Components/ListEntry'

export default class Home extends Component {

    constructor() {
        super()
        this.state = {
            items: []
        }
    }

    render() {
        const entries = this.state.items.map(n => <ListEntry key={n} number={n}/>)

        return (
        <div>
            <button onClick={this.buttonClicked.bind(this)}>HELLO!</button>
            <ul>
                {entries}
            </ul>
        </div>
        );
    }

    buttonClicked() {
        const newItems = this.state.items.concat([this.randomNumber()])
        this.setState({items: newItems})
    }

    randomNumber() {
        let arr = new Int32Array(1);
        window.crypto.getRandomValues(arr);
        return arr[0];
    }

}
