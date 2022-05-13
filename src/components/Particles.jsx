import React from "react";
import Proton from "proton-engine";
import RAFManager from "raf-manager";
import Canvas from "./Canvas";
import img from "../assets/img";

export default class Particles extends React.Component {
  constructor(props) {
    super(props);

    this.loaded = false;
    this.center = { x: 0, y: 0 };
    this.conf = { radius: 170, tha: 0 };
    this.attractionBehaviours = [];
    this.renderProton = this.renderProton.bind(this);
  }

  handleCanvasInited(canvas) {
    this.createProton(canvas);
    RAFManager.add(this.renderProton);
  }

  componentWillUnmount() {
    try {
      RAFManager.remove(this.renderProton);
      this.proton.destroy();
    } catch (e) {}
  }

  createProton(canvas) {
    const proton = new Proton();

    const emitter = new Proton.Emitter();
    emitter.damping = 0.0075;
    emitter.rate = new Proton.Rate(600);

    emitter.addInitialize(new Proton.Body(img, 128, 128));
    emitter.addInitialize(
      new Proton.Mass(1),
      new Proton.Radius(Proton.getSpan(5, 10))
    );
    emitter.addInitialize(
      new Proton.Velocity(
        new Proton.Span(1, 3),
        new Proton.Span(0, 360),
        "polar"
      )
    );

    this.mouseInfo = {
      x: canvas.width / 2,
      y: canvas.height / 2
    };

    const attractionBehaviour = new Proton.Attraction(this.mouseInfo, 20, 1300);
    const repulsionBehaviour = new Proton.Repulsion(this.mouseInfo, 30, 350);
    const crossZoneBehaviour = new Proton.CrossZone(
      new Proton.RectZone(0, 0, canvas.width, canvas.height),
      "cross"
    );
    emitter.addBehaviour(
      attractionBehaviour,
      repulsionBehaviour,
      crossZoneBehaviour,
      new Proton.Color("random")
    );
    emitter.addBehaviour(new Proton.Scale(Proton.getSpan(0.1, 0.7)));
    emitter.addBehaviour(
      new Proton.Rotate(Proton.getSpan(0, 180), Proton.getSpan(-5, 5), "add")
    );

    emitter.p.x = canvas.width / 2;
    emitter.p.y = canvas.height / 2;
    emitter.emit("once");
    proton.addEmitter(emitter);

    const renderer = this.createRenderer(canvas);
    proton.addRenderer(renderer);

    this.proton = proton;
    this.renderer = renderer;
    this.attractionBehaviour = attractionBehaviour;
    this.crossZoneBehaviour = crossZoneBehaviour;
  }

  handleResize(width, height) {
    this.renderer.resize(width, height);
    this.crossZoneBehaviour.reset(
      new Proton.RectZone(0, 0, width, height),
      "cross"
    );
  }

  createRenderer(canvas) {
    const renderer = new Proton.WebGLRenderer(canvas);
    renderer.blendFunc("SRC_ALPHA", "ONE");
    return renderer;
  }

  renderProton() {
    this.proton.update();
    this.proton.stats.update(2);
  }

  handleMouseDown(e) {
    this.attractionBehaviour.reset(this.mouseInfo, 0, 0);
  }

  handleMouseMove(e) {
    let _x, _y;
    if (e.pageX || e.pageX === 0) {
      _x = e.pageX;
      _y = e.pageY;
    } else if (e.offsetX || e.offsetX === 0) {
      _x = e.offsetX;
      _y = e.offsetY;
    }

    this.mouseInfo.x = _x;
    this.mouseInfo.y = _y;
  }

  handleMouseUp(e) {
    this.attractionBehaviour.reset(this.mouseInfo, 20, 1300);
  }

  render() {
    return (
      <Canvas
        onMouseDown={this.handleMouseDown.bind(this)}
        onMouseMove={this.handleMouseMove.bind(this)}
        onMouseUp={this.handleMouseUp.bind(this)}
        onCanvasInited={this.handleCanvasInited.bind(this)}
        onResize={this.handleResize.bind(this)}
      />
    );
  }
}
