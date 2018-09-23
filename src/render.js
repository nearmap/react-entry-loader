import ReactDOM from 'react-dom';


export const render = (elementId)=> (component)=> {
  // eslint-disable-next-line no-undef
  ReactDOM.render(component, document.getElementById(elementId));
};

export const hydrate = (elementId)=> (component)=> {
  // eslint-disable-next-line no-undef
  ReactDOM.hydrate(component, document.getElementById(elementId));
};
