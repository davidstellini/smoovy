import { Coordinate, objectDeepMerge } from '@smoovy/utils';

import { ScrollerDom, ScrollerDomConfig } from './dom';
import {
  ScrollerModule, ScrollerModuleConfig, ScrollerModuleConfigOverride,
  InputListener, OutputListener, RecalcListener,
} from './module';

export interface ScrollerConfig<
  M extends ScrollerModule = ScrollerModule
> extends ScrollerModuleConfig<
  M['inputs'],
  M['outputs'],
  M['transformers']
> {
  dom?: {
    elements?: {
      wrapper: HTMLElement;
      container: HTMLElement;
    },
    config?: ScrollerDomConfig;
  };
}

export const defaultConfig: ScrollerConfig = {
  transformer: {},
  input: {},
  output: {}
};

export class Scroller<M extends ScrollerModule = ScrollerModule> {
  private outputPosition: Coordinate = { x: 0, y: 0 };
  private virtualPosition: Coordinate = { x: 0, y: 0 };
  protected config = defaultConfig;
  public dom: ScrollerDom;
  public module: M;

  public constructor(
    private target: HTMLElement,
    config?: Partial<ScrollerConfig<M>>
  ) {
    if (config) {
      this.config = objectDeepMerge(this.config, config);
    }

    this.dom = new ScrollerDom(
      this.target,
      this.config.dom && this.config.dom.elements
        ? this.config.dom.elements.container : undefined,
      this.config.dom && this.config.dom.elements
        ? this.config.dom.elements.wrapper : undefined,
      this.config.dom ? this.config.dom.config : undefined
    );

    this.module = new this.moduleCtor(
      this.dom,
      {
        input: this.config.input,
        output: this.config.output,
        transformer: this.config.transformer,
        mapDelta: this.config.mapDelta,
        on: this.config.on
      }
    ) as M;

    this.dom.create();
    this.module.init();
    this.dom.onUpdate(() => this.module.recalc());

    this.attach();
  }

  protected get moduleCtor(): typeof ScrollerModule {
    return ScrollerModule;
  }

  private attach() {
    this.module.attach(
      this.virtualPosition,
      this.outputPosition
    );
  }

  private detach() {
    this.module.detach();
  }

  public destroy() {
    this.dom.destroy();
    this.detach();
  }

  public update(async = false) {
    this.dom.recalc(async);
    this.module.recalc(async);
  }

  public enableInputs(enabled = true) {
    this.module.enableInputs(enabled);
  }

  public disableInputs() {
    this.module.enableInputs(false);
  }

  public onInput(listener: InputListener) {
    return this.module.onInput(listener);
  }

  public onOutput(listener: OutputListener) {
    return this.module.onOutput(listener);
  }

  public onRecalc(listener: RecalcListener) {
    return this.module.onRecalc(listener);
  }

  public scrollTo<
    O extends M['outputs'] = M['outputs'],
    T extends M['transformers'] = M['transformers']
  >(
    position: Partial<Coordinate>,
    configOverride?: ScrollerModuleConfigOverride<O, T>
  ) {
    this.module.updatePosition(position, configOverride);
  }
}
