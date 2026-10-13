const React = require('react');
const rnw = require('react-native-web');

const MockModal = ({ visible, children }) => {
  if (visible === false) return null;
  return React.createElement('div', { className: 'rn-modal-mock' }, children);
};

module.exports = {
  ...rnw,
  Modal: MockModal,
};
