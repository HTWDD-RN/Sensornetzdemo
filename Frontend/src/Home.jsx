import React, {Component} from 'react';
import ListEntry from './Components/ListEntry'
import ApiClient from './Models/APIClient';
import LoadingIndicator from 'react-loading-indicator';

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

        const loadingIndicator = this.state.loading ? <LoadingIndicator /> : null;

        return (
        <div>
            <button onClick={this.reloadAllSensors.bind(this)}>Reload</button>
            {loadingIndicator}
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

    reloadAllSensors() {
        this.setState({loading: true});
        this.client.allResources()
        .catch(err => alert(err))
        .then(res => this.setState({
            items: res || [],
            loading: false
        }));
    }

}
