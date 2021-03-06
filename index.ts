const w : number = window.innerWidth
const h : number = window.innerHeight
const parts : number = 5
const scGap : number = 0.02 / parts
const hFactor : number = 8.9
const foreColor : string = "indigo"
const backColor : string = "#BDBDBD"
const delay : number = 20
const nodes : number = 5
const strokeFactor : number = 90

class ScaleUtil {

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n)) * n
    }

    static sinify(scale : number) {
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

    static drawJumpingBlock(context : CanvasRenderingContext2D, i : number, scale : number, size : number) {
        const gap : number = size / (parts)
        const sf : number = ScaleUtil.sinify(scale)
        const sci : number = ScaleUtil.divideScale(sf, i, parts)
        console.log(sf)
        const y : number = -(h - gap) * sci
        context.save()
        context.translate(gap * i, 0)
        DrawingUtil.drawLine(context, gap / 2, 0, gap / 2, y)
        context.save()
        context.translate(0, y)
        context.fillRect(0, -gap, gap, gap)
        context.strokeRect(0, -gap, gap, gap)
        context.restore()
        context.restore()
    }

    static drawJBNode(context : CanvasRenderingContext2D, i : number, scale : number) {
        const size : number = w / nodes
        context.strokeStyle = foreColor
        context.fillStyle = foreColor
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / strokeFactor
        context.save()
        context.translate(size * i, h)
        for (var j = 0; j < parts; j++) {
            DrawingUtil.drawJumpingBlock(context, j, scale, size)
        }
        context.restore()
    }
}

class Stage {
    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D = this.canvas.getContext('2d')
    renderer : Renderer = new Renderer()

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
        this.renderer.render(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.renderer.handleTap(() => {
                this.render()
            })
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

class SJBNode {

    prev : SJBNode
    next : SJBNode
    state : State = new State()

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new SJBNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        DrawingUtil.drawJBNode(context, this.i, this.state.scale)
        if (this.next) {
            this.next.draw(context)
        }
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : SJBNode {
        var curr : SJBNode = this.prev
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

class SmallPartJumpingBlock {

    dir : number = 1
    root : SJBNode = new SJBNode(0)
    curr : SJBNode = this.root

    draw(context : CanvasRenderingContext2D) {
        this.root.draw(context)
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

    sjb : SmallPartJumpingBlock = new SmallPartJumpingBlock()
    animator : Animator = new Animator()

    render(context : CanvasRenderingContext2D) {
        this.sjb.draw(context)
    }

    handleTap(cb : Function) {
        this.sjb.startUpdating(() => {
            this.animator.start(() => {
                cb()
                this.sjb.update(() => {
                    this.animator.stop()
                    cb()
                })
            })
        })
    }
}
