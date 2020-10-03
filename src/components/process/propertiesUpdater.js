/**
 * Copied from bpmn-js-properties-panel/lib/cmd/index.js
 */

const BusinessObjectUpdateHandler = require('./BusinessObjectUpdateHandler')

function CommandInitializer (eventBus, commandStack) {
  eventBus.on('diagram.init', function () {
    commandStack.registerHandler('properties-panel.update-businessobject', BusinessObjectUpdateHandler)
  })
}
CommandInitializer.$inject = ['eventBus', 'commandStack']

module.exports = {
  propertiesUpdater: {
    __init__: [CommandInitializer]
  }
}
