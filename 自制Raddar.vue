<template></template>
  <div class="raddar-box"
       :class="{hover:isHover}"
       @mousemove="(e)=>mouseMove(e)"
       @click="(e)=>mouseMove(e)">
    <canvas id="canvas">
      <p>你的浏览器不支持Canvas</p>
    </canvas>
    <div ref="listRef"
         class="list">
      <p>{{option.raddarData[currentIndex].name}}</p>
      <ul>
        <li v-for="(item, index) in option.indicator"
            :key="index">{{item.name}} : {{option.raddarData[currentIndex].val[index]}}</li>
      </ul>
    </div>
  </div>

</template>

<script>
import { debounce } from 'debounce'
export default {
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    chartOption: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      ctx: '',
      center: {},
      r: 0,
      length: 0,
      isHover: false,
      listDis: 20,
      option: {
        width: 800,
        height: 800,
        split: 3,
        paddingGap: 20,
        textGap: 15,
        legend: [
          { color: '#6837C2', name: '当前技能等级' },
          { color: '#14D3FF', name: '平均技能等级' },
        ],
        areaStyle: ['rgba(97,172,255,0.1)', 'rgba(97,172,255,0.2)', 'rgba(97,172,255,0.8)'],
        lineStyle: ['rgba(231,242,255, 1)', 'rgba(231,242,255, 0.3)', 'rgba(255,255,255, 1)'],
        raddarData: [
          {
            name: '平均技能等级',
            opt: {
              strokeColor: '#14D3FF',
              imgUrl: process.env.imgUrl + 'rsxq/radar-symbol.png',
              fillColor: ['rgba(0,255,215,0.6)', 'rgba(0,48,255,0.6)'],
            },
            val: [2, 0, 1, 0, 3, 2],
          },
          {
            name: '当前技能等级',
            opt: {
              strokeColor: '#6837C2',
              imgUrl: process.env.imgUrl + 'rsxq/radar-symbol2.png',
              fillColor: ['rgba(149,0,255,0.6)', 'rgba(0,43,255,0.6)'],
            },
            val: [1, 2, 1, 0, 2, 1],
          },
        ],
      },
      pointArr: [],
      canvasScale: {},
      listData: [],
      currentIndex: 1,
    }
  },
  mounted() {
    this.option.raddarData.forEach((item, index) => {
      item.val = this.data[index]
    })
    this.option = { ...this.option, ...this.chartOption }
    this.init('#canvas')
  },
  methods: {
    mouseMove: debounce(function (e) {
      let isHover = null
      this.pointArr.map((item, index) => {
        let flag = this.calcArea({ x: e.offsetX * this.canvasScale.w, y: e.offsetY * this.canvasScale.h }, item)
        if (flag) {
          isHover = index
        }
      })
      if (isHover != null) {
        let dom = document.querySelector('#canvas')
        this.isHover = true
        this.crashCheck(dom, this.$refs.listRef, e.offsetX, e.offsetY)
        this.$refs.listRef.style.display = 'block'
        if (this.currentIndex == isHover) {
          return
        }
        this.currentIndex = isHover
        if (this.currentIndex == 1) {
          this.reRender(this.ctx)
        } else {
          this.initRender(this.ctx)
        }
      } else {
        this.$refs.listRef.style.display = 'none'
        this.isHover = false
        if (this.currentIndex == 1) {
          return
        }
        this.currentIndex = 1
        this.initRender(this.ctx)
      }
    }, 20),
    init(dom) {
      let canvas = document.querySelector(dom)
      canvas.width = this.option.width
      canvas.height = this.option.height
      this.ctx = canvas.getContext('2d')
      this.ctx.globalCompositeOperation = 'lighter'
      this.canvasScale = this.getScale(canvas)
      this.center = {
        x: this.option.width / 2 + this.option.paddingGap,
        y: this.option.height / 2 + this.option.paddingGap,
      }
      this.r = this.option.width / 2 - 2 * this.option.paddingGap
      this.areaDis = Math.floor(this.r / (this.option.split + 1))
      this.length = this.option.indicator.length
      this.option.raddarData.forEach((item) => {
        let arr = this.data2Point(item.val)
        this.pointArr.push(arr)
      })
      this.initRender(this.ctx)
    },
    initRender(ctx) {
      this.ctx.clearRect(0, 0, this.option.width, this.option.height)
      this.drawBg(ctx)
      this.drawLine(ctx)
      this.drawLegend(ctx)
      this.renderData(ctx)
    },
    renderData(ctx) {
      let last = {}
      this.option.raddarData.forEach((item, index) => {
        if (this.currentIndex !== index) {
          this.drawData(ctx, this.pointArr[index], item.opt)
        } else {
          last.arr = this.pointArr[index]
          last.opt = item.opt
        }
      })
      setTimeout(() => this.drawData(ctx, last.arr, last.opt), 0)
    },
    reRender(ctx) {
      this.ctx.clearRect(0, 0, this.option.width, this.option.height)
      this.drawBg(ctx)
      this.drawLine(ctx)
      this.drawLegend(ctx)
      this.renderData(ctx)
    },
    // ================ 绘画 ==================
    // 绘制背景
    drawBg(ctx) {
      let r = this.r
      ctx.lineWidth = 2
      //每次以不同半径绘制多个由大到小的图形
      for (let j = 0; j < this.option.split; j++) {
        //移动至第一个绘图点
        r = this.areaDis * (this.option.split - j)
        ctx.beginPath()
        ctx.strokeStyle = this.option.lineStyle[j]
        //转动坐标系绘制所有点
        this.cacl(r).forEach((item, index) => {
          if (index === 0) {
            ctx.moveTo(item.x, item.y)
          }
          ctx.lineTo(item.x, item.y)
          if (j === 0) {
            this.drawText(ctx, item, index)
          }
        })
        ctx.fillStyle = this.option.areaStyle[j]
        ctx.fill()
        ctx.closePath()
        ctx.stroke()
        //明暗色替换填充
      }
    },
    // 绘制图例
    drawLegend(ctx) {
      let bottom = this.option.height - 10
      let initDis = 180
      this.option.legend.forEach((item, index) => {
        ctx.beginPath()
        ctx.fillStyle = item.color
        ctx.fillRect(initDis + 300 * index, bottom - 10, 50, 4)
        ctx.beginPath()
        ctx.fillStyle = '#555550'
        ctx.fillText(item.name, initDis + 60 + 300 * index, bottom)
      })
    },
    //绘制文字
    drawText(ctx, item, index) {
      ctx.fillStyle = '#555550'
      ctx.font = `${this.option.width / 30}px bold 黑体`
      if (item.x - this.center.x > 0.5) {
        ctx.textAlign = 'left'
        item.x = item.x + this.option.textGap
      } else if (item.x - this.center.x < -0.5) {
        ctx.textAlign = 'right'
        item.x = item.x - this.option.textGap
      } else {
        ctx.textAlign = 'center'
        item.y = item.y - this.center.y > 0 ? item.y + 20 + this.option.textGap : item.y - this.option.textGap
      }
      let name = this.option.indicator[index].name
      if (name.length > 4) {
        ctx.fillText(name.substr(0, 4), item.x, item.y)
        ctx.fillText(name.substr(4, 6), item.x, item.y + 30)
      } else {
        ctx.fillText(name, item.x, item.y)
      }
    },
    // 背景顶点连线
    drawLine(ctx) {
      ctx.beginPath()
      ctx.strokeStyle = '#E7F2FF'
      ctx.lineWidth = 1
      this.cacl(this.r - this.areaDis).forEach((item, index) => {
        ctx.moveTo(item.x, item.y)
        ctx.lineTo(this.center.x, this.center.y)
      })
      ctx.closePath()
      ctx.stroke()
    },
    // 把数据转换成点
    data2Point(data) {
      let arr = []
      data.forEach((item, index) => {
        if (item == 0) return
        let r = item * this.areaDis
        arr.push(this.caclSingle(r, index))
      })
      return arr
    },
    // 绘制数据
    drawData(dataCtx, data, opt) {
      let isFirstPoint = true
      let lg
      dataCtx.lineWidth = 4
      dataCtx.strokeStyle = opt.strokeColor
      dataCtx.beginPath()
      dataCtx.globalCompositeOperation = 'source-over'
      // 描点
      data.forEach((item) => {
        let img = new Image()
        img.src = opt.imgUrl
        if (isFirstPoint) {
          dataCtx.moveTo(item.x, item.y)
          isFirstPoint = false
        } else {
          dataCtx.lineTo(item.x, item.y)
        }
        img.onload = () => {
          dataCtx.drawImage(img, item.x - 8, item.y - 8, 15, 15)
        }
      })
      if (data.length <= 2) {
        dataCtx.lineTo(this.center.x, this.center.y)
      }
      lg = dataCtx.createLinearGradient(this.center.x, 0, this.center.x, this.option.height)
      opt.fillColor.forEach((item, index) => {
        lg.addColorStop(index, item)
      })
      dataCtx.fillStyle = lg
      dataCtx.fill()
      dataCtx.closePath()
      dataCtx.stroke()
      // let img = new Image()
      // img.src = dataCavas.toDataURL('image/jpg')
      // return img
    },
    // =============== 工具函数 ===================
    // 碰撞检测
    crashCheck(bDom, elDom, posX, posY) {
      let t1 = bDom.offsetTop,
        l1 = bDom.offsetLeft,
        r1 = bDom.offsetLeft + bDom.offsetWidth,
        b1 = bDom.offsetTop + bDom.offsetHeight
      let t2 = elDom.offsetTop,
        l2 = elDom.offsetLeft,
        r2 = elDom.offsetLeft + elDom.offsetWidth,
        b2 = elDom.offsetTop + elDom.offsetHeight
      //  l1 < l2 || t1 < t2  不用管
      if (b1 < b2) {
        elDom.style.top = posY - (this.listDis + elDom.offsetHeight) + 'px'
        elDom.style.left = posX + this.listDis + 'px'
      } else if (r1 < r2) {
        elDom.style.left = posX - (this.listDis + elDom.offsetWidth) + 'px'
        elDom.style.top = posY + this.listDis + 'px'
      } else {
        elDom.style.left = posX + this.listDis + 'px'
        elDom.style.top = posY + this.listDis + 'px'
      }
    },
    // 创建canvas
    createCtx() {
      let canvas = document.createElement('canvas')
      canvas.width = this.option.width
      canvas.height = this.option.height
      let ctx = canvas.getContext('2d')
      return { canvas, ctx }
    },
    // 获取canvas缩放比例
    getScale(dom) {
      return { w: this.option.width / dom.offsetWidth, h: this.option.height / dom.offsetHeight }
    },
    // 计算点的位置
    cacl(r) {
      let returnPoint = []
      for (var i = 0; i < this.length; i++) {
        returnPoint.push(this.caclSingle(r, i))
      }
      return returnPoint
    },
    caclSingle(r, num) {
      let round = -Math.PI / 2
      const x = Math.cos(round - ((2 * Math.PI) / this.length) * num) * r + this.center.x
      const y = Math.sin(round - ((2 * Math.PI) / this.length) * num) * r + this.center.y
      return { x, y }
    },
    // 计算面积
    calcArea(point, array) {
      let angle = 0
      for (let i = 0; i < array.length; i++) {
        let nextIndex = i + 1 >= array.length ? 0 : i + 1
        angle = angle + this.getAngle(array[i], array[nextIndex], point)
      }
      const endA = Math.floor((180 * angle) / Math.PI)
      if (endA <= 360 && endA >= 357) {
        return true
      }
      return false
    },
    //point3为夹角的点
    getAngle(point1, point2, point3) {
      const a = this.disPoint(point3, point2)
      const b = this.disPoint(point3, point1)
      const c = this.disPoint(point2, point1)
      const cos = (a + b - c) / (2 * Math.pow(a, 0.5) * Math.pow(b, 0.5))
      return Math.acos(cos)
    },
    disPoint(p1, p2) {
      return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
    },
  },
}
</script>

<style lang="scss" scoped>
.raddar-box {
  position: relative;
  &.hover {
    cursor: pointer;
  }
}
canvas {
  width: 400px;
  height: 400px;
}
.list {
  position: absolute;
  left: 0px;
  top: 0px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 5px;
  z-index: 999;
  display: none;
  padding: 5px 15px;
  color: #ffffff;
  min-width: 110px;
  transition: all 0.4s ease-in-out;
  p {
    margin-bottom: 2px;
  }
  li {
    line-height: 1.5;
  }
}
@media only screen and (max-width: 767px) {
  canvas {
    width: 100%;
    height: 100%;
  }
}
</style>