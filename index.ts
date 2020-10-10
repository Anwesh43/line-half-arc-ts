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

class DrawingUtil {

    static drawLine(context : CanvasRenderingContext2D, x1 : number, y1 : number, x2 : number, y2 : number) {
        context.beginPath()
        context.moveTo(x1, y1)
        context.lineTo(x2, y2)
        context.stroke()
    }

    static drawHalfArcFill(context : CanvasRenderingContext2D, x : number, y : number, r : number, scale : number) {
        context.save()
        context.translate(x, y)
        context.beginPath()
        context.arc(r, 0, r, Math.PI / 2, Math.PI)
        context.clip()
        context.fillRect(r * scale, -r, r, 2 * r)
        context.restore()
    }

    static drawHalfArcFillLine(context : CanvasRenderingContext2D, scale : number) {
        const sf : number = ScaleUtil.sinify(scale)
        const sf1 : number = ScaleUtil.divideScale(sf, 0, parts)
        const sf2 : number = ScaleUtil.divideScale(sf, 1, parts)
        const r : number = Math.min(w, h) / sizeFactor 
        context.save()
        context.translate(w / 2, h / 2)
        for (var j = 0; j < 2; j++) {
            context.save()
            context.scale(1 - 2 * j, 1)
            context.translate(-w / 2, 0)
            DrawingUtil.drawLine(context, 0, 0, (w / 2 - r) * sf2, 0)
            DrawingUtil.drawHalfArcFill(context, (w / 2 - r) * sf2, 0, r, sf1)
            context.restore()
        }
        context.restore()
    }

    static drawHAFLNode(context : CanvasRenderingContext2D, i : number, scale : number) {
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / strokeFactor 
        context.strokeStyle = colors[i]
        context.fillStyle = colors[i]
        DrawingUtil.drawHalfArcFillLine(context, scale)
    }
}