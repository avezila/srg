import React, { Component, PropTypes } from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import Glyphicon from 'react-bootstrap/es/Glyphicon'

import {changeFavorite,addOfferToReport} from "actions"
import s from './OfferWide.sass'
import * as Cian from "const/Cian"


@connect(({cian,router}) =>({
  favoriteIDs : cian.context.favoriteIDs,
  addedOfferIDs : cian.context.enviroment&&cian.context.enviroment.addedOfferIDs,
}), {changeFavorite,addOfferToReport})
class OfferWide extends Component {
  row (title,value,right){
    if(!value) return null;
    let max = 21;
    if(typeof value == "string" && value.length > max)
      value = value.substr(0,max-1)+"...";
    return (
      <div key={title||value} className={`${s.row} ${right?s.right:""}`}>
        {title&&<div className={s.row_title}>{title+":"}</div>}
        <div className={s.row_value}>{value}</div>
      </div>
    )
  }
  render (){
    let {offers,offer,favoriteIDs,changeFavorite,addedOfferIDs=[],addOfferToReport} = this.props;

    let cols = [];
    
    let col = [];
    col.push(this.row("Тип объекта",Cian.OfferType.map(offer.type)));
    col.push(this.row("",Cian.RealtyType.map(offer.realtyType)));
    cols.push(col);

    col = [];
    if(offer.price)
      col.push(this.row("Цена",offer.price.toString().prettyInt()+"руб."));
    if(offer.pricePerMeter)
      col.push(this.row("Цена за метр",offer.pricePerMeter.toString().prettyInt()+"руб."));
    if(offer.wallsType)
      col.push(this.row("Тип стен",Cian.WallsType.map(offer.wallsType)));
    cols.push(col)

    col = [];
    if(offer.space)
      col.push(this.row("Общая площадь", <span>{offer.space.toString().prettyFloat()+"м"}<sup>2</sup></span>));
    if(offer.kitchen)
      col.push(this.row("Площадь кухни", <span>{offer.kitchen.toString().prettyFloat()+"м"}<sup>2</sup></span>));
    cols.push(col)

    col = [];
    if(offer.rooms)
      col.push(this.row("Количество комнат",offer.rooms,true));
    if(offer.floor)
      col.push(this.row("Этаж",offer.floor,true));
    if(offer.storeys.length)
      col.push(this.row("Этажей в строении",offer.storeys.join("-"),true));
    cols.push(col)

    col = [];
    


    return (
      <div className={s.root} style={this.props.style}>
        <div className={s.header}>
          <Glyphicon 
            className={s.glyph+ ((favoriteIDs.indexOf(offer.id)<0)?"":" "+s.active) }
            onClick={()=> changeFavorite({
              favoriteIDs : {
                [offer.id]: favoriteIDs.indexOf(offer.id)<0,
              }, 
            })}
            glyph="star"  />
          <Glyphicon 
            className={s.glyph+" "+s.glyph_plus+ ((addedOfferIDs.indexOf(offer.id)<0)?"":" "+s.active) }
            onClick={()=> addOfferToReport({
              id : offer.id,
            })}
            glyph="plus"  />
          <Link className={s.header_title}  to={"offer-"+offer.id}>{offer.rawAddress}</Link>
          <div className={s.header_buttons}>
            <strong className={s.id}>{"#"+offer.id}</strong>
          </div>
        </div>
        <Link className={s.link} to={"offer-"+offer.id}>
          {cols.map((col,i)=>(
            <div key={i} className={`${s.col} ${i==0?s.wide:""}`}>{col}</div>
          ))}
        </Link>
      </div>
    )
  }
}

      // <div className={s.root}>
      //   <div className={s.title}>
      //     <div className={s.hash}>
      //       <Glyphicon 
      //         className={s.glyph+ ((favoriteIDs.indexOf(offer.id)<0)?"":" "+s.active) }
      //         onClick={()=> changeFavorite({
      //           favoriteIDs : {
      //             [offer.id]: favoriteIDs.indexOf(offer.id)<0,
      //           }, 
      //         })}
      //         glyph="star"  />
      //       <Glyphicon 
      //         className={s.glyph+" "+s.glyph_plus+ ((addedOfferIDs.indexOf(offer.id)<0)?"":" "+s.active) }
      //         onClick={()=> addOfferToReport({
      //           id : offer.id,
      //         })}
      //         glyph="plus"  />
      //       <strong className={s.small+" "+s.id}>{"#"+offer.id}</strong>
      //     </div>
      //     <div className={s.big}>{offer.rawAddress}</div>
      //     <div className={s.small}>{Cian.OfferType.map(offer.type)}</div>
      //     <div className={s.small}>{Cian.RealtyType.map(offer.realtyType)}</div>
      //   </div>
      // </div>
export default OfferWide;