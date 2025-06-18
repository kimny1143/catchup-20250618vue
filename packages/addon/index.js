const addon = require('./build/Release/slot_analyzer.node');

module.exports = {
  analyzeSlot: addon.analyzeSlot,
  checkConflict: addon.checkConflict,
  calculateOptimalSlot: addon.calculateOptimalSlot
};