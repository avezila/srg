import React, { Component, PropTypes } from 'react'
import {connect} from 'react-redux'
import RBPopover from 'react-bootstrap/es/Popover'

import {OfferShort, Nano} from 'components'

import s from './Popover.sass'


export default
@connect(({cian}) => ({
  favoriteIDs   : cian.context.favoriteIDs,
  addedOfferIDs : cian.context.enviroment.addedOfferIDs,
}))
class Popover extends Component {
  static propTypes = {
    favoriteIDs   : PropTypes.array.isRequired,
    addedOfferIDs : PropTypes.array,
    offers        : PropTypes.array.isRequired,
    onClose       : PropTypes.func.isRequired,
  }
  static defaultProps = {
    addedOfferIDs: [],
  }
  render () {
    let title = this.props.offers[0].rawAddress
    let favoriteIDs = {}
    let addedOfferIDs = {}
    this.props.favoriteIDs.map(v => { favoriteIDs[v] = true })
    this.props.addedOfferIDs.map(v => { addedOfferIDs[v] = true })

    return (
      <RBPopover
        className={s.root}
        placement='top'
        id='popover-basic' >
        <div className={s.block}>
          <div className={s.header}>
            <div className={s.title}>{title}</div>
            <div
              className={s.remove}
              to='/map'
              onClick={this.props.onClose}>×</div>
          </div>
          <Nano className={s.content}>
            {this.props.offers.map(o => (
              <OfferShort key={o.id} offer={o} isFavorite={favoriteIDs[o.id]} isAdded={addedOfferIDs[o.id]} />
            ))}
          </Nano>
        </div>
      </RBPopover>
    )
  }
}
