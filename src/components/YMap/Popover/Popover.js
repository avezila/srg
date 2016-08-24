import React, { Component, PropTypes } from 'react'
import RBPopover from "react-bootstrap/es/Popover"

import {OfferShort,Nano} from "components"
import s from './Popover.sass'


class Popover extends Component {
  render (){
    let title = this.props.offers[0].rawAddress;
    return (
      <RBPopover
        className={s.root}
        placement="top"
        id="popover-basic" >
        <div className={s.block}>
          <div className={s.header}>
            <div className={s.title}>{title}</div>       
            <div
              className={s.remove}
              to="/map"
              onClick={this.props.onClose}>×</div>
          </div>
          <Nano className={s.content}>
            {this.props.offers.map(o=>(
              <OfferShort key={o.id} offer={o} />
            ))}
          </Nano>
        </div>
      </RBPopover>
    )
  }
}

export default Popover;