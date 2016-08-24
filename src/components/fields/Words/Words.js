import React, { Component, PropTypes } from 'react'
import { WithContext as ReactTags } from 'react-tag-input/lib/ReactTags';

import Timeout from 'lib/Timeout'

import s from "./Words.sass"


export default
class Words extends Component {
  static propTypes = {
    value     : PropTypes.shape({
      data : PropTypes.array.isRequired,
    }).isRequired,
    onChange  : PropTypes.func.isRequired,
  }
  constructor (props){
    super(props)
    this.state = {
      value : this.toState(props.value.data),
    };
  }
  toState (val=[]){
    return val.map((v,i)=>({id:i,text:v}))
  }
  fromState (val=[]){
    return val.map(v=>v.text)
  }
  componentWillReceiveProps (props){
    this.setState({
      value : this.toState(props.value.data),
    })
  }
  onChange (tags){
    this.setState({
      value : tags,
    });
    Timeout(this.timeout)
  }
  timeout = ()=> {
    this.props.onChange(this.fromState(this.state.value));
  }
  handleDelete(i) {
    let tags = [...this.state.value];
    tags.splice(i, 1);
    this.onChange(tags);
  }
  handleAddition(tag) {
    let tags = [...this.state.value];
    tags.push({
        id: tags.length + 1,
        text: tag
    });
    this.onChange(tags);
  }
  render () {
    return (
      <ReactTags
        placeholder=""
        tags={this.state.value}
        handleDelete={::this.handleDelete}
        handleAddition={::this.handleAddition}
        handleInputBlur={::this.handleAddition}
        autofocus={false}
        autocomplete={false}
      />
    )
  }
}