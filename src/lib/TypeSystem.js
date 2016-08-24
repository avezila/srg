import lmerge from 'lodash/merge'

/*
Type:
  constructor()
  default()
  const()
  array()
  [...map]
  ::__context{
    merge()
    default()
    const()
    constCheck()
    parse()
    resolve()
    array()
    name,
    _default
    _const
  }
*/

const NO_THROW = true;

function _throw (e){
  if(NO_THROW)
    return console.error(e.stack || e.message);
  throw e;
}

function clear (v){
  // if(typeof v == 'function')
  //   v = {...v};
  if(typeof v != 'object')
    return v;
  if(v.length != undefined)
    return [...v];
  v = {...v}
  for (let key in v)
    if(key.match(/^__/) || ["array","default","const"].indexOf(key)>=0)
      delete v[key];
    else
      v[key] = clear(v[key]);
  return v;
}

export const BaseType = {
  merge     : function (v,d,c){
    return c || v || d;
  },

  default   : function (v,d,c){
    return DefineType({
      ...this,
      _default : this.resolve(v,d,c),
    });
  },

  const     : function (v,c){
    return DefineType({
      ...this,
      _const : this.resolve(v,undefined,c),
    });
  },

  constCheck: function(v,c){
    if(v != undefined && c != undefined)
      _throw(new Error(`Can't override const field ${this.name}{${c}} by ${v}`));
  },
  
  parse     : function (v){
    return v;
  },

  resolve   : function (v,d,c){
    v = this.parse(v)
    this.constCheck(v,c)
    return this.merge(v,d,c);
  },

  array     : function(...l){
    return _Array(this,...l)
  },

  name      : "BaseType",
  struct    : {},
  _default  : undefined,
  _const    : undefined,
};

export function DefineType (_o={},_baseType = BaseType) {
  let _c = {..._baseType,..._o} // new context
  _c.struct = clear(_c.struct)
  let type = function (...v){
    if(v.length == 0) v = undefined;
    else if(v.length == 1) v =  v[0];
    return _c.resolve(v,_c._default,_c._const)
  }
  type.prototype.__context = _c;
  type.default  = (v)=> _c.default(v,_c._default,_c._const)
  type.const    = (v)=> _c.const(v,_c._const)
  type.array    = _c.array.bind(type)
  Object.assign(type,_c.struct)

  return type;
}

export function _Array(type,...resolution){
  type = Type(type);
  if(resolution.length==0)
    resolution.push(0);
  let l = resolution.pop()
  let array = DefineType({
    parse : function(v){
      if(l!=0 && v == undefined) return undefined;
      if(v == undefined) v = [];
      if(typeof v != "object" || v.length == "undefined")
        _throw(new Error(`Expected [${l||""}]${type.prototype.__context.name}, but got ${v}:${typeof v}`))
      if(l != 0 && v.length != l)
        _throw(new Error(`Expected fixed length [->${l}]${type.prototype.__context.name} but got ${v.length}`));
      let ret = [];
      v.forEach(el => ret.push(type(el)))
      return ret;
    },
    name : `[${l||""}]${type.prototype.__context.name}`,
  })
  if(resolution.length == 0)
    return array;
  return _Array(array,...resolution);
}

function DefineUndefine(_for,_from){
  for (let key in _from){
    if(typeof _from[key] == "object"){
      if(typeof _for[key] != "object")
        _for[key] = {};
      DefineUndefine(_for[key],_from[key])
    }else if (_for[key] == undefined && _from[key] == undefined){
      _for[key] = undefined;
    }
  }
}

export function Type (name,definition,basetype){
  if(typeof name != 'string'){
    [definition,basetype] = [name,definition]
    name = "Type"
  }
  
  switch (typeof definition){
    case "function" :
      if(definition.prototype && definition.prototype.__context)
        return definition;
      return DefineType({
        name,
        parse : definition,
      })
    case "object" :
      if(basetype && basetype.prototype && basetype.prototype.__context)
        return DefineType({name,...definition},basetype.prototype.__context)
      do {
        if(typeof definition.name != "string" || definition.name == "")
          break;
        if(typeof definition.parse != "function" || definition.parse.prototype.__context)
          break;
        return DefineType({name,...definition});
      } while (false);
      return Map(name,definition);
    default :
      return DefineType({name}).default(definition); 
  }
}

export const Enum = Type("Enum",function([name,fields={}]){
  if(typeof fields != "object" || fields.length == 'undefined')
    _throw(new Error(`Expected array in Enum:${name}, got ${fields}:${typeof fields}`))
  let Enum = DefineType({
    parse : function(v){
      if(v == undefined)
        return undefined;
      if(v == "*")
        return fields;
      if(fields.indexOf(v) < 0)
        _throw(new Error(`Unknown enum field ${v} in ${name}:{${fields}}`))
      return v;
    }
  })
  return Enum;
})

export const MEnum = Type("MEnum",function([name,fields={}]){
  let map = Map(`${name}:map`,fields)()
  let _enum = Enum(`${name}:enum`,Object.keys(fields))
  let MEnum = DefineType({
    parse : function (v){
      return _enum(v);
    }
  })
  MEnum.map = DefineType({
    parse : function (v){
      if(v == undefined)
        return undefined
      if(v == "*")
        return fields;
      return map[MEnum(v)];
    }
  })
  return MEnum;
})

export const VMap = Type("VMap",function([name,struct = {}]){
  struct = clear(struct)

  for (let key in struct){
    struct[key] = Type(`${name}.${key}`,struct[key]);
  }
  let VMap = DefineType({
    name : "VMap:"+name,
    merge : function (v={},d={},c={}){
      let ret = lmerge({},d,v,c);
      DefineUndefine(ret,v);
      return ret;
    },
    constCheck : function (v={},c={}){
      for (let key in c){
        if(c[key] != undefined && v[key] != undefined)
          _throw(new Error(`Can't override const field ${this.name}{${key}:${c[key]}} to ${v[key]}`))
      }
    },
    parse : function (v={}){
      v = clear(v)
      let ret = {...v};
      for (let key in this.struct){
        ret[key] = this.struct[key](v[key])
      }
      return clear(ret);
    },
    struct : struct,
  })
  return VMap;
});


export const Map = Type("Map",function([name,struct = {}]){
  struct = clear(struct)
  for (let key in struct){
    struct[key] = Type(`${name}.${key}`,struct[key]);
  }
  let Map = DefineType({
    name : "Map:"+name,
    merge : function (v={},d={},c={}){
      let ret = lmerge({},d,v,c);
      DefineUndefine(ret,v);
      return ret;
    },
    constCheck : function (v={},c={}){
      for (let key in c){
        if(c[key] != undefined && v[key] != undefined)
          _throw(new Error(`Can't override const field ${this.name}{${key}:${c[key]}} to ${v[key]}`))
      }
    },
    parse : function (v={}){
      v = clear(v)
      
      let _v = {...v}
      let ret = {};
      for (let key in this.struct){
        ret[key] = this.struct[key](v[key])
        delete _v[key];
      }
      let keys = Object.keys(_v)
      if(keys.length){
        //_throw(new Error(`Unexpected fields {${keys}} in ${this.name}:{${Object.keys(this.parse())}}`));
      }
      return clear(ret);
    },
    struct : struct,
  })
  return Map;
})

export const EMap = Type("EMap",function([name,struct = {}]){
  struct = clear(struct)
  for (let key in struct){
    struct[key] = Type(`${name}.${key}`,struct[key]);
  }
  let EMap = DefineType({
    name : "EMap:"+name,
    merge : function (v={},d={},c={}){
      let ret = lmerge({},d,v,c);
      DefineUndefine(ret,v);
      return ret;
    },
    constCheck : function (v={},c={}){
      for (let key in c){
        if(c[key] != undefined && v[key] != undefined)
          _throw(new Error(`Can't override const field ${this.name}{${key}:${c[key]}} to ${v[key]}`))
      }
    },
    parse : function (v={}){
      v = clear(v)
      let ret = {};
      for (let key in this.struct){
        ret[key] = this.struct[key](v[key])
      }
      return clear(ret);
    },
    struct : struct,
  })
  return EMap;
})

export const Int = Type("Int",function(v){
  if(v==undefined)return v;
  let num = Number(v);
  if (isNaN(num)){
    _throw(new Error(`Failed parse Int from ${JSON.stringify(v)}:${typeof v}`))
  }
  return Math.floor(num);
})
export const Float = Type("Float",function(v){
  if(v==undefined)return v;
  let num = Number(v);
  if (isNaN(num)){
    _throw(new Error(`Failed parse Float from ${JSON.stringify(v)}:${typeof v}`))
  }
  return num;
})
export const String = Type("String",function(v){
  if(v==undefined)return v;
  if(typeof v != "string" && typeof v != 'number') _throw(new Error(`expected string, got ${v}:${typeof v}`))
  return ""+v;
})

export const Bool = Type("Bool",function(v){
  if(v==undefined)return v;
  return v==true
})
