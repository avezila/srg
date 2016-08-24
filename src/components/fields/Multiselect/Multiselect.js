import React, { Component, PropTypes } from 'react'
import RBMultiselect from 'react-bootstrap-multiselect'

import Timeout from 'lib/Timeout'


export default
class Multiselect extends Component {
  static propTypes = {
    value     : PropTypes.shape({
      data : PropTypes.array.isRequired,
    }).isRequired,
    onChange  : PropTypes.func.isRequired,
  }
  changed = [];
  onChange (){
    this.changed.push(arguments);
    Timeout(this.timeout,500);
  }
  timeout = ()=>{
    let fields = {};
    for (let obj of this.props.value.data)
      if(obj.selected)
        fields[obj.value] = true;

    for(let [option,checked,select] of this.changed)
      if(checked) fields[option.val()] = true
      else        delete fields[option.val()]
    this.changed = [];

    fields = Object.keys(fields)
    this.props.onChange(fields)
  }
  render () {
    return (
      <RBMultiselect
        nonSelectedText="Не важно"
        nonSelectedText="Не важно"
        nSelectedText=" выбрано"
        allSelectedText="Все"
        numberDisplayed={2}
        data={this.props.value.data}
        onChange={::this.onChange}
        ref="select"
        multiple />
    )
  }
}