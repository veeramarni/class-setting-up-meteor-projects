Todos = new Meteor.Collection('todos');

/*****************************************************************************/
/* Queries */
/*****************************************************************************/
Todos.findAll = function () {
  return Todos.find();
};

Todos.findRecent = function () {
  return Todos.find({});
};

/*****************************************************************************/
/* Methods */
/*****************************************************************************/
Meteor.methods({
  'todos/custom': function () {
    if (this.isSimulation) {
      // on client
    } else {
      // on the server
    }
  },

  'todos/customTwo': function () {
  }
});
