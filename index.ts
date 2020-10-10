const w : number = window.innerWidth 
const h : number = window.innerHeight
const parts : number = 2  
const scGap : number = 0.02 / parts 
const delay : number = 20 
const strokeFactor : number = 90 
const sizeFactor : number = 8.9 
const backColor : string = "#BDBDBD"
const colors : Array<string> = [
    "#F44336",
    "#673AB7",
    "#009688",
    "#2196F3",
    "#FFEB3B"
] 

class ScaleUtil {

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }
    
    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n)) * n 
    }

    static sinify(scale : number) : number {
        return Math.sin(scale * Math.PI)
    }
}