(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var Blaze = Package.blaze.Blaze;
var _ = Package.underscore._;
var UI = Package.ui.UI;
var Handlebars = Package.ui.Handlebars;
var Deps = Package.deps.Deps;
var Iron = Package['iron:core'].Iron;
var HTML = Package.htmljs.HTML;

/* Package-scope variables */
var debug, camelCase, typeOf, DynamicTemplate;

(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/iron:dynamic-template/version_conflict_error.js                                                       //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
if (Package['cmather:iron-dynamic-template']) {                                                                   // 1
  throw new Error("\n\n\
    Sorry! The cmather:iron-{x} packages were migrated to the new package system with the wrong name, and you have duplicate copies.\n\
    You can see which cmather:iron-{x} packages have been installed by using this command:\n\n\
    > meteor list\n\n\
    Can you remove any installed cmather:iron-{x} packages like this:\
    \n\n\
    > meteor remove cmather:iron-core\n\
    > meteor remove cmather:iron-router\n\
    > meteor remove cmather:iron-dynamic-template\n\
    > meteor remove cmather:iron-dynamic-layout\n\
    \n\
    The new packages are named iron:{x}. For example:\n\n\
    > meteor add iron:router\n\n\
    Sorry for the hassle, but thank you!\
    \n\n\
  ");                                                                                                             // 17
                                                                                                                  // 18
}                                                                                                                 // 19
                                                                                                                  // 20
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/iron:dynamic-template/dynamic_template.js                                                             //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
/*****************************************************************************/                                   // 1
/* Imports */                                                                                                     // 2
/*****************************************************************************/                                   // 3
debug = Iron.utils.debug('iron:dynamic-template');                                                                // 4
camelCase = Iron.utils.camelCase;                                                                                 // 5
                                                                                                                  // 6
/*****************************************************************************/                                   // 7
/* Helpers */                                                                                                     // 8
/*****************************************************************************/                                   // 9
typeOf = function (value) {                                                                                       // 10
  return Object.prototype.toString.call(value);                                                                   // 11
};                                                                                                                // 12
                                                                                                                  // 13
/*****************************************************************************/                                   // 14
/* DynamicTemplate */                                                                                             // 15
/*****************************************************************************/                                   // 16
                                                                                                                  // 17
/**                                                                                                               // 18
 * Render a component to the page whose template and data context can change                                      // 19
 * dynamically, either from code or from helpers.                                                                 // 20
 *                                                                                                                // 21
 */                                                                                                               // 22
DynamicTemplate = function (options) {                                                                            // 23
  this.options = options = options || {};                                                                         // 24
  this._template = options.template;                                                                              // 25
  this._defaultTemplate = options.defaultTemplate;                                                                // 26
  this._content = options.content;                                                                                // 27
  this._data = options.data;                                                                                      // 28
  this._templateDep = new Deps.Dependency;                                                                        // 29
  this._dataDep = new Deps.Dependency;                                                                            // 30
  this._hasControllerDep = new Deps.Dependency;                                                                   // 31
  this._hooks = {};                                                                                               // 32
  this._controller = new Blaze.ReactiveVar;                                                                       // 33
  this.kind = options.kind || 'DynamicTemplate';                                                                  // 34
                                                                                                                  // 35
  // has the Blaze.View been created?                                                                             // 36
  this.isCreated = false;                                                                                         // 37
                                                                                                                  // 38
  // has the Blaze.View been destroyed and not created again?                                                     // 39
  this.isDestroyed = false;                                                                                       // 40
};                                                                                                                // 41
                                                                                                                  // 42
/**                                                                                                               // 43
 * Get or set the template.                                                                                       // 44
 */                                                                                                               // 45
DynamicTemplate.prototype.template = function (value) {                                                           // 46
  if (arguments.length === 1 && value !== this._template) {                                                       // 47
    this._template = value;                                                                                       // 48
    this._templateDep.changed();                                                                                  // 49
    return;                                                                                                       // 50
  }                                                                                                               // 51
                                                                                                                  // 52
  if (arguments.length > 0)                                                                                       // 53
    return;                                                                                                       // 54
                                                                                                                  // 55
  this._templateDep.depend();                                                                                     // 56
                                                                                                                  // 57
  // do we have a template?                                                                                       // 58
  if (this._template)                                                                                             // 59
    return (typeof this._template === 'function') ? this._template() : this._template;                            // 60
                                                                                                                  // 61
  // no template? ok let's see if we have a default one set                                                       // 62
  if (this._defaultTemplate)                                                                                      // 63
    return (typeof this._defaultTemplate === 'function') ? this._defaultTemplate() : this._defaultTemplate;       // 64
};                                                                                                                // 65
                                                                                                                  // 66
/**                                                                                                               // 67
 * Get or set the default template.                                                                               // 68
 *                                                                                                                // 69
 * This function does not change any dependencies.                                                                // 70
 */                                                                                                               // 71
DynamicTemplate.prototype.defaultTemplate = function (value) {                                                    // 72
  if (arguments.length === 1)                                                                                     // 73
    this._defaultTemplate = value;                                                                                // 74
  else                                                                                                            // 75
    return this._defaultTemplate;                                                                                 // 76
};                                                                                                                // 77
                                                                                                                  // 78
                                                                                                                  // 79
/**                                                                                                               // 80
 * Clear the template and data contexts.                                                                          // 81
 */                                                                                                               // 82
DynamicTemplate.prototype.clear = function () {                                                                   // 83
  //XXX do we need to clear dependencies here too?                                                                // 84
  this._template = undefined;                                                                                     // 85
  this._data = undefined;                                                                                         // 86
  this._templateDep.changed();                                                                                    // 87
};                                                                                                                // 88
                                                                                                                  // 89
                                                                                                                  // 90
/**                                                                                                               // 91
 * Get or set the data context.                                                                                   // 92
 */                                                                                                               // 93
DynamicTemplate.prototype.data = function (value) {                                                               // 94
  if (arguments.length === 1 && value !== this._data) {                                                           // 95
    this._data = value;                                                                                           // 96
    this._dataDep.changed();                                                                                      // 97
    return;                                                                                                       // 98
  }                                                                                                               // 99
                                                                                                                  // 100
  this._dataDep.depend();                                                                                         // 101
  return typeof this._data === 'function' ? this._data() : this._data;                                            // 102
};                                                                                                                // 103
                                                                                                                  // 104
/**                                                                                                               // 105
 * Create the view if it hasn't been created yet.                                                                 // 106
 */                                                                                                               // 107
DynamicTemplate.prototype.create = function (options) {                                                           // 108
  var self = this;                                                                                                // 109
                                                                                                                  // 110
  if (this.isCreated) {                                                                                           // 111
    throw new Error("DynamicTemplate view is already created");                                                   // 112
  }                                                                                                               // 113
                                                                                                                  // 114
  this.isCreated = true;                                                                                          // 115
  this.isDestroyed = false;                                                                                       // 116
                                                                                                                  // 117
  var templateVar = Blaze.ReactiveVar(null);                                                                      // 118
                                                                                                                  // 119
  var view = Blaze.View('DynamicTemplate', function () {                                                          // 120
    var thisView = this;                                                                                          // 121
                                                                                                                  // 122
    // create the template dependency here because we need the entire                                             // 123
    // dynamic template to re-render if the template changes, including                                           // 124
    // the Blaze.With view.                                                                                       // 125
    var template = templateVar.get();                                                                             // 126
                                                                                                                  // 127
    return Blaze.With(function () {                                                                               // 128
      // NOTE: This will rerun anytime the data function invalidates this                                         // 129
      // computation OR if created from an inclusion helper (see note below) any                                  // 130
      // time any of the argument functions invlidate the computation. For                                        // 131
      // example, when the template changes this function will rerun also. But                                    // 132
      // it's probably generally ok. The more serious use case is to not                                          // 133
      // re-render the entire template every time the data context changes.                                       // 134
      var result = self.data();                                                                                   // 135
                                                                                                                  // 136
      if (typeof result !== 'undefined')                                                                          // 137
        // looks like data was set directly on this dynamic template                                              // 138
        return result;                                                                                            // 139
      else                                                                                                        // 140
        // return the first parent data context that is not inclusion arguments                                   // 141
        return DynamicTemplate.getParentDataContext(thisView);                                                    // 142
    }, function () {                                                                                              // 143
      // NOTE: When DynamicTemplate is used from a template inclusion helper                                      // 144
      // like this {{> DynamicTemplate template=getTemplate data=getData}} the                                    // 145
      // function below will rerun any time the getData function invalidates the                                  // 146
      // argument data computation.                                                                               // 147
      var tmpl = null;                                                                                            // 148
                                                                                                                  // 149
      // is it a template name like "MyTemplate"?                                                                 // 150
      if (typeof template === 'string') {                                                                         // 151
        tmpl = Template[template];                                                                                // 152
                                                                                                                  // 153
        if (!tmpl)                                                                                                // 154
          // as a fallback double check the user didn't actually define                                           // 155
          // a camelCase version of the template.                                                                 // 156
          tmpl = Template[camelCase(template)];                                                                   // 157
                                                                                                                  // 158
        if (!tmpl)                                                                                                // 159
          throw new Error("Couldn't find a template named " + JSON.stringify(template) + " or " + JSON.stringify(camelCase(template))+ ". Are you sure you defined it?");
      } else if (typeOf(template) === '[object Object]') {                                                        // 161
        // or maybe a view already?                                                                               // 162
        tmpl = template;                                                                                          // 163
      } else if (typeof self._content !== 'undefined') {                                                          // 164
        // or maybe its block content like                                                                        // 165
        // {{#DynamicTemplate}}                                                                                   // 166
        //  Some block                                                                                            // 167
        // {{/DynamicTemplate}}                                                                                   // 168
        tmpl = self._content;                                                                                     // 169
      }                                                                                                           // 170
                                                                                                                  // 171
      return tmpl;                                                                                                // 172
    });                                                                                                           // 173
  });                                                                                                             // 174
                                                                                                                  // 175
  view.onCreated(function () {                                                                                    // 176
    this.autorun(function () {                                                                                    // 177
      templateVar.set(self.template());                                                                           // 178
    });                                                                                                           // 179
  });                                                                                                             // 180
                                                                                                                  // 181
  // wire up the view lifecycle callbacks                                                                         // 182
  _.each(['onCreated', 'onMaterialized', 'onRendered', 'onDestroyed'], function (hook) {                          // 183
    view[hook](function () {                                                                                      // 184
      // "this" is the view instance                                                                              // 185
      self._runHooks(hook, this);                                                                                 // 186
    });                                                                                                           // 187
  });                                                                                                             // 188
                                                                                                                  // 189
  view.onMaterialized(function () {                                                                               // 190
    // avoid inserting the view twice by accident.                                                                // 191
    self.isInserted = true;                                                                                       // 192
  });                                                                                                             // 193
                                                                                                                  // 194
  this.view = view;                                                                                               // 195
  view.__dynamicTemplate__ = this;                                                                                // 196
  view.kind = this.kind;                                                                                          // 197
  return view;                                                                                                    // 198
};                                                                                                                // 199
                                                                                                                  // 200
/**                                                                                                               // 201
 * Destroy the dynamic template, also destroying the view if it exists.                                           // 202
 */                                                                                                               // 203
DynamicTemplate.prototype.destroy = function () {                                                                 // 204
  if (this.isCreated) {                                                                                           // 205
    Blaze.destroyView(this.view);                                                                                 // 206
    this.view = null;                                                                                             // 207
    this.isDestroyed = true;                                                                                      // 208
    this.isCreated = false;                                                                                       // 209
  }                                                                                                               // 210
};                                                                                                                // 211
                                                                                                                  // 212
/**                                                                                                               // 213
 * View lifecycle hooks.                                                                                          // 214
 */                                                                                                               // 215
_.each(['onCreated', 'onMaterialized', 'onRendered', 'onDestroyed'], function (hook) {                            // 216
  DynamicTemplate.prototype[hook] = function (cb) {                                                               // 217
    var hooks = this._hooks[hook] = this._hooks[hook] || [];                                                      // 218
    hooks.push(cb);                                                                                               // 219
    return this;                                                                                                  // 220
  };                                                                                                              // 221
});                                                                                                               // 222
                                                                                                                  // 223
DynamicTemplate.prototype._runHooks = function (name, view) {                                                     // 224
  var hooks = this._hooks[name] || [];                                                                            // 225
  var hook;                                                                                                       // 226
                                                                                                                  // 227
  for (var i = 0; i < hooks.length; i++) {                                                                        // 228
    hook = hooks[i];                                                                                              // 229
    // keep the "thisArg" pointing to the view, but make the first parameter to                                   // 230
    // the callback teh dynamic template instance.                                                                // 231
    hook.call(view, this);                                                                                        // 232
  }                                                                                                               // 233
};                                                                                                                // 234
                                                                                                                  // 235
/**                                                                                                               // 236
 * Insert the Layout view into the dom.                                                                           // 237
 */                                                                                                               // 238
DynamicTemplate.prototype.insert = function (options) {                                                           // 239
  options = options || {};                                                                                        // 240
                                                                                                                  // 241
  if (this.isInserted)                                                                                            // 242
    return;                                                                                                       // 243
  this.isInserted = true;                                                                                         // 244
                                                                                                                  // 245
  var el = options.el || document.body;                                                                           // 246
  var $el = $(el);                                                                                                // 247
                                                                                                                  // 248
  if ($el.length === 0)                                                                                           // 249
    throw new Error("No element to insert layout into. Is your element defined? Try a Meteor.startup callback."); // 250
                                                                                                                  // 251
  if (!this.view)                                                                                                 // 252
    this.create(options);                                                                                         // 253
                                                                                                                  // 254
  if (!this.range)                                                                                                // 255
    this.range = Blaze.render(this.view, options.parentView);                                                     // 256
                                                                                                                  // 257
  this.range.attach($el[0], options.nextNode);                                                                    // 258
  return this;                                                                                                    // 259
};                                                                                                                // 260
                                                                                                                  // 261
/**                                                                                                               // 262
 * Reactively return the value of the current controller.                                                         // 263
 */                                                                                                               // 264
DynamicTemplate.prototype.getController = function () {                                                           // 265
  return this._controller.get();                                                                                  // 266
};                                                                                                                // 267
                                                                                                                  // 268
/**                                                                                                               // 269
 * Set the reactive value of the controller.                                                                      // 270
 */                                                                                                               // 271
DynamicTemplate.prototype.setController = function (controller) {                                                 // 272
  var didHaveController = !!this._hasController;                                                                  // 273
  this._hasController = (typeof controller !== 'undefined');                                                      // 274
                                                                                                                  // 275
  if (didHaveController !== this._hasController)                                                                  // 276
    this._hasControllerDep.changed();                                                                             // 277
                                                                                                                  // 278
  return this._controller.set(controller);                                                                        // 279
};                                                                                                                // 280
                                                                                                                  // 281
/**                                                                                                               // 282
 * Reactively returns true if the template has a controller and false otherwise.                                  // 283
 */                                                                                                               // 284
DynamicTemplate.prototype.hasController = function () {                                                           // 285
  this._hasControllerDep.depend();                                                                                // 286
  return this._hasController;                                                                                     // 287
};                                                                                                                // 288
                                                                                                                  // 289
/*****************************************************************************/                                   // 290
/* DynamicTemplate Static Methods */                                                                              // 291
/*****************************************************************************/                                   // 292
                                                                                                                  // 293
/**                                                                                                               // 294
 * Get the first parent data context that are not inclusion arguments                                             // 295
 * (see above function). Note: This function can create reactive dependencies.                                    // 296
 */                                                                                                               // 297
DynamicTemplate.getParentDataContext = function (view) {                                                          // 298
  // start off with the parent.                                                                                   // 299
  view = view.parentView;                                                                                         // 300
                                                                                                                  // 301
  while (view) {                                                                                                  // 302
    if (view.kind === 'with' && !view.__isTemplateWith)                                                           // 303
      return view.dataVar.get();                                                                                  // 304
    else                                                                                                          // 305
      view = view.parentView;                                                                                     // 306
  }                                                                                                               // 307
                                                                                                                  // 308
  return null;                                                                                                    // 309
};                                                                                                                // 310
                                                                                                                  // 311
                                                                                                                  // 312
/**                                                                                                               // 313
 * Get inclusion arguments, if any, from a view.                                                                  // 314
 *                                                                                                                // 315
 * Uses the __isTemplateWith property set when a parent view is used                                              // 316
 * specificially for a data context with inclusion args.                                                          // 317
 *                                                                                                                // 318
 * Inclusion arguments are arguments provided in a template like this:                                            // 319
 * {{> yield "inclusionArg"}}                                                                                     // 320
 * or                                                                                                             // 321
 * {{> yield region="inclusionArgValue"}}                                                                         // 322
 */                                                                                                               // 323
DynamicTemplate.getInclusionArguments = function (view) {                                                         // 324
  var parent = view && view.parentView;                                                                           // 325
                                                                                                                  // 326
  if (!parent)                                                                                                    // 327
    return null;                                                                                                  // 328
                                                                                                                  // 329
  if (parent.__isTemplateWith && parent.kind === 'with')                                                          // 330
    return parent.dataVar.get();                                                                                  // 331
                                                                                                                  // 332
  return null;                                                                                                    // 333
};                                                                                                                // 334
                                                                                                                  // 335
/**                                                                                                               // 336
 * Given a view, return a function that can be used to access argument values at                                  // 337
 * the time the view was rendered. There are two key benefits:                                                    // 338
 *                                                                                                                // 339
 * 1. Save the argument data at the time of rendering. When you use lookup(...)                                   // 340
 *    it starts from the current data context which can change.                                                   // 341
 * 2. Defer creating a dependency on inclusion arguments until later.                                             // 342
 *                                                                                                                // 343
 * Example:                                                                                                       // 344
 *                                                                                                                // 345
 *   {{> MyTemplate template="MyTemplate"                                                                         // 346
 *   var args = DynamicTemplate.args(view);                                                                       // 347
 *   var tmplValue = args('template');                                                                            // 348
 *     => "MyTemplate"                                                                                            // 349
 */                                                                                                               // 350
DynamicTemplate.args = function (view) {                                                                          // 351
  return function (key) {                                                                                         // 352
    var data = DynamicTemplate.getInclusionArguments(view);                                                       // 353
                                                                                                                  // 354
    if (data) {                                                                                                   // 355
      if (key)                                                                                                    // 356
        return data[key];                                                                                         // 357
      else                                                                                                        // 358
        return data;                                                                                              // 359
    }                                                                                                             // 360
                                                                                                                  // 361
    return null;                                                                                                  // 362
  };                                                                                                              // 363
};                                                                                                                // 364
                                                                                                                  // 365
/**                                                                                                               // 366
 * Inherit from DynamicTemplate.                                                                                  // 367
 */                                                                                                               // 368
DynamicTemplate.extend = function (props) {                                                                       // 369
  return Iron.utils.extend(this, props);                                                                          // 370
};                                                                                                                // 371
                                                                                                                  // 372
/*****************************************************************************/                                   // 373
/* UI Helpers */                                                                                                  // 374
/*****************************************************************************/                                   // 375
                                                                                                                  // 376
if (typeof Template !== 'undefined') {                                                                            // 377
  UI.registerHelper('DynamicTemplate', Template.__create__('DynamicTemplateHelper', function () {                 // 378
    var args = DynamicTemplate.args(this);                                                                        // 379
                                                                                                                  // 380
    return new DynamicTemplate({                                                                                  // 381
      data: function () { return args('data'); },                                                                 // 382
      template: function () { return args('template'); },                                                         // 383
      content: this.templateContentBlock                                                                          // 384
    }).create();                                                                                                  // 385
  }));                                                                                                            // 386
}                                                                                                                 // 387
                                                                                                                  // 388
/*****************************************************************************/                                   // 389
/* Namespacing */                                                                                                 // 390
/*****************************************************************************/                                   // 391
Iron.DynamicTemplate = DynamicTemplate;                                                                           // 392
                                                                                                                  // 393
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['iron:dynamic-template'] = {};

})();

//# sourceMappingURL=iron:dynamic-template.js.map
