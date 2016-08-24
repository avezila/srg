

export function BoundsScale(b,x){
  let d1 = (b[1][0]-b[0][0])*(x-1)/2;
  let d2 = (b[1][1]-b[0][1])*(x-1)/2;
  return [
    [
      b[0][0]-d1,
      b[0][1]-d2,
    ],
    [
      b[1][0]+d1,
      b[1][1]+d2,
    ]
  ]
}
export function InBounds(b,p){
  return b[0][0]<p[0] && b[1][0]>p[0] && b[0][1]<p[1] && b[1][1]>p[1]
}