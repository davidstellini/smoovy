import { EventEmitter } from '../src';

describe('emitter', () => {
  const emitter = new EventEmitter();

  it('should emit/receive one event', () => {
    const listener = jest.fn();
    const unlisten = emitter.on('test', listener);

    emitter.emit('test', 1337);
    unlisten();
    emitter.emit('test', 1337);

    expect(listener).toBeCalledTimes(1);
    expect(listener).toBeCalledWith(1337);
  });

  it('should emit/receive multiple events', () => {
    const listener1 = jest.fn();
    const listener2 = jest.fn();
    const unlisten1 = emitter.on('test1', listener1);
    const unlisten2 = emitter.on('test2', listener2);
    const events = { test1: 't1', test2: 't2' };

    emitter.emit(events);
    emitter.emit(events);

    unlisten1();
    unlisten2();

    emitter.emit(events);
    emitter.emit(events);

    expect(listener1).toBeCalledTimes(2);
    expect(listener2).toBeCalledTimes(2);
    expect(listener1).toBeCalledWith(events.test1);
    expect(listener2).toBeCalledWith(events.test2);
  });

  it('should receive data from callbacks', () => {
    const eventName = 'request';
    const emissions = jest.fn();
    const unlisten1 = emitter.on(eventName, (num?) => 'response' + (num || ''));
    const unlisten2 = emitter.on(eventName, (num?) => 'response' + (num || ''));
    const emitEvent = (num: string) => {
      emitter.emit<string>(eventName, num, (data) => {
        expect(data === 'response1' || data === 'response2').toBe(true);
        emissions();
      });

      emitter.emit<string>(eventName, (data) => {
        expect(data).toStrictEqual('response');
        emissions();
      });
    };

    emitEvent('1');
    emitEvent('2');
    unlisten1();
    unlisten2();
    emitEvent('1');

    expect(emissions).toBeCalledTimes(8);
  });

  it('should mute/unmute events', () => {
    const listener = jest.fn();
    const unlisten = emitter.on('test', listener);

    emitter.emit('test');

    const unmute = emitter.muteEvents('test');
    emitter.emit('test');
    emitter.emit('test');
    emitter.emit('test');

    expect(emitter.isEventMuted('test')).toBeTruthy();
    unmute();

    emitter.emit('test');

    unlisten();

    expect(emitter.isEventMuted('test')).toBeFalsy();
    expect(listener).toBeCalledTimes(2);
  });

  it('should detect listener count for events', () => {
    const unlisten1 = emitter.on('test1', () => {});
    const unlisten2 = emitter.on('test1', () => {});
    const unlisten3 = emitter.on('test2', () => {});

    expect(emitter.hasEventListeners('test1')).toBeTruthy();
    expect(emitter.hasEventListeners('test2')).toBeTruthy();

    unlisten1();
    unlisten2();
    unlisten3();

    expect(emitter.hasEventListeners('test1')).toBeFalsy  ();
    expect(emitter.hasEventListeners('test2')).toBeFalsy();
  });
});
