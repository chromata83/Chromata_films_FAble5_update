/* ============================================================
   <pixel-canvas> — vanilla port of the 21st.dev PixelCanvas
   component (https://21st.dev/@serafim/components/pixel-canvas).
   A grid of tiny squares shimmers to life while the PARENT
   element is hovered (or focused), then dissolves on leave.
   Attributes: data-gap, data-speed, data-colors, data-variant
   ("default" | "icon" — icon radiates from the centre),
   data-no-focus.
   ============================================================ */
(() => {
  "use strict";

  class Pixel {
    constructor(canvas, context, x, y, color, speed, delay) {
      this.width = canvas.width;
      this.height = canvas.height;
      this.ctx = context;
      this.x = x;
      this.y = y;
      this.color = color;
      this.speed = this.getRandomValue(0.1, 0.9) * speed;
      this.size = 0;
      this.sizeStep = Math.random() * 0.4;
      this.minSize = 0.5;
      this.maxSizeInteger = 2;
      this.maxSize = this.getRandomValue(this.minSize, this.maxSizeInteger);
      this.delay = delay;
      this.counter = 0;
      this.counterStep = Math.random() * 4 + (this.width + this.height) * 0.01;
      this.isIdle = false;
      this.isReverse = false;
      this.isShimmer = false;
    }
    getRandomValue(min, max) { return Math.random() * (max - min) + min; }
    draw() {
      const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5;
      this.ctx.fillStyle = this.color;
      this.ctx.fillRect(this.x + centerOffset, this.y + centerOffset, this.size, this.size);
    }
    appear() {
      this.isIdle = false;
      if (this.counter <= this.delay) { this.counter += this.counterStep; return; }
      if (this.size >= this.maxSize) this.isShimmer = true;
      if (this.isShimmer) this.shimmer();
      else this.size += this.sizeStep;
      this.draw();
    }
    disappear() {
      this.isShimmer = false;
      this.counter = 0;
      if (this.size <= 0) { this.isIdle = true; return; }
      this.size -= 0.1;
      this.draw();
    }
    shimmer() {
      if (this.size >= this.maxSize) this.isReverse = true;
      else if (this.size <= this.minSize) this.isReverse = false;
      this.size += this.isReverse ? -this.speed : this.speed;
    }
  }

  class PixelCanvas extends HTMLElement {
    get colors() {
      return (this.dataset.colors || "#f8fafc,#f1f5f9,#cbd5e1").split(",");
    }
    get gap() {
      const value = parseInt(this.dataset.gap || 5, 10);
      return Math.min(50, Math.max(4, value));
    }
    get speed() {
      const value = parseInt(this.dataset.speed || 35, 10);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      return reduced || value <= 0 ? 0 : Math.min(100, value) * 0.001;
    }
    get variant() { return this.dataset.variant || "default"; }
    get noFocus() { return this.hasAttribute("data-no-focus"); }

    connectedCallback() {
      if (this.shadowRoot) return;
      const shadow = this.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      style.textContent = ":host{display:grid;inline-size:100%;block-size:100%;overflow:hidden}";
      this.canvas = document.createElement("canvas");
      shadow.append(style, this.canvas);
      this.ctx = this.canvas.getContext("2d");
      this.timeInterval = 1000 / 60;
      this.timePrevious = performance.now();
      this.pixels = [];
      this._raf = null;

      this._parent = this.parentElement;
      this._onEnter = () => this.handleAnimation("appear");
      this._onLeave = () => this.handleAnimation("disappear");
      this._parent.addEventListener("mouseenter", this._onEnter);
      this._parent.addEventListener("mouseleave", this._onLeave);
      if (!this.noFocus) {
        this._parent.addEventListener("focusin", this._onEnter);
        this._parent.addEventListener("focusout", this._onLeave);
      }
      this._ro = new ResizeObserver(() => this.init());
      this._ro.observe(this);
      this.init();
    }

    disconnectedCallback() {
      if (this._ro) this._ro.disconnect();
      if (this._raf) cancelAnimationFrame(this._raf);
      if (this._parent) {
        this._parent.removeEventListener("mouseenter", this._onEnter);
        this._parent.removeEventListener("mouseleave", this._onLeave);
        this._parent.removeEventListener("focusin", this._onEnter);
        this._parent.removeEventListener("focusout", this._onLeave);
      }
    }

    init() {
      const rect = this.getBoundingClientRect();
      const width = Math.floor(rect.width);
      const height = Math.floor(rect.height);
      if (!width || !height) return;
      this.canvas.width = width;
      this.canvas.height = height;
      this.pixels = [];
      for (let x = 0; x < width; x += this.gap) {
        for (let y = 0; y < height; y += this.gap) {
          const color = this.colors[Math.floor(Math.random() * this.colors.length)];
          const delay = this.variant === "icon"
            ? this.distanceToCenter(x, y, width, height)
            : this.distanceToBottomLeft(x, y, height);
          this.pixels.push(new Pixel(this.canvas, this.ctx, x, y, color, this.speed, delay));
        }
      }
    }

    distanceToCenter(x, y, w, h) {
      const dx = x - w / 2, dy = y - h / 2;
      return Math.sqrt(dx * dx + dy * dy);
    }
    distanceToBottomLeft(x, y, h) {
      const dy = h - y;
      return Math.sqrt(x * x + dy * dy);
    }

    handleAnimation(name) {
      if (this._raf) cancelAnimationFrame(this._raf);
      const loop = () => {
        this._raf = requestAnimationFrame(loop);
        const now = performance.now();
        const elapsed = now - this.timePrevious;
        if (elapsed < this.timeInterval) return;
        this.timePrevious = now - (elapsed % this.timeInterval);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let allIdle = true;
        for (const p of this.pixels) { p[name](); if (!p.isIdle) allIdle = false; }
        if (name === "disappear" && allIdle) { cancelAnimationFrame(this._raf); this._raf = null; }
      };
      loop();
    }
  }

  if (!customElements.get("pixel-canvas")) customElements.define("pixel-canvas", PixelCanvas);
})();
