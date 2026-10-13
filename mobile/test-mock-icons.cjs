const React = require('react');

const MockIcon = (props) => {
  return React.createElement('span', { 'data-icon': props.name, className: 'mock-icon' });
};

MockIcon.glyphMap = {};

module.exports = {
  Ionicons: MockIcon,
  AntDesign: MockIcon,
  Feather: MockIcon,
  MaterialIcons: MockIcon,
};
