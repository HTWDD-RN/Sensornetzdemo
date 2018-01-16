import React, { Component } from 'react';

export default class ImageToColorAction extends Component {
    render() {
        const colorItems = this.props.colors.map((clr) => {
            return <div key={clr.color.toString()} style={{
                width: (parseFloat(clr.dominance) * 100) + "%",
                background: "#" + clr.color.toString(16),
                height: "20px"
            }}>
            </div>
        });
        return <div style={{
            width: '100%',
            display: 'flex'
        }}>
            {colorItems}
        </div>
    }
}