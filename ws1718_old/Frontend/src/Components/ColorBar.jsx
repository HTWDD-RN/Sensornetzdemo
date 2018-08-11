import React, { Component } from 'react';

export default class ImageToColorAction extends Component {
    render() {
        const colorItems = this.props.colors.map((clr) => {
            var clrHex = clr.color.toString(16);
            if (clrHex.length === 5) {
                clrHex = "0" + clrHex;
            }
            return <div key={clr.color.toString()} style={{
                width: (parseFloat(clr.dominance) * 100) + "%",
                background: "#" + clrHex,
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