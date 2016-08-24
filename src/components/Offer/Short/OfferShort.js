import React, { Component, PropTypes } from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import Glyphicon from 'react-bootstrap/es/Glyphicon'

import {changeFavorite,addOfferToReport} from "actions"
import s from './OfferShort.sass'
import * as Cian from 'const/Cian'


@connect(({cian}) =>({
  favoriteIDs : cian.context.favoriteIDs,
  addedOfferIDs : cian.context.enviroment&&cian.context.enviroment.addedOfferIDs,
}), {changeFavorite,addOfferToReport})
class OfferShort extends Component {
  render (){
    let {offer,favoriteIDs,changeFavorite,addedOfferIDs=[],addOfferToReport} = this.props;
    
    let cols = [];
    if(offer.rooms)
      cols.push(<div title="Количество комнат" key="rooms" className={s.rooms}>{`${offer.rooms}-комн.`}</div>)
    
    if(offer.realtyType){
      let realtyType = Cian.RealtyType.map(offer.realtyType)
      let max = 15;
      let short = realtyType;
      if(realtyType.length>max)
        short = realtyType.substr(0,max-1)+'...';
      cols.push(<div title={realtyType} key="realtyType" className={s.realtyType}>{short}</div>);
    }
    if(offer.price)
      cols.push(<div title="Общая цена" key='price' className={s.price}>{offer.price.toString().prettyInt()+" руб."}</div>);

    if(offer.type == "FLAT"||offer.type == "COMMERCIAL"){
      let storeys = Math.max(...offer.storeys);
      if(storeys || offer.floor)
        cols.push(<div title="Этаж/Всего этажей" key="floor" className={s.floor}>{`${offer.floor||''}/${storeys||''}`}</div>);  
    }
    
    let space = [offer.kitchen,offer.space].filter(v=>v).join('/');
    if(space)
      cols.push(<div title="Площадь кухни/Общая площадь" key="space" className={s.space}>{`${space}м`}<sup>2</sup></div>);
  


    return (
      <div className={s.root}>
        <Link className={s.background} to={"offer-"+offer.id}>
          {cols}
        </Link>
        <Glyphicon
          title="Добавить в избранное"
          className={s.glyph+ ((favoriteIDs.indexOf(offer.id)<0)?"":" "+s.active) }
          onClick={()=> changeFavorite({
            favoriteIDs : {
              [offer.id]: favoriteIDs.indexOf(offer.id)<0,
            }, 
          })}
          glyph="star"  />
        <Glyphicon
          title="Добавить в отчет" 
          className={s.glyph+ ((addedOfferIDs.indexOf(offer.id)<0)?"":" "+s.active) }
          onClick={()=> addOfferToReport({
            id : offer.id,
          })}
          glyph="plus"  />
      </div>
    )
  }
}

export default OfferShort;