import React, { Component } from 'react'
import Image from './spinner.svg'
import './Preloader.css';

interface PreloaderProps {
}

export default class Preloader extends Component<PreloaderProps> {
  render() {
    return (
      <div className='preloader'>
        <img src={Image} />
        <span id='preloader-text'>Text</span>
      </div>
    )
  }
}
