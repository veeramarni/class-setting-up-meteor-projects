(function(){/*****************************************************************************/
/* Todos Security */
/*****************************************************************************/
Todos.allow({
  insert: function () { return true; },
  update: function () { return true; },
  remove: function () { return true; },
});

Todos.deny({
});

/*****************************************************************************/
/* Todos Publish Function */
/*****************************************************************************/
Meteor.publish('todos-all', function () {
  return Todos.findAll();
});

Meteor.publish('todos-recent', function () {
  return Todos.findRecent();
});

})();
