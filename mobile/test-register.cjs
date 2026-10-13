const path = require('path');
const Module = require('module');
const origResolve = Module._resolveFilename;

if (typeof global.__DEV__ === 'undefined') {
  global.__DEV__ = true;
}

Module._resolveFilename = function (request, parent, isMain, options) {
  if (request === 'react-native') {
    return path.join(__dirname, 'test-mock-rn.cjs');
  } else if (request === '@expo/vector-icons' || request.startsWith('@expo/vector-icons')) {
    return path.join(__dirname, 'test-mock-icons.cjs');
  } else if (request === 'expo-image-picker' || request.startsWith('expo-image-picker')) {
    return path.join(__dirname, 'test-mock-image-picker.cjs');
  } else if (request === 'react-native-safe-area-context' || request.startsWith('react-native-safe-area-context')) {
    return path.join(__dirname, 'test-mock-safe-area.cjs');
  } else if (request === '@react-native-async-storage/async-storage' || request.startsWith('@react-native-async-storage/async-storage')) {
    return path.join(__dirname, 'test-mock-async-storage.cjs');
  }
  return origResolve.call(this, request, parent, isMain, options);
};

