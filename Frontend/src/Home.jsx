import React, { Component } from 'react';
import ListEntry from './Components/ListEntry'
import ApiClient from './Models/APIClient';
import './Home.css';

export default class Home extends Component {

    constructor(props) {
        super(props)

        this.client = new ApiClient(this.props.baseUrl);

        this.state = {
            items: [],
            loading: false
        }
    }

    componentDidMount() {
        this.reloadAllSensors();
    }

    render() {
        const entries = this.state.items.map((n, i) => 
            <ListEntry 
                key={n.id} 
                resource={n} 
                client={this.client}
                actionChanged={a => this.actionChanged(a, i)}
                />)

        return (
        <div className='container'>
            <div className='navBar'>
                <p>Sensornetze Demo</p>
                <button
                    onClick={this.reloadAllSensors.bind(this)}>Neu Laden
                </button>
            </div>
            <div className='collection'>
                {entries}
            </div>
        </div>
        );
    }

    actionChanged(action, i) {
        let items = this.state.items;
        items[i].action = action;
        this.setState({
            items: items
        });
    }

    reloadAllSensors() {
        if (this.state.loading) return;

        this.setState({loading: true});
        this.client.allResources()
            .catch(err => alert(err))
            .then(res => this.setState({
                items: res,
                loading: false
            }));
    }

}
