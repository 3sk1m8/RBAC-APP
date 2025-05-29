import '@testing-library/jest-dom';
import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toMatchObject<E extends {} | any[]>(expected: E): R;
      toContain<E = any>(expected: E): R;
      toBe<E = any>(expected: E): R;
      toBeUndefined(): R;
      toEqual<E = any>(expected: E): R;
      toMatch(expected: string | RegExp): R;
      toHaveBeenCalledWith<E extends any[]>(...params: E): R;
    }
  }
}

// Global mocks for jsdom
const mock = () => {
  let storage: { [key: string]: string } = {};
  return {
    getItem: (key: string) => (key in storage ? storage[key] : null),
    setItem: (key: string, value: string) => (storage[key] = value || ''),
    removeItem: (key: string) => delete storage[key],
    clear: () => (storage = {}),
  };
};

Object.defineProperty(window, 'localStorage', { value: mock() });
Object.defineProperty(window, 'sessionStorage', { value: mock() });
Object.defineProperty(window, 'CSS', { value: null });

Object.defineProperty(window, 'getComputedStyle', { 
  value: () => ['-webkit-appearance'],
 });

Object.defineProperty(document, 'doctype', {
  value: '<!DOCTYPE html>'
});

Object.defineProperty(document.body.style, 'transform', {
    value: () => {
      return {
        enumerable: true,
        configurable: true
      };
    }
  });  

Object.defineProperty(window, 'getComputedStyle', {
  value: () => {
    return {
      display: 'none',
      appearance: ['-webkit-appearance'],
      getPropertyValue: () => ''
    };
  }
}); 