import { Resolver } from '../src';

describe('general', () => {
  it('should not resolve', () => {
    const resolver = new Resolver();

    resolver.promise.then(() => fail(), () => fail());
  });

  it('should resolve', (done) => {
    const resolver = new Resolver();

    resolver.promise.then(() => {
      expect(resolver.completed).toBe(true);
      done();
    }, () => fail());
    resolver.resolve();
  });

  it('should fail resolve', (done) => {
    const resolver = new Resolver();

    resolver.promise.then(() => fail(), () => {
      expect(resolver.completed).toBe(true);
      done();
    });

    resolver.reject();
  });

  it('should not resolve twice', () => {
    const resolver = new Resolver();

    resolver.resolve();

    expect(resolver.resolve).toThrowError();
  });

  it('should not reject twice', () => {
    const resolver = new Resolver();

    resolver.promise.catch(() => {});
    resolver.reject();

    expect(resolver.reject).toThrowError();
  });

  it('should resolve with value', (done) => {
    const resolver = new Resolver<string>();

    resolver.promise.then((val) => {
      expect(val).toBe('test');
      done();
    }, () => fail());

    resolver.resolve('test');
  });

  it('should reject with value', (done) => {
    const resolver = new Resolver<string>();

    resolver.promise.then(() => fail(), (val) => {
      expect(val).toBe('error');
      done();
    });

    resolver.reject('error');
  });

  it('should fail on two resolved', (done) => {
    const resolver = new Resolver<string>();

    resolver.promise.then((val) => {
      expect(val).toBe('test');
      setTimeout(() => done(), 50);
    }, () => fail());

    resolver.resolve('test');

    expect(() => resolver.resolve('test')).toThrowError();
    expect(() => resolver.reject()).toThrowError();
  });
});
