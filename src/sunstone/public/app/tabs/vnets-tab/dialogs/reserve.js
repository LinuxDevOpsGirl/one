define(function(require) {
  /*
    DEPENDENCIES
   */

  var BaseDialog = require('utils/dialogs/dialog');
  var TemplateHTML = require('hbs!./reserve/html');
  var Sunstone = require('sunstone');
  var Locale = require('utils/locale');
  var Tips = require('utils/tips');
  var WizardFields = require('utils/wizard-fields');
  var VNetsTable = require('tabs/vnets-tab/datatable');
  var ARsTable = require('./reserve/ar-datatable');

  /*
    CONSTANTS
   */

  var DIALOG_ID = require('./reserve/dialogId');

  /*
    CONSTRUCTOR
   */

  function Dialog() {
    var that = this;

    this.dialogId = DIALOG_ID;

    BaseDialog.call(this);
  }

  Dialog.DIALOG_ID = DIALOG_ID;
  Dialog.prototype = Object.create(BaseDialog.prototype);
  Dialog.prototype.constructor = Dialog;
  Dialog.prototype.html = _html;
  Dialog.prototype.onShow = _onShow;
  Dialog.prototype.setup = _setup;
  Dialog.prototype.setParams = _setParams;

  return Dialog;
  
  /*
    FUNCTION DEFINITIONS
   */

  function _html() {
    var that = this;

    var opts = {
      info: false,
      select: true,
      selectOptions: {
        filter_fn: function(vnet){
          return (vnet['PARENT_NETWORK_ID'] == that.vnetId);
        }
      }
    };

    this.vnetsTable = new VNetsTable("reserve", opts);

    var arOpts = {
      info: false,
      select: true,
      vnetId: this.vnetId
    };

    this.arsTable = new ARsTable("ar_reserve", arOpts);

    return TemplateHTML({
      'vnetsTableHTML': this.vnetsTable.dataTableHTML,
      'arsTableHTML': this.arsTable.dataTableHTML
    });
  }

  function _setup(context) {
    var that = this;

    $('input[name="reserve_target"]',context).change(function(){
      $('div#reserve_new_body', context).hide();
      $('div#reserve_add_body', context).hide();

      $('input', $('div#reserve_new_body', context)).prop('wizard_field_disabled', true);
      $('input', $('div#reserve_add_body', context)).prop('wizard_field_disabled', true);

      switch($(this).val()){
        case "NEW":
          $('div#reserve_new_body', context).show();
          $('input', $('div#reserve_new_body', context)).prop('wizard_field_disabled', false);
          break;
        case "ADD":
          $('div#reserve_add_body', context).show();
          $('input', $('div#reserve_add_body', context)).prop('wizard_field_disabled', false);
          break;
      }
    });

    $('input#reserve_new', context).prop('checked', true);
    $('input#reserve_new', context).change();

    that.vnetsTable.idInput().attr("wizard_field", "vnet");
    that.arsTable.idInput().attr("wizard_field", "ar_id");

    this.vnetsTable.initialize();
    this.arsTable.initialize();

    Tips.setup(context);

    $('#reserve_form',context).submit(function(){
      var data = WizardFields.retrieve(context);

      Sunstone.runAction('Network.reserve', that.vnetId, data);

      return false;
    });
  }

  function _onShow(context) {
    this.vnetsTable.refreshResourceTableSelect();
    this.arsTable.refreshResourceTableSelect();
  }

  /**
   * [_setParams description]
   * @param {object} params
   *        - params.vnetId : Virtual Network id
   */
  function _setParams(params) {
    this.vnetId = params.vnetId;

    $('#vnet_id', this.dialogElement).text(params.vnetId);
  }
});