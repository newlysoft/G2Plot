import { deepMix,uniqueId } from '@antv/util';
import { registerPlotType } from '../../base/global';
import { LayerConfig } from '../../base/layer';
import GaugeLayer from '../gauge/layer';
import { GaugeViewConfig } from '../gauge/options';
import { getOptions } from '../gauge/geometry/shape/options';
import { GaugeShape } from '../gauge/geometry/shape/gauge-shape';

export interface FanGaugeViewConfig extends GaugeViewConfig {
    stackField: string;
    connectedArea?: any;
}

export interface FanGaugeLayerConfig extends FanGaugeViewConfig, LayerConfig { }

export default class FanGaugeLayer<
    T extends FanGaugeLayerConfig = FanGaugeLayerConfig
    > extends GaugeLayer<T> {
    public static getDefaultOptions() {
        return deepMix({}, super.getDefaultOptions(), {
            legend: {
                visible: true,
                position: 'right-top',
            },
            label: {
                visible: false,
                position: 'middle',
                offset: 0,
                adjustColor: true,
            },
            connectedArea: {
                visible: false,
                triggerOn: 'mouseenter',
            },
        });
    }

    public type: string = 'fanGauge';

    protected getCustomStyle() {
        const { theme, styleMix } = this.options;
        const colors = styleMix.colors || this.config.theme.colors;

        return getOptions('fan', theme, colors);
    }

    protected annotation() {
        const annotationConfigs = [];
        const siderTexts = this.renderSideText();
        const allAnnotations = annotationConfigs.concat(siderTexts);
        this.setConfig('annotations', allAnnotations);
      } 

      protected initG2Shape() {
        this.gaugeShape = new GaugeShape(uniqueId());
        this.gaugeShape.setOption(
          this.options,
          this.getCustomStyle().pointerStyle,
          this.getCustomStyle().ringStyle
        );
        this.gaugeShape.render();
    }
}

registerPlotType('fanGauge', FanGaugeLayer);