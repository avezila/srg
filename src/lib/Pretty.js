

String.prototype.reverse  = function (){
  return this.split("").reverse().join("")
}

String.prototype.prettyInt = function(){
  return this.replace(/\..*/,"").reverse().replace(/(\d\d\d)/g,"$1 ").reverse()
}

String.prototype.prettyFloat = function(){
  let [a,b] = this.split(".");
  a = a || "0";
  b = b || "0";
  if(b.length < 2) b += "0";
  return [a.prettyInt(),b.substr(0,2)].join(".");
}
