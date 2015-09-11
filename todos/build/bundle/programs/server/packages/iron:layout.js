(function () {

/* Imports */
var UI = Package.ui.UI;
var Handlebars = Package.ui.Handlebars;
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;
var Iron = Package['iron:core'].Iron;
var HTML = Package.htmljs.HTML;
var Blaze = Package.blaze.Blaze;

/* Package-scope variables */
var findFirstLayout, Layout, DEFAULT_REGION;

(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// packages/iron:layout/version_conflict_errors.js                                                            //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
var errors = [];                                                                                              // 1
                                                                                                              // 2
if (Package['cmather:iron-layout']) {                                                                         // 3
  errors.push("\n\n\
    The cmather:iron-{x} packages were migrated to the new package system with the wrong name, and you have duplicate copies.\n\
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
  ");                                                                                                         // 19
}                                                                                                             // 20
                                                                                                              // 21
// If the user still has blaze-layout throw  an error. Let's get rid of that                                  // 22
// package so it's not lingering around with all its nastiness.                                               // 23
if (Package['cmather:blaze-layout']) {                                                                        // 24
  errors.push(                                                                                                // 25
    "The blaze-layout package has been replaced by iron-layout. Please remove the package like this:\n> meteor remove cmather:blaze-layout\n"
  );                                                                                                          // 27
}                                                                                                             // 28
                                                                                                              // 29
if (errors.length > 0) {                                                                                      // 30
  throw new Error("Sorry! Looks like there's a few errors related to iron:layout\n\n" + errors.join("\n\n")); // 31
}                                                                                                             // 32
                                                                                                              // 33
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                            //
// packages/iron:layout/layout.js                                                                             //
//                                                                                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                              //
/*****************************************************************************/                               // 1
/* Imports */                                                                                                 // 2
/*****************************************************************************/                               // 3
var DynamicTemplate = Iron.DynamicTemplate;                                                                   // 4
var inherits = Iron.utils.inherits;                                                                           // 5
                                                                                                              // 6
/*****************************************************************************/                               // 7
/* Helpers */                                                                                                 // 8
/*****************************************************************************/                               // 9
/**                                                                                                           // 10
 * Find the first Layout in the rendered parent hierarchy.                                                    // 11
 */                                                                                                           // 12
findFirstLayout = function (view) {                                                                           // 13
  while (view) {                                                                                              // 14
    if (view.kind === 'Iron.Layout')                                                                          // 15
      return view.__dynamicTemplate__;                                                                        // 16
    else                                                                                                      // 17
      view = view.parentView;                                                                                 // 18
  }                                                                                                           // 19
                                                                                                              // 20
  return null;                                                                                                // 21
};                                                                                                            // 22
                                                                                                              // 23
/*****************************************************************************/                               // 24
/* Layout */                                                                                                  // 25
/*****************************************************************************/                               // 26
                                                                                                              // 27
/**                                                                                                           // 28
 * Dynamically render templates into regions.                                                                 // 29
 *                                                                                                            // 30
 * Layout inherits from Iron.DynamicTemplate and provides the ability to create                               // 31
 * regions that a user can render templates or content blocks into. The layout                                // 32
 * and each region is an instance of DynamicTemplate so the template and data                                 // 33
 * contexts are completely dynamic and programmable in javascript.                                            // 34
 */                                                                                                           // 35
Layout = function (options) {                                                                                 // 36
  var self = this;                                                                                            // 37
                                                                                                              // 38
  Layout.__super__.constructor.apply(this, arguments);                                                        // 39
                                                                                                              // 40
  options = options || {};                                                                                    // 41
  this.kind = 'Iron.Layout';                                                                                  // 42
  this._regions = {};                                                                                         // 43
  this._regionHooks = {};                                                                                     // 44
  this.defaultTemplate('__IronDefaultLayout__');                                                              // 45
                                                                                                              // 46
  // if there's block content then render that                                                                // 47
  // to the main region                                                                                       // 48
  if (options.content)                                                                                        // 49
    this.render(options.content);                                                                             // 50
};                                                                                                            // 51
                                                                                                              // 52
/**                                                                                                           // 53
 * The default region for a layout where the main content will go.                                            // 54
 */                                                                                                           // 55
DEFAULT_REGION = Layout.DEFAULT_REGION = 'main';                                                              // 56
                                                                                                              // 57
/**                                                                                                           // 58
 * Inherits from Iron.DynamicTemplate which gives us the ability to set the                                   // 59
 * template and data context dynamically.                                                                     // 60
 */                                                                                                           // 61
inherits(Layout, Iron.DynamicTemplate);                                                                       // 62
                                                                                                              // 63
/**                                                                                                           // 64
 * Return the DynamicTemplate instance for a given region. If the region doesn't                              // 65
 * exist it is created.                                                                                       // 66
 *                                                                                                            // 67
 * The regions object looks like this:                                                                        // 68
 *                                                                                                            // 69
 *  {                                                                                                         // 70
 *    "main": DynamicTemplate,                                                                                // 71
 *    "footer": DynamicTemplate,                                                                              // 72
 *    .                                                                                                       // 73
 *    .                                                                                                       // 74
 *    .                                                                                                       // 75
 *  }                                                                                                         // 76
 */                                                                                                           // 77
Layout.prototype.region = function (name, options) {                                                          // 78
  return this._ensureRegion(name, options);                                                                   // 79
};                                                                                                            // 80
                                                                                                              // 81
/**                                                                                                           // 82
 * Destroy all child regions and reset the regions map.                                                       // 83
 */                                                                                                           // 84
Layout.prototype.destroyRegions = function () {                                                               // 85
  _.each(this._regions, function (dynamicTemplate) {                                                          // 86
    dynamicTemplate.destroy();                                                                                // 87
  });                                                                                                         // 88
                                                                                                              // 89
  this._regions = {};                                                                                         // 90
};                                                                                                            // 91
                                                                                                              // 92
/**                                                                                                           // 93
 * Set the template for a region.                                                                             // 94
 */                                                                                                           // 95
Layout.prototype.render = function (template, options) {                                                      // 96
  // having options is usually good                                                                           // 97
  options = options || {};                                                                                    // 98
                                                                                                              // 99
  // let the user specify the region to render the template into                                              // 100
  var region = options.to || options.region || DEFAULT_REGION;                                                // 101
                                                                                                              // 102
  // get the DynamicTemplate for this region                                                                  // 103
  var dynamicTemplate = this.region(region);                                                                  // 104
                                                                                                              // 105
  // if we're in a rendering transaction, track that we've rendered this                                      // 106
  // particular region                                                                                        // 107
  this._trackRenderedRegion(region);                                                                          // 108
                                                                                                              // 109
  // set the template value for the dynamic template                                                          // 110
  dynamicTemplate.template(template);                                                                         // 111
                                                                                                              // 112
  // set the data for the region. If options.data is not defined, this will                                   // 113
  // clear the data, which is what we want                                                                    // 114
  dynamicTemplate.data(options.data);                                                                         // 115
};                                                                                                            // 116
                                                                                                              // 117
/**                                                                                                           // 118
 * Returns true if the given region is defined and false otherwise.                                           // 119
 */                                                                                                           // 120
Layout.prototype.has = function (region) {                                                                    // 121
  region = region || Layout.DEFAULT_REGION;                                                                   // 122
  return !!this._regions[region];                                                                             // 123
};                                                                                                            // 124
                                                                                                              // 125
/**                                                                                                           // 126
 * Returns an array of region keys.                                                                           // 127
 */                                                                                                           // 128
Layout.prototype.regionKeys = function () {                                                                   // 129
  return _.keys(this._regions);                                                                               // 130
};                                                                                                            // 131
                                                                                                              // 132
/**                                                                                                           // 133
 * Clear a given region or the "main" region by default.                                                      // 134
 */                                                                                                           // 135
Layout.prototype.clear = function (region) {                                                                  // 136
  region = region || Layout.DEFAULT_REGION;                                                                   // 137
                                                                                                              // 138
  // we don't want to create a region if it didn't exist before                                               // 139
  if (this.has(region))                                                                                       // 140
    this.region(region).template(null);                                                                       // 141
                                                                                                              // 142
  // chain it up                                                                                              // 143
  return this;                                                                                                // 144
};                                                                                                            // 145
                                                                                                              // 146
/**                                                                                                           // 147
 * Clear all regions.                                                                                         // 148
 */                                                                                                           // 149
Layout.prototype.clearAll = function () {                                                                     // 150
  _.each(this._regions, function (dynamicTemplate) {                                                          // 151
    dynamicTemplate.template(null);                                                                           // 152
  });                                                                                                         // 153
                                                                                                              // 154
  // chain it up                                                                                              // 155
  return this;                                                                                                // 156
};                                                                                                            // 157
                                                                                                              // 158
/**                                                                                                           // 159
 * Start tracking rendered regions.                                                                           // 160
 */                                                                                                           // 161
Layout.prototype.beginRendering = function (onComplete) {                                                     // 162
  var self = this;                                                                                            // 163
  if (this._finishRenderingTransaction)                                                                       // 164
    this._finishRenderingTransaction();                                                                       // 165
                                                                                                              // 166
  this._finishRenderingTransaction = _.once(function () {                                                     // 167
    var regions = self._endRendering({flush: false});                                                         // 168
    onComplete && onComplete(regions);                                                                        // 169
  });                                                                                                         // 170
                                                                                                              // 171
  Deps.afterFlush(this._finishRenderingTransaction);                                                          // 172
                                                                                                              // 173
  if (this._renderedRegions)                                                                                  // 174
    throw new Error("You called beginRendering again before calling endRendering");                           // 175
  this._renderedRegions = {};                                                                                 // 176
};                                                                                                            // 177
                                                                                                              // 178
/**                                                                                                           // 179
 * Track a rendered region if we're in a transaction.                                                         // 180
 */                                                                                                           // 181
Layout.prototype._trackRenderedRegion = function (region) {                                                   // 182
  if (!this._renderedRegions)                                                                                 // 183
    return;                                                                                                   // 184
  this._renderedRegions[region] = true;                                                                       // 185
};                                                                                                            // 186
                                                                                                              // 187
/**                                                                                                           // 188
 * Stop a rendering transaction and retrieve the rendered regions. This                                       // 189
 * shouldn't be called directly. Instead, pass an onComplete callback to the                                  // 190
 * beginRendering method.                                                                                     // 191
 */                                                                                                           // 192
Layout.prototype._endRendering = function (opts) {                                                            // 193
  // we flush here to ensure all of the {{#contentFor}} inclusions have had a                                 // 194
  // chance to render from our templates, otherwise we'll never know about                                    // 195
  // them.                                                                                                    // 196
  opts = opts || {};                                                                                          // 197
  if (opts.flush !== false)                                                                                   // 198
    Deps.flush();                                                                                             // 199
  var renderedRegions = this._renderedRegions || {};                                                          // 200
  this._renderedRegions = null;                                                                               // 201
  return _.keys(renderedRegions);                                                                             // 202
};                                                                                                            // 203
                                                                                                              // 204
/**                                                                                                           // 205
 * View lifecycle hooks for regions.                                                                          // 206
 */                                                                                                           // 207
_.each(                                                                                                       // 208
  [                                                                                                           // 209
    'onRegionCreated',                                                                                        // 210
    'onRegionMaterialized',                                                                                   // 211
    'onRegionRendered',                                                                                       // 212
    'onRegionDestroyed'                                                                                       // 213
  ],                                                                                                          // 214
  function (hook) {                                                                                           // 215
    Layout.prototype[hook] = function (cb) {                                                                  // 216
      var hooks = this._regionHooks[hook] = this._regionHooks[hook] || [];                                    // 217
      hooks.push(cb);                                                                                         // 218
      return this;                                                                                            // 219
    }                                                                                                         // 220
  }                                                                                                           // 221
);                                                                                                            // 222
                                                                                                              // 223
/**                                                                                                           // 224
 * Returns the DynamicTemplate for a given region or creates it if it doesn't                                 // 225
 * exists yet.                                                                                                // 226
 */                                                                                                           // 227
Layout.prototype._ensureRegion = function (name, options) {                                                   // 228
 return this._regions[name] = this._regions[name] || this._createDynamicTemplate(name, options);              // 229
};                                                                                                            // 230
                                                                                                              // 231
/**                                                                                                           // 232
 * Create a new DynamicTemplate instance.                                                                     // 233
 */                                                                                                           // 234
Layout.prototype._createDynamicTemplate = function (name, options) {                                          // 235
  var self = this;                                                                                            // 236
  var tmpl = new Iron.DynamicTemplate(options);                                                               // 237
  var capitalize = Iron.utils.capitalize;                                                                     // 238
  tmpl._region = name;                                                                                        // 239
                                                                                                              // 240
  _.each(['created', 'materialized', 'rendered', 'destroyed'], function (hook) {                              // 241
    hook = capitalize(hook);                                                                                  // 242
    tmpl['on' + hook](function (dynamicTemplate) {                                                            // 243
      // "this" is the view instance                                                                          // 244
      var view = this;                                                                                        // 245
      self._runRegionHooks('on' + 'Region' + hook, view, dynamicTemplate);                                    // 246
    });                                                                                                       // 247
  });                                                                                                         // 248
                                                                                                              // 249
  return tmpl;                                                                                                // 250
};                                                                                                            // 251
                                                                                                              // 252
Layout.prototype._runRegionHooks = function (name, regionView, regionDynamicTemplate) {                       // 253
  var layout = this;                                                                                          // 254
  var hooks = this._regionHooks[name] || [];                                                                  // 255
  var hook;                                                                                                   // 256
                                                                                                              // 257
  for (var i = 0; i < hooks.length; i++) {                                                                    // 258
    hook = hooks[i];                                                                                          // 259
    // keep the "thisArg" pointing to the view, but make the first parameter to                               // 260
    // the callback teh dynamic template instance.                                                            // 261
    hook.call(regionView, regionDynamicTemplate.region, regionDynamicTemplate, this);                         // 262
  }                                                                                                           // 263
};                                                                                                            // 264
                                                                                                              // 265
/*****************************************************************************/                               // 266
/* UI Helpers */                                                                                              // 267
/*****************************************************************************/                               // 268
if (typeof Template !== 'undefined') {                                                                        // 269
  /**                                                                                                         // 270
   * Create a region in the closest layout ancestor.                                                          // 271
   *                                                                                                          // 272
   * Examples:                                                                                                // 273
   *    <aside>                                                                                               // 274
   *      {{> yield "aside"}}                                                                                 // 275
   *    </aside>                                                                                              // 276
   *                                                                                                          // 277
   *    <article>                                                                                             // 278
   *      {{> yield}}                                                                                         // 279
   *    </article>                                                                                            // 280
   *                                                                                                          // 281
   *    <footer>                                                                                              // 282
   *      {{> yield "footer"}}                                                                                // 283
   *    </footer>                                                                                             // 284
   */                                                                                                         // 285
  UI.registerHelper('yield', Template.__create__('yield', function () {                                       // 286
    var layout = findFirstLayout(this);                                                                       // 287
                                                                                                              // 288
    if (!layout)                                                                                              // 289
      throw new Error("No Iron.Layout found so you can't use yield!");                                        // 290
                                                                                                              // 291
    // Example options: {{> yield region="footer"}} or {{> yield "footer"}}                                   // 292
    var options = DynamicTemplate.getInclusionArguments(this);                                                // 293
    var region;                                                                                               // 294
    var dynamicTemplate;                                                                                      // 295
                                                                                                              // 296
    if (_.isString(options)) {                                                                                // 297
      region = options;                                                                                       // 298
    } else if (_.isObject(options)) {                                                                         // 299
      region = options.region;                                                                                // 300
    }                                                                                                         // 301
                                                                                                              // 302
    // if there's no region specified we'll assume you meant the main region                                  // 303
    region = region || DEFAULT_REGION;                                                                        // 304
                                                                                                              // 305
    // get or create the region                                                                               // 306
    dynamicTemplate = layout.region(region);                                                                  // 307
                                                                                                              // 308
    // if the dynamicTemplate had already been inserted, let's                                                // 309
    // destroy it before creating a new one.                                                                  // 310
    if (dynamicTemplate.isCreated)                                                                            // 311
      dynamicTemplate.destroy();                                                                              // 312
                                                                                                              // 313
    // now return a newly created view                                                                        // 314
    return dynamicTemplate.create();                                                                          // 315
  }));                                                                                                        // 316
                                                                                                              // 317
  /**                                                                                                         // 318
   * Render a template into a region in the closest layout ancestor from within                               // 319
   * your template markup.                                                                                    // 320
   *                                                                                                          // 321
   * Examples:                                                                                                // 322
   *                                                                                                          // 323
   *  {{#contentFor "footer"}}                                                                                // 324
   *    Footer stuff                                                                                          // 325
   *  {{/contentFor}}                                                                                         // 326
   *                                                                                                          // 327
   *  {{> contentFor region="footer" template="SomeTemplate" data=someData}}                                  // 328
   *                                                                                                          // 329
   * Note: The helper is a UI.Component object instead of a function so that                                  // 330
   * Meteor UI does not create a Deps.Dependency.                                                             // 331
   */                                                                                                         // 332
  UI.registerHelper('contentFor', Template.__create__('contentFor', function () {                             // 333
    var layout = findFirstLayout(this);                                                                       // 334
                                                                                                              // 335
    if (!layout)                                                                                              // 336
      throw new Error("No Iron.Layout found so you can't use contentFor!");                                   // 337
                                                                                                              // 338
    var options = DynamicTemplate.getInclusionArguments(this) || {}                                           // 339
    var content = this.templateContentBlock;                                                                  // 340
    var template = options.template;                                                                          // 341
    var data = options.data;                                                                                  // 342
    var region;                                                                                               // 343
                                                                                                              // 344
    if (_.isString(options))                                                                                  // 345
      region = options;                                                                                       // 346
    else if (_.isObject(options))                                                                             // 347
      region = options.region;                                                                                // 348
    else                                                                                                      // 349
      throw new Error("Which region is this contentFor block supposed to be for?");                           // 350
                                                                                                              // 351
    // set the region to a provided template or the content directly.                                         // 352
    layout.region(region).template(template || content);                                                      // 353
                                                                                                              // 354
    // tell the layout to track this as a rendered region if we're in a                                       // 355
    // rendering transaction.                                                                                 // 356
    layout._trackRenderedRegion(region);                                                                      // 357
                                                                                                              // 358
    // if we have some data then set the data context                                                         // 359
    if (data)                                                                                                 // 360
      layout.region(region).data(data);                                                                       // 361
                                                                                                              // 362
    // just render nothing into this area of the page since the dynamic template                              // 363
    // will do the actual rendering into the right region.                                                    // 364
    return null;                                                                                              // 365
  }));                                                                                                        // 366
                                                                                                              // 367
  /**                                                                                                         // 368
   * Check to see if a given region is currently rendered to.                                                 // 369
   *                                                                                                          // 370
   * Example:                                                                                                 // 371
   *    {{#if hasRegion 'aside'}}                                                                             // 372
   *      <aside>                                                                                             // 373
   *        {{> yield "aside"}}                                                                               // 374
   *      </aside>                                                                                            // 375
   *    {{/if}}                                                                                               // 376
   */                                                                                                         // 377
  UI.registerHelper('hasRegion', function (region) {                                                          // 378
    var layout = findFirstLayout(Blaze.getCurrentView());                                                     // 379
                                                                                                              // 380
    if (!layout)                                                                                              // 381
      throw new Error("No Iron.Layout found so you can't use hasRegion!");                                    // 382
                                                                                                              // 383
    if (!_.isString(region))                                                                                  // 384
      throw new Error("You need to provide an region argument to hasRegion");                                 // 385
                                                                                                              // 386
    return !! layout.region(region).template();                                                               // 387
  });                                                                                                         // 388
                                                                                                              // 389
  /**                                                                                                         // 390
   * Let people use Layout directly from their templates!                                                     // 391
   *                                                                                                          // 392
   * Example:                                                                                                 // 393
   *  {{#Layout template="MyTemplate"}}                                                                       // 394
   *    Main content goes here                                                                                // 395
   *                                                                                                          // 396
   *    {{#contentFor "footer"}}                                                                              // 397
   *      footer goes here                                                                                    // 398
   *    {{/contentFor}}                                                                                       // 399
   *  {{/Layout}}                                                                                             // 400
   */                                                                                                         // 401
  UI.registerHelper('Layout', Template.__create__('layout', function () {                                     // 402
    var args = Iron.DynamicTemplate.args(this);                                                               // 403
                                                                                                              // 404
    var layout = new Layout({                                                                                 // 405
      template: function () { return args('template'); },                                                     // 406
      data: function () { return args('data'); },                                                             // 407
      content: this.templateContentBlock                                                                      // 408
    });                                                                                                       // 409
                                                                                                              // 410
    return layout.create();                                                                                   // 411
  }));                                                                                                        // 412
}                                                                                                             // 413
/*****************************************************************************/                               // 414
/* Namespacing */                                                                                             // 415
/*****************************************************************************/                               // 416
Iron.Layout = Layout;                                                                                         // 417
                                                                                                              // 418
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['iron:layout'] = {};

})();

//# sourceMappingURL=iron:layout.js.map
