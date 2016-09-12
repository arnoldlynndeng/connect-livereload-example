var parseTime = d3.timeParse("%Y");

var svg = d3.select("svg");

var margin = {top: 30, right: 50, bottom: 30, left: 30},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    labelPadding = 3;

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.tsv("data/data.tsv", function(d) {
  d.date = parseTime(d.date);
  for (var k in d) if (k !== "date") d[k] = +d[k];
  return d;
}, function(error, data) {
  if (error) throw error;

  var series = data.columns.slice(1).map(function(key) {
    return data.map(function(d) {
      return {
        key: key,
        date: d.date,
        value: d[key]
      };
    });
  });

  var x = d3.scaleTime()
      .domain([data[0].date, data[data.length - 1].date])
      .range([0, width]);

  var y = d3.scaleLinear()
      .domain([0, d3.max(series, function(s) { return d3.max(s, function(d) { return d.value; }); })])
      .range([height, 0]);

  var z = d3.schemeCategory10;

  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  var serie = g.selectAll(".serie")
      .data(series)
    .enter().append("g")
      .attr("class", "serie");

  serie.append("path")
      .attr("class", "line")
      .style("stroke", function(d) { return z[d[0].key]; })
      .attr("d", d3.line()
          .x(function(d) { return x(d.date); })
          .y(function(d) { return y(d.value); }));

  var label = serie.selectAll(".label")
      .data(function(d) { return d; })
    .enter().append("g")
      .attr("class", "label")
      .attr("transform", function(d, i) { return "translate(" + x(d.date) + "," + y(d.value) + ")"; });

  label.append("text")
      .attr("dy", ".35em")
      .text(function(d) { return d.value; })
    .filter(function(d, i) { return i === data.length - 1; })
    .append("tspan")
      .attr("class", "label-key")
      .text(function(d) { return " " + d.key; });

  label.append("rect", "text")
      .datum(function(data) {return this.getBBox() })
      .attr("x", function(d) { return d.x - labelPadding; })
      .attr("y", function(d) { return d.y - labelPadding; })
      .attr("width", function(d) { return d.width + 2 * labelPadding; })
      .attr("height", function(d) { return d.height + 2 * labelPadding; });
});
(function () {
  var _$ = function (_this) {
    return _this.constructor == jQuery ? _this : $(_this);
  };
// 获取当前时间
  function now() {
    return +new Date();
  }

// 转化为整数
  function toInteger(text) {
    text = parseInt(text);
    return isFinite(text) ? text : 0;
  }

  var Parabola = function (options) {
    this.initialize(options);
  };
  Parabola.prototype = {
    constructor: Parabola,
    /**
     * 初始化
     * @classDescription 初始化
     * @param {Object} options 插件配置 .
     */
    initialize: function (options) {
    	console.log(this,'this')
      this.options = this.options || this.getOptions(options);
      var ops = this.options;
      if (!this.options.el) {
        return;
      }
      this.$el = _$(ops.el);
      this.timerId = null;
      this.elOriginalLeft = toInteger(this.$el.css("left"));
      this.elOriginalTop = toInteger(this.$el.css("top"));
      // this.driftX X轴的偏移总量
      //this.driftY Y轴的偏移总量
      if (ops.targetEl) {
        this.driftX = toInteger(_$(ops.targetEl).css("left")) - this.elOriginalLeft;
        this.driftY = toInteger(_$(ops.targetEl).css("top")) - this.elOriginalTop;
      } else {
        this.driftX = ops.offset[0];
        this.driftY = ops.offset[1];
      }
      this.duration = ops.duration;
      // 处理公式常量
      this.curvature = ops.curvature;
      // 根据两点坐标以及曲率确定运动曲线函数（也就是确定a, b的值）
      //a=this.curvature
      /* 公式： y = a*x*x + b*x + c;
       */
      /*
       * 因为经过(0, 0), 因此c = 0
       * 于是：
       * y = a * x*x + b*x;
       * y1 = a * x1*x1 + b*x1;
       * y2 = a * x2*x2 + b*x2;
       * 利用第二个坐标：
       * b = (y2+ a*x2*x2) / x2
       */
      // 于是
      this.b = ( this.driftY - this.curvature * this.driftX * this.driftX ) / this.driftX;

      //自动开始
      if (ops.autostart) {
        this.start();
      }
    },
    /**
     * 初始化 配置参数 返回参数MAP
     * @param {Object} options 插件配置 .
     * @return {Object} 配置参数
     */
    getOptions: function (options) {
      if (typeof options !== "object") {
        options = {};
      }
      options = $.extend({}, defaultSetting, _$(options.el).data(), (this.options || {}), options);

      return options;
    },
    /**
     * 定位
     * @param {Number} x x坐标 .
     * @param {Object} y y坐标 .
     * @return {Object} this
     */
    domove: function (x, y) {

      this.$el.css({
        position: "absolute",
        left: this.elOriginalLeft + x,
        top: this.elOriginalTop + y
      });

      return this;
    },
    /**
     * 每一步执行
     * @param {Data} now 当前时间 .
     * @return {Object} this
     */
    step: function (now) {
      var ops = this.options;
      var x, y;
      if (now > this.end) {
        // 运行结束
        x = this.driftX;
        y = this.driftY;
        this.domove(x, y);
        this.stop();
        if (typeof ops.callback === 'function') {
          ops.callback.call(this);
        }
      } else {
        //x 每一步的X轴的位置
        x = this.driftX * ((now - this.begin) / this.duration);
        //每一步的Y轴的位置y = a*x*x + b*x + c;   c==0;
        y = this.curvature * x * x + this.b * x;

        this.domove(x, y);
        if (typeof ops.stepCallback === 'function') {
          ops.stepCallback.call(this, x, y);
        }
      }
      return this;
    },
    /**
     * 设置options
     *  @param {Object} options 当前时间 .
     */
    setOptions: function (options) {
      this.reset();
      if (typeof options !== "object") {
        options = {};
      }
      this.options = this.getOptions(options);
      this.initialize('parabola', this.options);
      return this;
    },
    /**
     * 开始
     */
    start: function () {
      var self = this;
      // 设置起止时间
      this.begin = now();
      this.end = this.begin + this.duration;
      if (this.driftX === 0 && this.driftY === 0) {
        // 原地踏步就别浪费性能了
        return;
      }
      /*timers.push(this);
       Timer.start();*/
      if (!!this.timerId) {
        clearInterval(this.timerId);
        this.stop();
      }
      this.timerId = setInterval(function () {
        var t = now();
        self.step(t);

      }, 13);
      return this;
    },
    /**
     * 重置
     */
    reset: function (x, y) {
      this.stop();
      x = x ? x : 0;
      y = y ? y : 0;
      this.domove(x, y);
      return this;
    },
    /**
     * 停止
     */
    stop: function () {
      if (!!this.timerId) {
        clearInterval(this.timerId);

      }
      return this;
    }
  };
  var defaultSetting = {
    el: null,
    //偏移位置
    offset: [0, 0],
    //终点元素，这时就会自动获取该元素的left、top，设置了这个参数，offset将失效
    targetEl: null,
    //运动的时间，默认500毫秒
    duration: 500,
    //抛物线曲率，就是弯曲的程度，越接近于0越像直线，默认0.001
    curvature: 0.001,
    //运动后执行的回调函数
    callback: null,
    // 是否自动开始，默认为false
    autostart: false,
    //运动过程中执行的回调函数
    stepCallback: null
  };
  window.Parabola = Parabola;
})();

var bool = new Parabola({
    el: "#boll1",
    // offset: [500, 100],
    curvature: 0.01,
    duration: 1000,
    targetEl: '#boll2',
    callback: function () {
    	var _target = $('#boll2');
    	var num = _target.text() || 0
    	num = parseInt(num) + 1 
      _target.text(num)
    },
    stepCallback: function (x, y) {
      $("<div>").appendTo("body").css({
        "position": "absolute",
        "top": this.elOriginalTop + y,
        "left": this.elOriginalLeft + x,
        "background-color": "#CDCDCD",
        "width": "5px",
        "height": "5px",
        "border-radius": "5px"
      });
    }
  });
$('#js-start').on('click', function() {
	bool.start()
})