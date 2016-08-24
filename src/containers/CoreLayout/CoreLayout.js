import React, {Component, PropTypes} from 'react'

import Header from 'components/Header'
import s from './CoreLayout.sass'

import Errors from "containers/Errors"


class CoreLayout extends Component {
  render () {
    return (
      <div className={s.root}>
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


export default CoreLayout