import React, { Component, PropTypes } from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router'

import s from './Header.sass'


export default
@connect(({cian, router}) => ({
  loading  : cian.loading,
  location : router.location,
}))
class Header extends Component {
  static propTypes = {
    loading  : PropTypes.number.isRequired,
    location : PropTypes.object.isRequired,
  }
  links = [
    {pathname: '/map', display: 'Карта'},
    {pathname: '/table', display: 'Список'},
    {pathname: '/403', display: '403'},
    {pathname: '/404', display: '404'},
  ].map((l, i) =>
    <Link key={i} className={s.link} to={l} activeClassName={s.active}>{l.display}</Link>
  )
  render () {
    return (
      <div className={s.root}>
        <Link className={s.logo} to='/'>Банк Оценщик</Link>
        {this.links}
        <img className={`${s.loader} ${this.props.loading ? s.active : ''}`} src='img/loader.gif' />
      </div>
    )
  }
}
