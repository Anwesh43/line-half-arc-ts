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

class Stage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D 

    initCanvas() {
        this.canvas.width = w 
        this.canvas.height = h 
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor 
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    static init() {
        const stage : Stage = new Stage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {

    scale : number = 0 
    dir : number = 0 
    prevScale : number = 0 

    update(cb : Function) {
        this.scale += this.dir * scGap 
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir 
            this.dir = 0 
            this.prevScale = this.scale 
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale 
            cb()
        }
    }
}

class Animator {

    animated : boolean = false 
    interval : number 

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true 
            this.interval = setInterval(cb, delay)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false 
            clearInterval(this.interval)
        }
    }
}

class HAFLNode {

    state : State = new State()
    prev : HAFLNode 
    next : HAFLNode 

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < colors.length - 1) {
            this.next = new HAFLNode(this.i + 1)
            this.next.prev = this 
        }
    }

    draw(context : CanvasRenderingContext2D) {
        DrawingUtil.drawHAFLNode(context, this.i, this.state.scale)
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }
    
    getNext(dir : number, cb : Function) : HAFLNode {
        var curr : HAFLNode = this.prev 
        if (dir == 1) {
            curr = this.next 
        }
        if (curr) {
            return curr 
        }
        cb()
        return this 
    }
}

class HalfArcFillLine {

    curr : HAFLNode = new HAFLNode(0)
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}

class Renderer {

    hafl : HalfArcFillLine = new HalfArcFillLine()
    animator : Animator = new Animator()

    render(context : CanvasRenderingContext2D) {
        this.hafl.draw(context)
    }
    
    handleTap(cb : Function) {
        this.hafl.startUpdating(() => {
            this.animator.start(() => {
                cb()
                this.hafl.update(() => {
                    this.animator.stop()
                    cb()
                })
            })
        })
    }
}