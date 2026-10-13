const React = require('react');

const defaultInsets = { top: 44, bottom: 34, left: 0, right: 0 };
const defaultFrame = { width: 390, height: 844, x: 0, y: 0 };

const SafeAreaInsetsContext = React.createContext(defaultInsets);
const SafeAreaFrameContext = React.createContext(defaultFrame);

const SafeAreaProvider = ({ children }) => children;
const SafeAreaView = ({ children, style }) => React.createElement('div', { style }, children);
const useSafeAreaInsets = () => defaultInsets;
const useSafeAreaFrame = () => defaultFrame;

module.exports = {
  SafeAreaInsetsContext,
  SafeAreaFrameContext,
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
  useSafeAreaFrame,
  initialWindowMetrics: { frame: defaultFrame, insets: defaultInsets },
};
