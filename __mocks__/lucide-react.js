
const React = require('react');

const createReactComponent = (displayName) => {
  const Component = (props) => React.createElement('div', props);
  Component.displayName = displayName;
  return Component;
};

const Icons = {
  Home: createReactComponent('Home'),
  HelpCircle: createReactComponent('HelpCircle'),
};

const IconsProxy = new Proxy(Icons, {
  get: function(target, prop) {
    if (prop in target) {
      return target[prop];
    }
    return undefined;
  }
});

module.exports = IconsProxy;
