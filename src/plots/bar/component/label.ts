import { each, deepMix, clone } from '@antv/util';
import { Group, IGroup } from '@antv/g-canvas';
import { View } from '@antv/g2';
import { rgb2arr } from '../../../util/color';

function mappingColor(band, gray) {
  let reflect;
  each(band, (b) => {
    const map = b;
    if (gray >= map.from && gray < map.to) {
      reflect = map.color;
    }
  });
  return reflect;
}


const DEFAULT_OFFSET = 8;

export interface BarLabelConfig {
  visible: boolean;
  position?: 'left' | 'right' | 'middle';
  formatter?: (...args: any[]) => string;
  offsetX?: number;
  offsetY?: number;
  style?: any;
  adjustColor?: boolean;
  adjustPosition?: boolean;
}

export interface IBarLabel extends BarLabelConfig {
  view: View;
  plot: any;
}

export default class BarLabel {
  public options: BarLabelConfig;
  public destroyed: boolean = false;
  private plot: any;
  private view: View;
  private container: Group;

  constructor(cfg: IBarLabel) {
    this.view = cfg.view;
    this.plot = cfg.plot;
    const defaultOptions = this.getDefaultOptions();
    this.options = deepMix(defaultOptions, cfg, {});
    this.init();
  }

  protected init() {
    this.container = this.getGeometry().labelsContainer;
    this.view.on('beforerender', () => {
      this.clear();
      this.plot.canvas.draw();
    });
  }

  public render() {
    const elements = this.getGeometry().elements;
    each(elements, (ele) => {
      const { shape } = ele;
      let style = this.options.style;
      const position = this.getPosition(shape);
      const textAlign = this.getTextAlign();
      const value = this.getValue(shape);
      const color = this.getTextColor(shape);
      if (this.options.position !== 'right' && this.options.adjustColor && color !== 'black') {
        style.stroke = null;
      }
      const formatter = this.options.formatter;
      const content = formatter ? formatter(value) : value;
      const label = this.container.addShape('text', {
        attrs: deepMix({}, style, {
          x: position.x,
          y: position.y,
          text: content,
          fill: color,
          textAlign,
          textBaseline: 'middle',
        }),
      });
    });
  }

  public clear() {
    if (this.container) {
      this.container.clear();
    }
  }

  public hide() {
    this.container.set('visible', false);
    this.plot.canvas.draw();
  }

  public show() {
    this.container.set('visible', true);
    this.plot.canvas.draw();
  }

  public destory() {
    if (this.container) {
      this.container.remove();
    }
    this.destroyed = true;
  }

  public getBBox() {}

  protected getPosition(shape){
    const bbox = shape.getBBox();  
    const { minX,maxX,minY,height,width } = bbox;
    const { offsetX, offsetY, position } = this.options;
    const y = minY + height / 2 + offsetY;
    let x;
    if(position === 'left'){
      x = minX + offsetX;
    }else if(position === 'right'){
      x = maxX + offsetX;
    }else{
      x = minX + width / 2 + offsetX
    }

    return { x,y };
  }

  protected getTextColor(shape){
    if (this.options.adjustColor && this.options.position !== 'right') {
      const shapeColor = shape.attr('fill');
      const shapeOpacity = shape.attr('opacity') ? shape.attr('opacity') : 1;
      const rgb = rgb2arr(shapeColor);
      const gray = Math.round(rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114) / shapeOpacity;
      const colorBand = [
        { from: 0, to: 85, color: 'white' },
        { from: 85, to: 170, color: '#F6F6F6' },
        { from: 170, to: 255, color: 'black' },
      ];
      const reflect = mappingColor(colorBand, gray);
      return reflect;
    }
    const defaultColor = this.options.style.fill;
    return defaultColor;
  }

  protected getTextAlign(){
    const { position } = this.options;
    const alignOptions = {
      right: 'left',
      left: 'left',
      middle: 'center'
    };

    return alignOptions[position];
  }

  protected getValue(shape){
    const data = shape.get('origin').data;
    return data[this.plot.options.xField];
  }

  private getDefaultOptions() {
    const { theme } = this.plot;
    const labelStyle = theme.label.style;
    return {
      offsetX: DEFAULT_OFFSET,
      offsetY: 0,
      style: clone(labelStyle),
    };
  }

  private getGeometry() {
    const { geometries } = this.view;
    let lineGeom;
    each(geometries, (geom) => {
      if (geom.type === 'interval') {
        lineGeom = geom;
      }
    });
    return lineGeom;
  }

}