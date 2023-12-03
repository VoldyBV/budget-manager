import React, { Component } from 'react'
import Image from './check_mark.svg';
import './SuccessScreen.css';

export default class SuccessScreen extends Component {
  render() {
    return (
      <div className='success-screen'>
        <img src={Image}></img>
        <span>Record saved!</span>
      </div>
    )
  }
}
