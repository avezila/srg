
import {MEnum,VMap,Map,EMap,Float,String,Int,Bool,Type} from "lib/TypeSystem"


export const ErrorType = MEnum("ErrorType",{
  BAD_TOKEN : "Ошибка авторизации",
  INTERNAL  : "Ошибка на стороне сервера",
  FETCH     : "Ошибка при выполнении запроса к серверу",
})

export const OfferType = MEnum("OfferType",{
  FLAT        : "Квартира",
  COMMERCIAL  : "Коммерческая недвижимость",
})

export const RealtyType = MEnum("RealtyType",{
  BUILT_IN_OFFICE     : "Встроенное офисное помещение",
  BUILT_IN_COMMERCIAL : "Встроенные торговые помещения",
  BUILT_IN_STORAGE    : "Встроенные производственно-складские помещения",
  FREE_SPACE          : "Помещения свободного назначения",
  DETACHED            : "Отдельно стоящие здания",
  GAS_STATION         : "АЗС",
  TANK_FARM           : "Нефтебаза",
  HOTEL               : "Гостиница",
  PARKING             : "Автостоянка",
  RECREATION_CENTER   : "База отдыха",
  PROPERTY_COMPLEX    : "Имущественный комплекс",
  LAND_PLOT           : "Земельный участок",
  RESELLERS           : "Вторичное жилье",
  NEW                 : "Новостройка",
})

export const RealtyTypeFilter = Type("RealtyTypeFilter",(offerTypes)=>{
  let arr = [];
  for (let type of offerTypes){
    switch (OfferType(type)){
      case "FLAT":
        arr = arr.concat(["RESELLERS","NEW"]);
        break;
      case "COMMERCIAL":
        arr = arr.concat([
          "BUILT_IN_OFFICE",
          "BUILT_IN_COMMERCIAL",
          "BUILT_IN_STORAGE",
          "FREE_SPACE",
          "DETACHED",
          "GAS_STATION",
          "TANK_FARM",
          "HOTEL",
          "PARKING",
          "RECREATION_CENTER",
          "PROPERTY_COMPLEX",
          "LAND_PLOT",
        ]);
        break;
    }
  }
  let ret = {}
  arr.forEach(t=>ret[t] = RealtyType.map(t))
  return MEnum("filterRealty",ret)
})

export const EntryType = MEnum("EntryType",{
  BY_PASS     : "по пропуску",
  SEPARATE    : "отдельный вход",
  FREE        : "свободный вход",
})

export const BuildingType = MEnum("BuildingType",{
  RESIDENTIAL     : "жилое",
  NON_RESIDENTIAL : "нежилое",
})
export const BuildingClass = MEnum("BuildingClass",{
  A     : "A",
  APLUS : "A+",
  B     : "B",
  BPLUS : "B+",
  C     : "C",
  CPLUS : "C+",
  D     : "D",
  DPLUS : "D+",
})
export const ContractType = MEnum("ContractType",{
  SALE            : "продажа",
  PERMISSION      : "переуступка прав",
  DIRECT_RENT     : "прямая аренда",
  SUB_RENT        : "субаренда",
})
export const WallsType = MEnum("WallsType",{
  PANEL               : "панельный",
  KIRPICH             : "кирпичный",
  WOODEN              : "деревянный",
  MONOLITH            : "монолитный",
  BLOCK               : "блочный",
  MONOLITH_KIRPICH    : "монолитно-кирпичный", 
})

export const FigureType = MEnum("FigureType",{
  BOX     : "BOX",
  CIRCLE  : "CIRCLE",
})
export const Error = Map("Error",{
  type  : ErrorType,
  msg   : String,
  e     : undefined,
})

export const Figure = Map("Figure",{
  type    : FigureType,
})

export const Circle = Map("Circle",{
  ...Figure.const({type:"CIRCLE"}),
  center : Float.array(2),
  radius : Float,
})

export const Box = Map("Box",{
  ...Figure.const({type:"BOX"}),
  box : Float.array(2,2),
})

export const Offer = VMap("Offer",{
  id          : String,
  type        : OfferType,
  realtyType  : RealtyType,
  url         : String,
  photoUrls   : String.array(),
  rawAddress  : String,
  location    : Float.array(2),
  date        : String,
  sourceName  : String,
  sourceText  : String,
  price       : Int,
  trusted     : Bool,
  space       : Float,
})

export const OfferCommercial = Map("OfferCommercial",{
  ...Offer.const({type:"COMMERCIAL"}),
  entryType     : EntryType,
  buildingType  : BuildingType,
  buildingClass : BuildingClass,
  furniture     : Bool,
  contractType  : ContractType,
  line          : Int,
  storeys       : Int.array(),
  floor         : Int,
  rooms         : Int,
  pricePerMeter : Int,
})

export const OfferFlat = Map("OfferFlat",{
  ...Offer.const({type:"FLAT"}),
  wallsType     : WallsType,
  living        : Float,
  kitchen       : Float,
  storeys       : Int.array(),

  floor         : Int,
  rooms         : Int,
  pricePerMeter : Int,
})

export const ParseOffer = (offer={}) => {
  switch (offer.type){
    case "COMMERCIAL":
      return OfferCommercial(offer)
    case "FLAT":
      return OfferFlat(offer)
    default :
      return Offer(offer)
  }
}


export const ComparableOffer = VMap("ComparableOffer",{
  ...Offer,
})

export const ComparableOfferCommercial = Map("ComparableOfferCommercial",{
  ...OfferCommercial,
})

export const ComparableOfferFlat = Map("ComparableOfferFlat",{
  ...OfferFlat,
})


export const Context = Map("Context",{
  id          : String,
  favoriteIDs : String.array(),
  enviroment  : undefined,
  reportLink  : String,
  modified    : String,
  created     : String,
  comparable  : ComparableOffer,
})


export const SourcesType = MEnum("SourcesType",{
  "cian.ru" : "Циан",
})

export const Filter = Map("Filter",{
  type        : OfferType.array(),
  realtyType  : RealtyType.array(),
  price       : {
    from  : Float,
    to    : Float,
  },
  photoRequired : Bool,
  date    : {
    from  : String,
    to    : String,
  },
  location  : Figure.array(),
  sources   : String.array(),
  space     : {
    from  : Float,
    to    : Float,
  },
  entryType   : EntryType.array(),
  floor       : {
    from  : Int,
    to    : Int, 
  },
  floorHint : {
    notFirst : Bool,
    notLast  : Bool,
  },
  storeys   : {
    from    : Int,
    to      : Int,
  },
  buildingType  : BuildingType.array(),
  buildingClass : BuildingClass.array(),
  furniture     : Bool,
  rooms         : {
    from  : Int,
    to    : Int,
  },
  contractType  : ContractType.array(),
  line          : Int.array(),
  include       : String.array(),
  exclude       : String.array(),
  wallsType : WallsType.array(),
  living : {
    from : Float,
    to   : Float,
  },
  kitchen : {
    from  : Float,
    to    : Float,
  },
  pricePerMeter : {
    from  : Int,
    to    : Int,
  },
})


// export const FilterCommercial  = EMap("FilterCommercial",{
//   ...Filter.default({type:["COMMERCIAL"]}),
  
// })

// export const FilterFlat  = EMap("FilterFlat",{
//   ...Filter.default({type:["FLAT"]}),
  
// })


export const LineType = MEnum("LineType",{
  1 : 1,
  2 : 2,
  3 : 3,
  5 : 5,
  6 : 6,
  7 : 7,
  8 : 8,
  9 : 9,
  10 : 10,
})

function multiselectFromMEnum (en,arr){
  let ret = en("*").map(key=>({
    label     : en.map(key),
    value     : key,
    selected  : arr.map(v=>""+v).indexOf(key) >= 0,
  }))
  return ret;
}
export const FilterToFields = Type("FilterFields",(o)=> {
  o = Filter(o)

  return {
    type  : {
      title : "Тип объекта",
      multiselect : {
        data : multiselectFromMEnum(OfferType,o.type),
      }
    },
    realtyType  : {
      //title : "Подтип объекта",
      multiselect : {
        data : multiselectFromMEnum(RealtyTypeFilter(o.type),o.realtyType),
      },
      hide : o.type.indexOf("FLAT")<0 && o.type.indexOf("COMMERCIAL")<0,
    },
    date : {
      title : "Дата объявления",
      fromto : {
        data    : o.date,
        type : "date", 
      }
    },
    price : {
      title : "Цена, руб.",
      fromto : {
        data    : o.price,
        type : "input",
        pattern : 'int',
      }
    },
    pricePerMeter : {
      title : "Цена за метр, руб.",
      fromto : {
        data    : o.pricePerMeter,
        type : "input",
        pattern : 'int',
      }
    },
    contractType : {
      title : "Тип договора",
      multiselect : {
        data : multiselectFromMEnum(ContractType,o.contractType), 
      },
      hide : o.type.indexOf("COMMERCIAL")<0,
    },
    space : {
      title : "Общая площадь, м.кв.",
      fromto : {
        data    : o.space,
        type    : "input",
        pattern : 'meter',
      }
    },
    living : {
      title : "Жилая площадь, м.кв.",
      fromto : {
        data    : o.living,
        type    : "input",
        pattern : 'meter',
      },
      hide : o.type.indexOf("FLAT")<0,
    },
    kitchen : {
      title : "Площадь кухни, м.кв.",
      fromto : {
        data    : o.kitchen,
        type    : "input",
        pattern : 'meter',
      },
      hide : o.type.indexOf("FLAT")<0,
    },
    rooms : {
      title : "Количество комнат",
      fromto : {
        data    : o.rooms,
        type    : "input",
        pattern : 'int',
      },
      hide : o.type.indexOf("FLAT")<0 && o.type.indexOf("COMMERCIAL")<0,
    },
    furniture : {
      checkbox : {
        title : "Наличие мебели",
        data : o.furniture,
      },
      hide : o.type.indexOf("COMMERCIAL")<0,
    },
    floor : {
      title : "Этаж",
      fromto : {
        data    : o.floor,
        type    : "input",
        pattern : 'int',
      },
      hide : o.type.indexOf("FLAT")<0 && o.type.indexOf("COMMERCIAL")<0,
    },
    "floorHint.notFirst" : {
      checkbox : {
        title : "Не первый",
        data : o.floorHint.notFirst,
      },
      hide : o.type.indexOf("FLAT")<0 && o.type.indexOf("COMMERCIAL")<0,
    },
    "floorHint.notLast" : {
      checkbox : {
        title : "Не последний",
        data : o.floorHint.notLast,
      },
      hide : o.type.indexOf("FLAT")<0 && o.type.indexOf("COMMERCIAL")<0,
    },
    storeys : {
      title : "Количество этажей",
      fromto : {
        data    : o.storeys,
        type    : "input",
        pattern : 'int',
      },
      hide : o.type.indexOf("FLAT")<0 && o.type.indexOf("COMMERCIAL")<0,
    },
    wallsType : {
      title : "Тип дома",
      multiselect : {
        data : multiselectFromMEnum(WallsType,o.wallsType), 
      },
      hide : o.type.indexOf("FLAT")<0,
    },
    entryType : {
      title : "Тип объекта",
      multiselect : {
        data : multiselectFromMEnum(EntryType,o.entryType), 
      },
      hide : o.type.indexOf("COMMERCIAL")<0,
    },
    buildingType : {
      title : "Тип здания",
      multiselect : {
        data : multiselectFromMEnum(BuildingType,o.buildingType), 
      },
      hide : o.type.indexOf("COMMERCIAL")<0,
    },
    buildingClass : {
      title : "Класс здания",
      multiselect : {
        data : multiselectFromMEnum(BuildingClass,o.buildingClass), 
      },
      hide : o.type.indexOf("COMMERCIAL")<0,
    },
    line : {
      title : "Линия домов",
      multiselect : {
        data : multiselectFromMEnum(LineType,o.line),
      },
      hide : o.type.indexOf("COMMERCIAL")<0,
    },
    sources : {
      title : "Источник объявления",
      multiselect : {
        data : multiselectFromMEnum(SourcesType,o.sources),
      }
    },
    photoRequired : {
      checkbox : {
        title : "Только с фото",
        data : o.photoRequired,
      }
    },
    include : {
      title : "Только со словами",
      words : {
        data : o.include,
      },
      hide : o.type.indexOf("COMMERCIAL")<0,
    },
    exclude : {
      title : "Исключить слова",
      words : {
        data : o.exclude,
      },
      hide : o.type.indexOf("COMMERCIAL")<0,
    },
  }
});

export const Token = Map("Token",{
  id  : String,
})


export const Rpc = Map("CianRpc",{
  getContext : {
    request : {
      token : String,
    },
    response : {
      context : Context,
      error   : Error,
    },
  },
  getOffers : {
    request : {
      token : String,
      offerIDs : String.array(),
    },
    response : {
      offers  : Offer.array(),
      error   : Error,
    },
  },
  filterOffers : {
    request : {
      token   : String,
      filter  : Filter,
    },
    response : {
      offerIDs  : String.array(),
      error     : Error,
    },
  },
  updateContext : {
    request : {
      token   : String,
      context : Context,
    },
    response : {
      error   : Error,
    },
  },
  addOfferToReport : {
    request : {
      token   : String,
      offerID : String,
    },
    response : {
      error   : Error,
    },
  },
  ymaps : {
    request : {
      token : String,
      query : String,
    },
    response : {
      response  : undefined,
      error   : Error,
    },
  },
})