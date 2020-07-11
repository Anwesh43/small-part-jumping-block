const w : number = window.innerWidth
const h : number = window.innerHeight
const parts : number = 5
const scGap : number = 0.02 / parts
const hFactor : number = 8.9
const foreColor : string = "indigo"
const backColor : string = "#BDBDBD"
const delay : number = 20
const nodes : number = 5

class Stage {
    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D = this.canvas.getContext('2d')

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
