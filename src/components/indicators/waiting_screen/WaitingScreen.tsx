import React, { Component } from 'react'
import Image from './hour_glass.svg'
import './WaitingScreen.css'

export default class WaitingScreen extends Component {
  render() {
    return (
        <div className='waiting-screen'>
            <img src={Image}></img>
            <span>Please wait...</span>
        </div>
    )
  }
}
