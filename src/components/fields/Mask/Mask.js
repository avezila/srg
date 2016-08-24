import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'

import Timeout from 'lib/Timeout'


export default
class Mask extends Component {
  static propTypes = {
    value   : PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    type     : PropTypes.string.isRequired,
    onChange : PropTypes.func.isRequired, 
  }
  constructor (props){
    super(props)
    this.state = {
      value : this.blurReplace(this.editReplace(this.toText(props.value))),
    };
  }
  editReplace (text){
    var c;
    switch (this.props.type){
      case "meter" :
        text = text.replace(/,/g,".")
        text = text.replace(/\s/g,'')
        text = text.replace(/[^\d\.]/g,"")
        let [a,b] = text.split(".").slice(0,2)
        if(!a && !b)
          return "";
        if(!a) a = "0";
        do {
          c = a;
          a = c.replace(/(\d)(\d\d\d(?:\s|$))/g,"$1 $2")
        }while(a != c);
        if(b) b = b.substr(0,2);
        text = [a]
        if(b!==undefined)
          text.push(b)
        return text.join(".");
      case "int" :
        text = text.replace(/\D/g,"")
        do {
          c = text;
          text = c.replace(/(\d)(\d\d\d(?:\s|$))/g,"$1 $2")
        }while(text != c);
        return text;
    }
    return text;
  }
  blurReplace (text){
    switch (this.props.type){
      case "meter" :
        if(text=="") return text;
        let [a,b] = text.split(".")
        if(b == "" || b == undefined) b = "00";
        else if (b.length == 1) b = b+"0";
        return [a,b].join(".");
    }
    return text;
  }
  toText  (val){
    if(val==undefined) return "";
    return ""+val
  }
  fromText (text){
    if (text == "") return undefined;
    switch (this.props.type){
      case "meter":
      case "int":
        text = text.replace(/\s/g,"");
        break;
    }
    return +text;
  }  
  onInput (e){
    this.edit = true;
    let input = e.target;
    let ereplace = this.editReplace(input.value);
    let breplace = this.blurReplace(ereplace);
    let value  = this.fromText(breplace);
    if (this.state.value != ereplace)
      this.setState({value:ereplace});  
    else
      input.value = ereplace;
    
    if(value != this.props.value)
      this.onChange(value);
  }
  onBlur(){
    this.edit = false;
    let input = ReactDOM.findDOMNode(this.refs.input);
    let ereplace = this.editReplace(input.value);
    let breplace = this.blurReplace(ereplace);
    let value  = this.fromText(breplace);
    this.setState({value:breplace});

    if(value != this.props.value)
      this.onChange(value);
  }
  componentWillReceiveProps (props){
    if(this.edit)
      return;
    if(this.edit){
      this.setState({value:this.editReplace(this.toText(props.value))});
    }else {
      this.setState({value:this.blurReplace(this.editReplace(this.toText(props.value)))});
    }
  }

  onChange (value) {
    Timeout(this.timeout,500)
  }

  timeout = ()=>{
    this.props.onChange(this.fromText(this.state.value));
  }
 
  render () {
    return (
      <input
        className="form-control"
        ref="input"
        value={this.state.value}
        type="text"
        onChange={::this.onInput}
        onBlur={::this.onBlur}
         />
    )
  }
}