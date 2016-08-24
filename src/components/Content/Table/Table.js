import React, { Component, PropTypes } from 'react'
import {connect} from 'react-redux'

import {OfferWide} from 'components'
import vars from 'styles/global.var.scss'

import s from './Table.sass'


export default
@connect(({cian})=>({
  offers : cian.offers,
  offerIDs : cian.offerIDs,
})) 
class Table extends Component {
  static propTypes = {
    update    : PropTypes.func.isRequired,
    offers    : PropTypes.object.isRequired,
    offerIDs  : PropTypes.array,
    scroll    : PropTypes.number.isRequired,
  }
  static defaultProps = {
    offerIDs : [],
  }
  
  componentDidUpdate (){
    this.props.update()
  }
  render () {
    let {offers,offerIDs,scroll} = this.props;
    
    let start = Math.floor((scroll-500)/vars.tableRowHeight);
    let end   = Math.floor((scroll+2500)/vars.tableRowHeight);
    
    let rows = [];
    offerIDs.filter(id=>offers[id]).map((id,i)=>{
      if(i<start || i > end) return;
      rows.push(
        <OfferWide key={id} offer={offers[id]} style={{top:vars.tableRowHeight*i}}/>
      );
    })

    return (
      <div className={s.root} style={{height:vars.tableRowHeight*rows.length}}>
        {rows}
      </div>
    )
  }
}