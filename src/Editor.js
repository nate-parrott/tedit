import React, { Component } from 'react';
import Hammer from 'react-hammerjs';
import './Editor.css';
import update from 'immutability-helper';

export default class Editor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      canvas: {
        shapes: {
          test: {
            w: 30,
            h: 30,
            x: 35,
            y: 35,
            scale: 1,
            fill: '#f00',
            rotation: 0
          }
        }
      }
    }
  }
  render()  {
    return (
      <div className='Editor'>
        <Canvas onChange={(c) => this.setState({canvas: c})} canvas={this.state.canvas} />
      </div>
    )
  }
}

let hammerOptions = {
  recognizers: {
    pan: {
      directon: Hammer.DIRECTION_ALL
    },
    pinch: {
      enable: true
    },
    rotate: {
      enable: true
    }
  }
}

class Canvas extends Component {
  constructor(props) {
    super(props);
    this.state = {width: null, selection: null};
    this.node = null;
  }
  render() {
    let style = {
      fontSize: this.scale()
    };
    let content = <div onTouchMove={(e) => e.preventDefault()} ref={(n) => this.node = n } style={style} className='Canvas'>{this.renderShapes()}</div>;
    return <Hammer onPanStart={this.panStart.bind(this)} 
                   onPan={this.pan.bind(this)} 
                   onPinchStart={this.pinchStart.bind(this)}
                   onPinch={this.pinch.bind(this)}
                   onRotateStart={this.rotateStart.bind(this)}
                   onRotate={this.rotate.bind(this)}
                   onTap={this.tap.bind(this)} 
                   options={hammerOptions}>
                   {content}
                   </Hammer>;
  }
  scale() {
    if (this.state.width !== null) {
      let scale = this.state.width / 100;
      return scale;
    }
    return 1;
  }
  renderShapes() {
    if (this.state.width === null) return null;
    let shapes = Object.keys(this.props.canvas.shapes).map((shapeId) => {
      let shape = this.props.canvas.shapes[shapeId];
      return <Shape shape={shape} key={shapeId} selected={shapeId === this.state.selection} onTap={() => this.setState({selection: shapeId})} />;
    })
    return shapes;
  }
  componentDidMount() {
    this.resize();
    window.addEventListener('resize', this.resize.bind(this));
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resize.bind(this));
  }
  resize() {
    if (this.node) this.setState({width: this.node.clientWidth});
  }
  // Gesture recs:
  panStart(e) {
    e.preventDefault();
    this.shapeStartPos = null;
    if (this.state.selection) {
      let shape = this.props.canvas.shapes[this.state.selection];
      this.shapeStartPos = {x: shape.x, y: shape.y};
    }
  }
  pan(e) {
    e.preventDefault();
    if (this.shapeStartPos && this.state.selection) {
      let newX = this.shapeStartPos.x + e.deltaX / this.scale();
      let newY = this.shapeStartPos.y + e.deltaY / this.scale();
      let shapeChanges = {shapes: {}};
      shapeChanges.shapes[this.state.selection] = {x: {$set: newX}, y: {$set: newY}};
      this.props.onChange(update(this.props.canvas, shapeChanges));
    }
  }
  pinchStart(e) {
    e.preventDefault();
    this.shapeStartScale = null;
    if (this.state.selection) {
      let shape = this.props.canvas.shapes[this.state.selection];
      this.shapeStartScale = shape.scale;
    }
  } 
  pinch(e) {
    e.preventDefault();
    if (this.shapeStartScale && this.state.selection) {
      let shapeChanges = {shapes: {}};
      shapeChanges.shapes[this.state.selection] = {scale: {$set: this.shapeStartScale * e.scale}};
      this.props.onChange(update(this.props.canvas, shapeChanges));
    }
  }
  rotateStart(e) {
    e.preventDefault();
    this.shapeStartRotation = null;
    if (this.state.selection) {
      let shape = this.props.canvas.shapes[this.state.selection];
      this.shapeStartRotation = shape.rotation - e.rotation;
    }
  }
  rotate(e) {
    e.preventDefault();
    if (this.shapeStartRotation !== null && this.state.selection) {
      let shapeChanges = {shapes: {}};
      shapeChanges.shapes[this.state.selection] = {rotation: {$set: this.shapeStartRotation + e.rotation}};
      this.props.onChange(update(this.props.canvas, shapeChanges));
    }
  }
  tap(e) {
    // console.log(e.currentTarget);
    // let shapeId = this.hitTest(e.center.x, e.center.y);
    // console.log(shapeId);
    // if (shapeId) {
    //   this.setState({selection: shapeId});
    // } else {
    //   this.setState({selection: null});
    // }
  }
  // helpers:
  hitTest(x, y) {
    let xs = x / this.scale();
    let ys = y / this.scale();
    for (let shapeId of Object.keys(this.props.canvas.shapes)) {
      let shape = this.props.canvas.shapes[shapeId];
      if (xs >= shape.x && xs <= shape.x + shape.w && ys >= shape.y && ys <= shape.y + shape.h) {
        return shapeId;
      }
    }
    return null;
  }
}

let Shape = ({shape, selected, onTap}) => {
  let transform = "scale(" + shape.scale + ") rotate(" + shape.rotation + "deg)";
  let style = {
    width: shape.w + 'em', 
    height: shape.h + 'em', 
    left: shape.x + 'em', 
    top: shape.y + 'em',
    backgroundColor: shape.fill,
    transform: transform
  };
  if (selected) style.boxShadow = '0px 0px 10px blue';
  return <div onClick={onTap} className='Shape' style={style}><span>hey</span></div>;
}

