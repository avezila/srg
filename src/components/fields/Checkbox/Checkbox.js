import React, { Component, PropTypes } from 'react'
import RBCheckbox from "react-bootstrap/es/Checkbox"

import Timeout from 'lib/Timeout'

import s from "./Checkbox.sass"


export default
class Checkbox extends Component {
  static propTypes = {
    value     : PropTypes.object.isRequired,
    onChange  : PropTypes.func.isRequired,
  }
  constructor (props){
    super(props)
    this.state = {
      value : props.value.data == true,
    }
  }
  onChange (e){
    this.setState({
      value : e.target.checked == true,
    });
    Timeout(this.timeout)
  }
  timeout = ()=>{
    this.props.onChange(this.state.value || undefined)
  }
  componentWillReceiveProps (props){
    this.setState({
      value : props.value.data == true,
    });
  }
  render () {
    return (
      <RBCheckbox 
        checked={this.state.value}
        onChange={::this.onChange}
        className={s.root}>
        <div className={s.title}>{this.props.value.title}</div>
      </RBCheckbox>
    )
  }
}