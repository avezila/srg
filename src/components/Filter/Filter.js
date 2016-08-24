import React, { Component, PropTypes } from 'react'
import {connect} from 'react-redux'


import {Nano} from 'components'
import {filterChange,changeLayout} from 'actions'
import s from './Filter.sass'

import _set from "lodash/set"
import _get from "lodash/get"


import {Multiselect,FromTo,Checkbox,Words} from "components/fields"
import {FilterToFields} from 'const/Cian'

import Glyphicon from 'react-bootstrap/es/Glyphicon'
import vars from 'styles/global.var.scss'


@connect(({cian}) =>({
  filter : cian.filter,
}), {filterChange,changeLayout})
class Filter extends Component {
  constructor (props){
    super(props)
    this.state = {open : true}
  }
  onChange (field,value){
    let newFilter = {
      ...(this.props.filter),
    }
    _set(newFilter,field,value);

    this.props.filterChange({filter:newFilter})
  }
  SubTitle  (title,key){
    return (
      <div key={"t:"+key} className={s.row}>
        <div  className={s.subtitle}>{title}</div>
      </div>
    )
  }
  Multiselect  (val,key){
    return (
      <div key={"m:"+key} className={s.row}>
        <Multiselect value={val} onChange={this.onChange.bind(this,key)} />
      </div>
    )
  }
  FromTo  (val,key){
    return (
      <div key={"ft:"+key} className={s.row}>
        <FromTo value={val} onChange={this.onChange.bind(this,key)} />
      </div>
    )
  }
  Checkbox (val,key){
    return (
      <div key={"cb:"+key} className={s.row}>
        <Checkbox value={val} onChange={this.onChange.bind(this,key)} />
      </div>
    )
  }
  Words (val,key){
    return (
      <div key={"w:"+key} className={s.row}>
        <Words value={val} onChange={this.onChange.bind(this,key)} />
      </div>
    )
  }
  toggle (){
    this.setState({ open: !this.state.open })
  }
  matchLayout (){
    if(!this.refs.root)return;
    if(this.state.open)
      this.props.changeLayout({left:[+vars.filterWidth,this.refs.root.height()]})
    else
      this.props.changeLayout({left:[+vars.filterWidthMin,this.refs.root.height()]})
  }
  render () {
    let fields = FilterToFields(this.props.filter)
    let form = [];
    
    for (let key in fields){
      let o = _get(fields,key)//fields[key];
      if(o.hide)
        continue;
      if(o.title)
        form.push(this.SubTitle(o.title,key));
      if(o.multiselect)
        form.push(this.Multiselect(o.multiselect,key));
      else if (o.fromto)
        form.push(this.FromTo(o.fromto,key));
      else if (o.checkbox)
        form.push(this.Checkbox(o.checkbox,key));
      else if (o.words)
        form.push(this.Words(o.words,key));
    }
    

    return (
      <Nano onChange={::this.matchLayout} ref="root" byContent={true} className={`${s.root} ${!this.state.open && s.close}`}>
        <div className={s.title} onClick={::this.toggle}>
          <span className={s.title_text}>Фильтр</span>
          { this.state.open ? <Glyphicon className={s.glyph} glyph="menu-down"  />
                            : <Glyphicon className={s.glyph} glyph="menu-right" /> }
        </div>
        <div className={s.content}>
          {this.state.open ? form : undefined}
        </div>
      </Nano>
    )
  }
}

export default Filter
