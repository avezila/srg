import React, { Component, PropTypes } from 'react'
import {connect} from 'react-redux'
import Glyphicon from 'react-bootstrap/es/Glyphicon'
import _set from 'lodash/set'
import _get from 'lodash/get'

import {Nano} from 'components'
import {Multiselect, FromTo, Checkbox, Words} from 'components/fields'
import {filterChange, changeLayout} from 'actions'
import {FilterToFields} from 'const/Cian'
import vars from 'styles/global.var.scss'

import s from './Filter.sass'


export default
@connect(({cian}) => ({
  filter: cian.filter,
}), {filterChange, changeLayout})
class Filter extends Component {
  static propTypes = {
    filter       : PropTypes.object.isRequired,
    filterChange : PropTypes.func.isRequired,
    changeLayout : PropTypes.func.isRequired,
  }
  state = {
    open: true,
  }
  onChange (field, value) {
    let newFilter = {
      ...(this.props.filter),
    }
    _set(newFilter, field, value)

    this.props.filterChange({filter: newFilter})
  }
  bindOnChange = key => {
    if (!this[`onChange${key}`]) {
      this[`onChange${key}`] = this.onChange.bind(this, key)
    }
    return this[`onChange${key}`]
  }
  SubTitle  (title, key) {
    return (
      <div key={'t:' + key} className={s.row}>
        <div  className={s.subtitle}>{title}</div>
      </div>
    )
  }
  Multiselect  (val, key) {
    return (
      <div key={'m:' + key} className={s.row}>
        <Multiselect value={val} onChange={this.bindOnChange(key)} />
      </div>
    )
  }
  FromTo  (val, key) {
    return (
      <div key={'ft:' + key} className={s.row}>
        <FromTo value={val} onChange={this.bindOnChange(key)} />
      </div>
    )
  }
  Checkbox (val, key) {
    return (
      <div key={'cb:' + key} className={s.row}>
        <Checkbox value={val} onChange={this.bindOnChange(key)} />
      </div>
    )
  }
  Words (val, key) {
    return (
      <div key={'w:' + key} className={s.row}>
        <Words value={val} onChange={this.bindOnChange(key)} />
      </div>
    )
  }
  toggle = () => {
    this.setState({ open: !this.state.open })
  }
  matchLayout = () => {
    if (!this.refs.root) return
    if (this.state.open) {
      this.props.changeLayout({left: [+vars.filterWidth, this.refs.root.height()]})
    } else {
      this.props.changeLayout({left: [+vars.filterWidthMin, this.refs.root.height()]})
    }
  }
  render () {
    let fields = FilterToFields(this.props.filter)
    let rows = []

    for (let key in fields) {
      let o = _get(fields, key)
      if (o.hide) continue

      if (o.title) {
        rows.push(this.SubTitle(o.title, key))
      }
      if (o.multiselect) {
        rows.push(this.Multiselect(o.multiselect, key))
      } else if (o.fromto) {
        rows.push(this.FromTo(o.fromto, key))
      } else if (o.checkbox) {
        rows.push(this.Checkbox(o.checkbox, key))
      } else if (o.words) {
        rows.push(this.Words(o.words, key))
      }
    }

    return (
      <Nano onChange={this.matchLayout} ref='root' byContent className={`${s.root} ${!this.state.open && s.close}`}>
        <div className={s.title} onClick={this.toggle}>
          { this.state.open ? <Glyphicon className={s.glyph} glyph='menu-down'  />
                            : <Glyphicon className={s.glyph} glyph='menu-right' /> }
          <span className={s.title_text}>Фильтр</span>
        </div>
        <div className={s.content}>
          {this.state.open ? rows : undefined}
        </div>
      </Nano>
    )
  }
}
