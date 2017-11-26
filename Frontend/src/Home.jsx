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
        const entries = this.state.items.map(n => 
            <ListEntry 
                key={n.id} 
                resource={n} 
                client={this.client}/>)

        return (
        <div className='container'>
            <div className='navBar'>
                <p>Sensornetze Demo</p>
                <button
                    className={this.state.loading ? 'button disabled' : 'button'}
                    onClick={this.reloadAllSensors.bind(this)}>Neu Laden
                </button>
            </div>
            <div>
                <ul>
                    {entries}
                </ul>
            </div>
        </div>
        );
    }

    reloadAllSensors() {
        if (this.state.loading) return;

        this.setState({loading: true});
        this.client.allResources()
        .catch(err => alert(err))
        .then(res => this.setState({
            items: res || [],
            loading: false
        }));
    }

}
