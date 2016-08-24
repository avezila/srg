import React, { Component, PropTypes } from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import Glyphicon from 'react-bootstrap/es/Glyphicon'
import {goBack} from 'redux-router'

import {changeFavorite,addOfferToReport} from "actions"
import s from './OfferFull.sass'
import * as Cian from "const/Cian"


@connect(({cian,router}) =>({
  favoriteIDs : cian.context.favoriteIDs,
  addedOfferIDs : cian.context.enviroment&&cian.context.enviroment.addedOfferIDs,
  id     : router.params.splat,
  offers : cian.offers,
}), {changeFavorite,addOfferToReport,goBack},null,{withRef:true})
class OfferFull extends Component {
  componentDidUpdate (){
    this.props.update()
  }
  row (title,value){
    if(!value) return null;
    return (
      <div key={title||value} className={s.row}>
        <div className={s.row_title}>{title?title+":":""}</div>
        <div className={s.row_value}>{value}</div>
      </div>
    )
  }
  render (){
    let {offers,id,favoriteIDs,changeFavorite,addedOfferIDs=[],addOfferToReport} = this.props;
    let offer =  offers[id];
    if(!offer)
      return <div className={s.root} />;
    let rows = [];

    rows.push(this.row("Тип объекта",Cian.OfferType.map(offer.type)));
    rows.push(this.row("",Cian.RealtyType.map(offer.realtyType)));
    if(offer.price)
      rows.push(this.row("Цена",offer.price.toString().prettyInt()+"руб."));
    if(offer.pricePerMeter)
      rows.push(this.row("Цена за метр",offer.pricePerMeter.toString().prettyInt()+"руб."));
    if(offer.contractType)
      rows.push(this.row("Тип продажи",Cian.ContractType.map(offer.contractType)));

    if(offer.space)
      rows.push(this.row("Общая площадь", <span>{offer.space.toString().prettyFloat()+"м"}<sup>2</sup></span>));
    if(offer.kitchen)
      rows.push(this.row("Площадь кухни", <span>{offer.kitchen.toString().prettyFloat()+"м"}<sup>2</sup></span>));
    if(offer.living)
      rows.push(this.row("Жилая площадь", <span>{offer.living.toString().prettyFloat()+" м"}<sup>2</sup></span>));
    if(offer.rooms)
      rows.push(this.row("Количество комнат",offer.rooms));
    if(offer.furniture != undefined)
      rows.push(this.row("Мебель", offer.furniture ? "Есть":"Нет"));
    if(offer.floor)
      rows.push(this.row("Этаж",offer.floor));
    if(offer.storeys.length)
      rows.push(this.row("Этажей в строении",offer.storeys.join("-")));
    
    if(offer.wallsType)
      rows.push(this.row("Тип стен",Cian.WallsType.map(offer.wallsType)));
    if(offer.buildingType)
      rows.push(this.row("Тип здания",Cian.BuildingType.map(offer.buildingType)));
    if(offer.buildingClass)
      rows.push(this.row("Класс здания",Cian.BuildingClass.map(offer.buildingClass)));
      
    if(offer.entryType)
      rows.push(this.row("Вход",Cian.EntryType.map(offer.entryType)));
    if(offer.line != undefined)
      rows.push(this.row("Линия домов",offer.line));

    if(offer.trusted != undefined)
      rows.push(this.row("Проверенно",offer.trusted ? "Да":"Нет"));
    rows.push(this.row("Источник объявления",offer.sourceText||offer.sourceName));
    rows.push(this.row("Ссылка на объявление",<a target="_blank" href={offer.url} className={s.link}>{offer.url}</a>));
    rows.push(this.row("Дата объявления",offer.date));


    return (
      <div className={s.root}>
        <div className={s.header}>
          <div className={s.header_title}>{offer.rawAddress}</div>
          <div className={s.header_buttons}>
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
            <strong className={s.id}>{"#"+offer.id}</strong>
          </div>
        </div>
        <div className={s.rows}>{rows}</div>
      </div>
    )
  }
}

export default OfferFull;
