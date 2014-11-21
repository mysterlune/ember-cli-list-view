var path = require('path');

module.exports = {
  name: 'Ember CLI ListView',

  included: function(app) {
    this._super.included(app);

    this.app.import(app.bowerDirectory + '/list-view/dist/list-view.js', {
      exports: {
        'list-view/main':                 ['default'],
        'list-view/helper':               ['default'],
        'list-view/list_item_view':       ['default'],
        'list-view/list_item_view_mixin': ['default'],
        'list-view/list_view':            ['default'],
        'list-view/list_view_helper':     ['default'],
        'list-view/list_view_mixin':      ['default']
      }
    });
  }
}
