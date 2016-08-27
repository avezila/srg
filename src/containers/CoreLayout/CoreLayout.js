import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'

import Header from 'components/Header'
import s from './CoreLayout.sass'

import Errors from 'containers/Errors'


export default
@connect(({cian}) => ({
  loading: cian.loading,
}))
class CoreLayout extends Component {
  static propTypes = {
    loading  : PropTypes.number.isRequired,
    children : PropTypes.node.isRequired,
  }
  render () {
    return (
      <div className={`${s.root} ${this.props.loading ? s.loading : ''}`}>
        <div className={s.header}>
          <Header />
        </div>
        <div className={s.content}>
          {this.props.children}
        </div>
        <Errors />
      </div>
    )
  }
}
