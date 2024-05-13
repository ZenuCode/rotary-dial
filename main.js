const PHONE = {
    canvas: null,
    ctx: null,
    W: 0,
    H: 0,
    minWH: 0,
    dialer: { number: "" },
    mouse: {
      x: 0,
      y: 0,
      xDrag: 0,
      yDrag: 0,
      isDragging: false,
      get: function (e) {
        const rect = PHONE.canvas.getBoundingClientRect();
        this.x = e.clientX - rect.left;
        this.y = e.clientY - rect.top;
      },
      down: function (e) {
        this.get(e);
        this.xDrag = this.x;
        this.yDrag = this.y;
        this.isDragging = true;
      },
      up: function (e) {
        this.get(e);
        this.isDragging = false;
      },
      move: function (e) {
        this.get(e);
      },
      draw: function (e) {
        PHONE.pen.circle(this.x, this.y, 5);
      },
    },
    pen: {
      clear: function () {
        PHONE.ctx.clearRect(0, 0, PHONE.W, PHONE.H);
      },
      circle: function (x, y, r) {
        PHONE.ctx.beginPath();
        PHONE.ctx.arc(x, y, r, 0, Math.PI * 2, true);
        PHONE.ctx.fill();
      },
    },
    phone: {
      alpha: 0,
      oBeta: (Math.PI * 4) / 9,
      dBeta: Math.PI / 7,
      rBeta: Math.PI / 24,
      r0: 0.35,
      r2: 0.23,
      r1: 0.29,
      r3: 0.04,
      activeDigit: -1,
      setDrag: function () {
        const xc = this.centroid.x;
        const yc = this.centroid.y;
        this.alpha = Math.max(
          0,
          PHONE.math.getAngle(
            PHONE.W * xc,
            PHONE.H * yc,
            PHONE.mouse.x,
            PHONE.mouse.y
          ) -
            PHONE.math.getAngle(
              PHONE.W * xc,
              PHONE.H * yc,
              PHONE.mouse.xDrag,
              PHONE.mouse.yDrag
            )
        );
        if (this.alpha > (10 - this.activeDigit) * this.dBeta + this.rBeta) {
          PHONE.mouse.isDragging = false;
          if (PHONE.dialer.number.length < 12) PHONE.dialer.number += this.activeDigit;
          if (PHONE.dialer.number.length === 3 || PHONE.dialer.number.length === 7)
            PHONE.dialer.number += "-";
          this.activeDigit = -1;
        }
      },
      setActiveDigit: function () {
        this.activeDigit = -1;
        for (let i = 0; i < 10; i++) {
          const angle = this.oBeta + this.dBeta * i + this.alpha;
          const xt = PHONE.W * this.centroid.x + PHONE.minWH * this.r1 * Math.cos(angle);
          const yt = PHONE.H * this.centroid.y + PHONE.minWH * this.r1 * Math.sin(angle);
          if (
            PHONE.math.getDistance(PHONE.mouse.x, PHONE.mouse.y, xt, yt) <
            PHONE.minWH * this.r3
          ) {
            this.activeDigit = i;
          }
        }
      },
      drawRing: function () {
        const xc = this.centroid.x;
        const yc = this.centroid.y;
        PHONE.ctx.fillStyle = "#000000";
        PHONE.pen.circle(PHONE.W * xc, PHONE.H * yc, PHONE.minWH * this.r0);
        PHONE.ctx.fillStyle = "rgb(240,245,240)";
        PHONE.pen.circle(PHONE.W * xc, PHONE.H * yc, PHONE.minWH * this.r2);
      },
      drawLine: function () {
        const angle = this.oBeta + 10 * this.dBeta + this.rBeta;
        const xc = this.centroid.x;
        const yc = this.centroid.y;
        PHONE.ctx.strokeStyle = "#ffffff";
        PHONE.ctx.beginPath();
        PHONE.ctx.moveTo(
          PHONE.W * xc + this.r0 * PHONE.minWH * Math.cos(angle),
          PHONE.H * yc + this.r0 * PHONE.minWH * Math.sin(angle)
        );
        PHONE.ctx.lineTo(
          PHONE.W * xc + this.r1 * PHONE.minWH * Math.cos(angle),
          PHONE.H * yc + this.r1 * PHONE.minWH * Math.sin(angle)
        );
        PHONE.ctx.lineWidth = PHONE.minWH / 150;
        PHONE.ctx.stroke();
      },
      drawNumber: function () {
        PHONE.ctx.font = PHONE.minWH / 25 + "px " + this.fontString;
        PHONE.ctx.fillStyle = "#000000";
        PHONE.ctx.fillText(
          PHONE.dialer.number,
          PHONE.W * this.text.x,
          PHONE.H * this.text.y
        );
      },
      drawDigits: function () {
        PHONE.ctx.font = PHONE.minWH / 18 + "px Courier";
        for (let i = 0; i < 10; i++) {
          const angle = this.oBeta + this.dBeta * i + this.alpha;
          PHONE.ctx.fillStyle =
            this.activeDigit === i ? "rgb(90,205,200)" : "rgb(240,245,240)";
          PHONE.pen.circle(
            PHONE.W * this.centroid.x + PHONE.minWH * this.r1 * Math.cos(angle),
            PHONE.H * this.centroid.y + PHONE.minWH * this.r1 * Math.sin(angle),
            PHONE.minWH * this.r3
          );
          PHONE.ctx.fillStyle = "#444444";
          PHONE.ctx.fillText(
            i,
            PHONE.W * this.centroid.x + PHONE.minWH * this.r1 * Math.cos(angle),
            PHONE.H * this.centroid.y + PHONE.minWH * this.r1 * Math.sin(angle)
          );
        }
      },
      centroid: { x: 0.5, y: 0.55 },
      text: { x: 0.5, y: 0.1 },
    },
    math: {
      getDistance: function (x1, y1, x2, y2) {
        return Math.hypot(x1 - x2, y1 - y2);
      },
      getAngle: function (x1, y1, x2, y2) {
        let angle = Math.atan2(y2 - y1, x2 - x1);
        if (angle < 0) angle += 2 * Math.PI;
        return angle;
      },
    },
    draw: function () {
      PHONE.pen.clear();
      PHONE.ctx.textAlign = "center";
      PHONE.ctx.textBaseline = "middle";
      PHONE.phone.drawRing();
      PHONE.phone.drawLine();
      PHONE.phone.drawNumber();
      PHONE.phone.drawDigits();
      if (PHONE.phone.alpha > 0 && !PHONE.mouse.isDragging) {
        PHONE.phone.alpha -= 0.02;
      }
    },
    mouseUp: function (e) {
      PHONE.mouse.up(e);
    },
    mouseDown: function (e) {
      PHONE.mouse.down(e);
      PHONE.mouse.isDragging =
        PHONE.phone.alpha < 0.03 && PHONE.phone.activeDigit !== -1;
      if (PHONE.phone.text.isHovered()) {
        PHONE.dialer.dial();
      }
    },
    mouseMove: function (e) {
      PHONE.mouse.move(e);
      if (PHONE.mouse.isDragging) {
        PHONE.phone.setDrag();
      } else if (PHONE.phone.alpha < 0.03) {
        PHONE.phone.setActiveDigit();
      }
      PHONE.fontString = PHONE.phone.text.isHovered() ? "bold " : "";
      PHONE.fontString += PHONE.minWH / 30 + "px Courier";
    },
    init: function () {
      document.addEventListener("touchstart", PHONE.touchHandler, true);
      document.addEventListener("touchmove", PHONE.touchHandler, true);
      document.addEventListener("touchend", PHONE.touchHandler, true);
      document.addEventListener("touchcancel", PHONE.touchHandler, true);
      this.canvas = document.getElementById("phone");
      this.ctx = this.canvas.getContext("2d");
      this.resizeCanvas();
      setInterval(this.draw, 10);
      this.canvas.addEventListener("mousedown", this.mouseDown);
      this.canvas.addEventListener("mousemove", this.mouseMove);
      this.canvas.addEventListener("mouseup", this.mouseUp);
      window.addEventListener("resize", this.resizeCanvas, false);
    },
    resizeCanvas: function () {
      PHONE.canvas.width = window.innerWidth;
      PHONE.canvas.height = window.innerHeight;
      PHONE.W = PHONE.canvas.width;
      PHONE.H = PHONE.canvas.height;
      PHONE.minWH = Math.min(PHONE.W, PHONE.H);
    },
    touchHandler: function (event) {
      const touch = event.changedTouches[0];
      const simulatedEvent = new MouseEvent(
        {
          touchstart: "mousedown",
          touchmove: "mousemove",
          touchend: "mouseup",
        }[event.type],
        {
          bubbles: true,
          cancelable: true,
          view: window,
          detail: 1,
          screenX: touch.screenX,
          screenY: touch.screenY,
          clientX: touch.clientX,
          clientY: touch.clientY,
        }
      );
      touch.target.dispatchEvent(simulatedEvent);
      event.preventDefault();
    },
  };
  
  PHONE.init();
  