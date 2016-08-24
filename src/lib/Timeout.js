
export default function Timeout (func,args=[],timerDT=200,updating=true){
  if(typeof args == "number"){
    timerDT = args;
    args = [];
  }
  func.__args = args;
  if(updating || !func.__timer)
    func.__time = new Date().getTime();
  if(!func.__timer){
    let onTimer = () => {
      if(!func.__timer) return;
      let now = new Date().getTime();
      let dt = now - func.__time;
      if(dt < timerDT)
        return func.__timer = setTimeout(onTimer,timerDT-dt);
      let args = func.__args;
      delete func.__timer;
      delete func.__time;
      delete func.__args;
      func(...args);
    }

    func.__timer = setTimeout(onTimer,timerDT)
  }
}