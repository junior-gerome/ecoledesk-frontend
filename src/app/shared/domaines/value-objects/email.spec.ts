import { Email } from './email';

describe('Email', () => {
  it('accepts a valid address', () => {
    expect(Email.create('user@example.com').getValue()).toBe('user@example.com');
  });

  it('rejects an address without @', () => {
    expect(() => Email.create('userexample.com')).toThrowError('Email invalid');
  });
});
