import React, { Component } from 'react'
import './Navbar.css'
import { INavbarBtn } from '../../../models/navbar_btns.interface'

interface NavbarProps {
  controls: INavbarBtn[]
}

export default class Navbar extends Component<NavbarProps> {
  constructor(props: NavbarProps) {
    super(props)
  }
  render() {
    return (
      <div className='navbar'>
        {this.props.controls.map((item: INavbarBtn, index: number): React.ReactNode =>  {
          return <button key={index} onClick={item.onClick}>{item.button_text}</button>
        })}
      </div>
    )
  }
}
