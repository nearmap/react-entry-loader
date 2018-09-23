import React from 'react';
import ReactDom from 'react-dom';

import {render, hydrate} from './render';

jest.mock('react-dom', ()=> ({
  render: jest.fn(),
  hydrate: jest.fn()
}));

const App = ()=> null;

/* global document */

describe('render()', ()=> {
  it('renders component into element', ()=> {
    const component = <App />;
    const targetElement = document.createElement('div');
    const getElemById = jest.spyOn(document, 'getElementById');
    getElemById.mockReturnValueOnce(targetElement);

    render('test-elem-id')(component);

    expect(ReactDom.render).toHaveBeenCalledWith(component, targetElement);
  });
});


describe('hydrate()', ()=> {
  it('hydrates component into element', ()=> {
    const component = <App />;
    const targetElement = document.createElement('div');
    const getElemById = jest.spyOn(document, 'getElementById');
    getElemById.mockReturnValueOnce(targetElement);

    hydrate('test-elem-id')(component);

    expect(ReactDom.hydrate).toHaveBeenCalledWith(component, targetElement);
  });
});
