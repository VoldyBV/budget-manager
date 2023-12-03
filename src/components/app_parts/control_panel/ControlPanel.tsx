import React, { Component } from 'react'
import './ControlPanel.css';

interface ControlPanelProps {
    switchComponent: (param: string) => void
}
interface ControlPanelState {

}

export default class ControlPanel extends Component<ControlPanelProps, ControlPanelState> {
  render() {
    return (
      <div className='control-panel'>
        <button onClick={() => {this.props.switchComponent('incomes')}}>incomes</button>
        <button onClick={() => {this.props.switchComponent('expenses')}}>expenses</button>
        <button onClick={() => {this.props.switchComponent('reports')}}>reports</button>
      </div>
    )
  }
}
