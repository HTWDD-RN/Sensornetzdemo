import React, { Component } from "react";
import { ChromePicker } from "react-color";
import Switch from "react-ios-switch";
import "./ColorRangeAction.css";

const colorArr = [0x000000, 0x7f3200, 0x007f0a, 0x00057f, 0xffffff];

export default class ColorRangeAction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDemoRunning: false,
      lastUpdateTime: -1
    };
    this.lastSentValue = -1;
  }

  render() {
    const action = this.props.action;
    const current = action.parameter.color; // 0xff0220
    const color = {
      r: (current & 0xff0000) >> 16,
      g: (current & 0x00ff00) >> 8,
      b: current & 0x0000ff
    };

    return (
      <div>
        <p style={{
          fontWeight: "bold"
        }}>{action.name}</p>
        <ChromePicker color={color} disableAlpha={true} />
        <p>
          Demo starten:
          <Switch
            className="switch"
            checked={action.parameter.isRunning}
            onChange={this.runDemo.bind(this)}
          />
        </p>
      </div>
    );
  }

  runDemo(isChecked) {
    console.log(isChecked);
    this.props.action.parameter.isRunning = isChecked;
    if (isChecked) {
      const onComplete = function () {
        this.sendColor(colorArr, onComplete, onInterrupted);
      }.bind(this);
      const onInterrupted = function () {
        console.log("User interrupted our cool session");
      };
      this.sendColor(colorArr, onComplete, onInterrupted);
    } else {
      this.props.client.setStatus(this.props.id, this.props.action.id, "false#" + this.props.action.parameter.color)
    }
  }

  sendColor(colorArr, onComplete, onInterrupted) {
    if (colorArr.length === 0) {
      onComplete();
      return;
    } else if (!this.props.action.parameter.isRunning) {
      onInterrupted();
      return;
    }
    console.log("Setting color: ", colorArr[0]);
    this.props.client.setStatus(this.props.id, this.props.action.id, "true#" + colorArr[0])
      .then(res => {
        console.log("Updated value, got ", res, "as response");
      });
    setTimeout(
      this.sendColor.bind(this, colorArr.slice(1), onComplete, onInterrupted),
      1000
    );
  }
}
