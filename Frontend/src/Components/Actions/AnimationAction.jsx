import React, { Component } from 'react';
import { RadioGroup, RadioButton } from 'react-radio-buttons';

export default class AnimationAction extends Component {

    render() {
        const action = this.props.action;
        const current = action.parameter.current;
        const options = action.parameter.options;

        const radioButtons = options.map((val) => {
            return <RadioButton key={val} value={val}>{val}</RadioButton>
        });


        return (
            <div>
                <p style={{
                    fontWeight: 'bold'
                }}>{action.name}</p>
                <RadioGroup onChange={this.handleChange.bind(this)} value={current} horizontal>
                    {radioButtons}
                </RadioGroup>
            </div>
        )
    }

    handleChange(e) {
        if (this.props.action.parameter.current !== e) {
            this.props.client.setStatus(this.props.id, this.props.action.id, e);
        }
    }

}