import React, { Component, PropTypes } from 'react'
import {connect} from 'react-redux'

import {removeError} from 'actions'
import ErrorItem from './ErrorItem'

import s from './Errors.sass'


export default
@connect(({cian}) => ({
  errors: cian.errors,
}), {removeError})
class Errors extends Component {
  static propTypes = {
    errors      : PropTypes.array.isRequired,
    removeError : PropTypes.func.isRequired,
  }
  state = {
    show: false,
  }
  times = {}

  onClick = (id) => {
    this.times[id] = 60 * 1000 + new Date().getTime()
    this.setState({
      show: this.state.show !== id && id,
    })
  }
  onRemove = (id) => {
    this.props.removeError({id})
  }
  onTimer () {
    let {errors} = this.props

    if (errors.length === 0) return

    let next = Infinity
    let time = new Date().getTime()

    errors.map(item => {
      let itime = this.times[item.id] || item.time
      if (itime < time) {
        this.onRemove(item.id)
        delete this.times[item.id]
      } else if (itime < next) {
        next = itime
      }
    })
    if (next !== Infinity) {
      this.timer = setTimeout(::this.onTimer, next - time)
    } else {
      this.timer = undefined
    }
  }
  render () {
    if (!this.timer) this.onTimer()

    return (
      <div className={s.root}>
        {this.props.errors.map(item => (
          <ErrorItem {...item}
            key={item.id}
            onClick={this.onClick}
            onRemove={this.onRemove}
            show={this.state.show === item.id} />
        ))}
      </div>
    )
  }
}
