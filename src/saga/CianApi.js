
import * as Cian from "const/Cian"
import Env from "const/Env"
import fetchJsonp from "fetch-jsonp"


function clear (v){ // fix for ie8
  if(typeof v == 'function')
    v = {...v};
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

export async function ApiCall(method,rpcType,request){
  request = clear(rpcType.request(request))
  let token = request.token
  delete request.token
  var body = encodeURIComponent(JSON.stringify(request));

  var response = await fetchJsonp(`${Env.host}/${Env.base}/${Env.api}/${method}?token=${token}&q=${body}`,{
    timeout: 8000,
  });

  response = await response.json()
  
  return rpcType.response(response);
}

async function applyApiCall(name,request){
  var result;
  try {
    result = await ApiCall(name,Cian.Rpc[name],request);
  }catch (e){
    result = Cian.Rpc[name].response({
      error : {
        type  : "FETCH",
        e     : e,
      }
    });
  }
  if(result.error.type){
    result.error.msg = result.error.msg || Cian.ErrorType.map(result.error.type)
    result.error.msg += ` in ${name}()`;
    let msg = `Failed fetch api ${name} with request:${JSON.stringify(Cian.Rpc[name].request(request),null,2)}`;
    if (result.error.e != undefined){
      result.error.e.message = result.error.e.message || "";
      result.error.e.stack   = result.error.e.stack || "";
      result.error.e.message = `${msg}\n\n${result.error.e.message}\n`;
      result.error.e.message = result.error.e.message.replace(/(http\S+)(\?\S+)/gmi,"$1?...")
      result.error.e.stack = result.error.e.stack.replace(/(http\S+)(\?\S+)/gmi,"$1?...")
    } else {
      result.error.e = new Error(msg)
    }
  }
  return result;
}


let rpc = {};

for (let name in Cian.Rpc()){
  rpc[name] = applyApiCall.bind(null,name);
}

export default {...rpc};