import React, { Component, PropTypes } from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router'

import {Nano, OfferFull} from 'components'
import Table from './Table'
import {changeLayout,tableScroll} from 'actions'
import vars from 'styles/global.var.scss'
import Timeout from 'lib/Timeout'

import s from './Content.sass'


export default
@connect(({router,cian})=>({
  pathname  : router.location.pathname,
  layout    : cian.layout,
  scroll    : cian.tableScroll
}),{changeLayout,tableScroll})
class Content extends Component {
  static propTypes = {
    pathname      : PropTypes.string.isRequired,
    layout        : PropTypes.object.isRequired,
    scroll        : PropTypes.number.isRequired,
    changeLayout  : PropTypes.func.isRequired,
    tableScroll   : PropTypes.func.isRequired,
  }
  update (){
    this.refs.nano.update();
  }
  onChange (){
    if(!this.refs.nano) return;
    this.props.changeLayout({center:[0,this.refs.nano.height()]});
  }
  onScroll (){
    Timeout(this.timeout,null,500,false)
  }
  timeout =  ()=> {
    this.props.tableScroll({scroll:this.refs.nano.scrollTop()});
  }

  componentWillUnmount (){
    this.props.changeLayout({center:[0,0]});
  }
  render () {
    let {left, right} = this.props.layout;
    let {pathname, scroll}   = this.props;
    let style = {
      left  : left [0]+vars.gutter*2,
      right : right[0]+vars.gutter*2,
    }
    return (
      <Nano
        onScroll={::this.onScroll}
        onChange={::this.onChange}
        ref="nano"
        byContent={true}
        className={s.root}
        style={style}>

        <Link className={s.remove} to="/map">×</Link>
        {
          pathname.match('table')?
            <Table scroll={scroll} update={::this.update} /> :
          pathname.match('offer-')? 
            <OfferFull update={::this.update} /> : null
        }
      </Nano>
    )
  }
}