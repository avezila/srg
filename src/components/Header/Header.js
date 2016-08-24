import React, { Component, PropTypes } from 'react'
import {Link} from 'react-router'
import {connect} from 'react-redux'

import s from './Header.sass'

@connect(({cian,router}) =>({
  loading : cian.loading,
  location : router.location, // for catch location updates
}))
class Header extends Component {
  render () {
    const links = [
      {pathname : '/map', display : "Карта"},
      {pathname : '/table', display : "Список"},
      {pathname : '/403', display : "403"},
      {pathname : '/404', display : "404"},
    ].map((l,i) =>
      <Link key={i} className={s.link} to={l} activeClassName={s.active}>{l.display}</Link>
    )
    return (
      <div className={s.root}>
        <Link className={s.logo} to="/">Банк Оценщик</Link>
        {links}
        <img className={`${s.loader} ${this.props.loading? s.active:""}`} src="img/loader.gif"></img>
      </div>
    )
  }
}

export default Header