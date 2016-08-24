import React, { Component, PropTypes } from 'react'
import {connect} from 'react-redux'
import Glyphicon from 'react-bootstrap/es/Glyphicon'

import {changeLayout} from 'actions'
import {Nano, OfferShort} from 'components'
import vars from 'styles/global.var.scss'

import s from './Favorite.sass'


export default
@connect(({cian}) =>({
  favoriteIDs : cian.context.favoriteIDs,
  offers      : cian.offers,
}),{changeLayout})
class Favorite extends Component {
  static propTypes = {
    favoriteIDs   : PropTypes.array.isRequired,
    offers        : PropTypes.object.isRequired,
    changeLayout  : PropTypes.func.isRequired, 
  }
  static defaultProps = {
    favoriteIDs : [],
  }
  state = {
    open : true,
  }
  toggle (){
    this.setState({ open: !this.state.open })
  }
  matchLayout (){
    if(!this.refs.root) return;
    if(this.state.open)
      this.props.changeLayout({right:[+vars.favoriteWidth,   this.refs.root.height()]})
    else
      this.props.changeLayout({right:[+vars.favoriteWidthMin,this.refs.root.height()]})
  }
  render () {
    let {offers, favoriteIDs} = this.props;

    let rows = favoriteIDs.filter(id=>offers[id]).map(id=>
      <OfferShort key={id} offer={offers[id]} />
    )
    let isContent = this.state.open && rows.length != 0;

    return (
      <Nano
        onChange={::this.matchLayout}
        ref="root" 
        byContent={true} 
        className={`${s.root} ${!isContent && s.close}`} >
        <div className={s.title} onClick={::this.toggle}>
          <span className={s.title_text}>Избранное</span>
          { this.state.open ? <Glyphicon className={s.glyph} glyph="menu-down"  />
                            : <Glyphicon className={s.glyph} glyph="menu-right" /> }
        </div>
        {isContent && <div className={s.content}>{rows}</div>}
      </Nano>
    )
  }
}