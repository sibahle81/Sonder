import { CurrencyCommaPipe } from './currency-comma.pipe';

describe('CurrencyCommaPipe', () => {
  it('create an instance', () => {
    const pipe = new CurrencyCommaPipe();
    expect(pipe).toBeTruthy();
  });
});
