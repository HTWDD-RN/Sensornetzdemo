import React, {Component} from 'react';
import ListEntry from './Components/ListEntry'
import ApiClient from './Models/APIClient';

export default class Home extends Component {

    constructor() {
        super()

        this.client = new ApiClient('http://localhost:4000');

        this.state = {
            items: []
        }
    }

    componentDidMount() {
        this.reloadAllSensors();
    }

    render() {
        const entries = this.state.items.map(n => <ListEntry key={n} number={n}/>)

        return (
        <div>
            <button onClick={this.reloadAllSensors.bind(this)}>HELLO!</button>
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

    reloadAllSensors() {
        this.client.allResources()
        .catch(err => alert(err))
        .then(res => this.setState({
            items: res || []
        }));
    }

}
