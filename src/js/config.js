jQuery.noConflict();

(function ($, PLUGIN_ID) {
  'use strict';
  console.log(kintone.plugin.app.getConfig(PLUGIN_ID));
  const config = kintone.plugin.app.getConfig(PLUGIN_ID);
  const appId = kintone.app.getId();
  const lang = config?.language ? config?.language : 'en';
  function initConfigLayout() {
    $(".plugin-text-field").each(function () {
      let text = $(this).text();
      $(this).text(getPluginText(text, lang));
    });
  }
  function getAppData() {
    const body = {
      'app': appId
    }
    kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', body, function (resp) {
      // success
      console.log(config);
      const startDateFieldCode = config?.startDateFieldCode;
      const endDateFieldCode = config?.endDateFieldCode;
      const timesheetFieldCode = config?.timesheetFieldCode;
      if (startDateFieldCode && resp.properties[startDateFieldCode]?.type !== "DATE") {
        $('#error-startDateFieldCode').text(getPluginText('The start date field must have the type DATE', lang));
      }
      if (endDateFieldCode && resp.properties[endDateFieldCode]?.type !== "DATE") {
        $('#error-endDateFieldCode').text(getPluginText('The end date field must have the type DATE', lang));
      }
      if (timesheetFieldCode && resp.properties[timesheetFieldCode]?.type !== "FILE") {
        $('#error-timesheetFieldCode').text(getPluginText('The timesheet data storage file field must have the type FILE', lang));
      }
      console.log(resp);
    }, function (error) {
      // error
      console.error(error);
    });
  }
  initConfigLayout();
  getAppData();
  let $form = $('.js-submit-settings');
  let $cancelButton = $('.js-cancel-button');
  let $token = $('#token');
  let $showToken = $('#showToken');
  if (!($form.length > 0 && $cancelButton.length > 0)) {
    throw new Error('Required elements do not exist.');
  }
  if (config.token) {
    $token.val(config.token);
  }
  if (config.showStartDate === 'true') {
    $('#showStartDate').prop("checked", true)
  }
  if (config.showEndDate === 'true') {
    $('#showEndDate').prop("checked", true)
  }
  if (config.showSubmitButton === 'true') {
    $('#showSubmitButton').prop("checked", true)
  }
  if (config.startDateFieldCode) {
    $('#startDateFieldCode').val(config.startDateFieldCode);
  }
  if (config.endDateFieldCode) {
    $('#endDateFieldCode').val(config.endDateFieldCode);
  }
  if (config.timesheetFieldCode) {
    $('#timesheetFieldCode').val(config.timesheetFieldCode);
  }
  $('#plugin-language').val(config?.language ? config?.language : 'en');

  $('#btnSave').on('click', function (e) {
    e.preventDefault();
    let token = $token.val();
    let showStartDate = $('#showStartDate').prop("checked").toString();
    let showEndDate = $('#showEndDate').prop("checked").toString();
    let showSubmitButton = $('#showSubmitButton').prop("checked").toString();
    let startDateFieldCode = $('#startDateFieldCode').val();
    let endDateFieldCode = $('#endDateFieldCode').val();
    let timesheetFieldCode = $('#timesheetFieldCode').val();
    let language = $('#plugin-language').val();
    let config = {
      token,
      showStartDate,
      showEndDate,
      showSubmitButton,
      startDateFieldCode,
      endDateFieldCode,
      timesheetFieldCode,
      language
    }
    console.log('config', config);
    kintone.plugin.app.setConfig(config, function () {
      alert(getPluginText('The plug-in settings have been saved. Please update the app!', lang));
      window.location.href = '../../flow?app=' + kintone.app.getId();
    });
  });
  $cancelButton.on('click', function () {
    window.location.href = '../../' + kintone.app.getId() + '/plugin/';
  });
  $('#btnCreateStartDate').on('click', function (e) {
    e.preventDefault();
    let displayName = $('#startDateDisplayName').val();
    let fieldCode = $('#startDateFC').val();
    let isValidate = true;
    if (!displayName) {
      isValidate = false;
      $('#error-displayNameStartDate').text(getPluginText('Display name is required', lang));
    }
    if (!fieldCode) {
      isValidate = false;
      $('#error-startDateFC').text(getPluginText('Field code is required', lang));
    }
    if (!isValidate) return;
    let body = {
      'app': appId,
      "properties": {}
    };
    body.properties[fieldCode] = {
      "type": "DATE",
      "label": displayName,
      "code": fieldCode,
      "defaultNowValue": true,
      "required": true
    }
    kintone.api(kintone.api.url('/k/v1/preview/app/form/fields', true), 'POST', body, function (resp) {
      // success
      console.log(resp);
      console.log(resp.revision);
      var body = {
        'apps': [
          {
            'app': appId,
            'revision': resp.revision
          }
        ]
      };
      kintone.api(kintone.api.url('/k/v1/preview/app/deploy', true), 'POST', body, function (resp) {
        // success
        console.log(resp);
        alert(getPluginText('Create success', lang));
        $('#startDateDisplayName').val('');
        $('#startDateFC').val('');
        $('#error-displayNameStartDate').text('');
        $('#error-startDateFC').text('');
        $('#startDateFieldCode').val(fieldCode);
      }, function (error) {
        // error
        alert(getPluginText('Field codes are duplicated.', lang));
        console.log(error);
      });
    }, function (error) {
      // error
      alert(getPluginText('Field codes are duplicated.', lang));
      console.log(error);
    });
  })
  $('#btnCreateEndDate').on('click', function (e) {
    e.preventDefault();
    let displayName = $('#endDateDisplayName').val();
    let fieldCode = $('#endDateFC').val();
    let isValidate = true;
    if (!displayName) {
      isValidate = false;
      $('#error-displayNameEndDate').text(getPluginText('Display name is required', lang));
    }
    if (!fieldCode) {
      isValidate = false;
      $('#error-endDateFC').text(getPluginText('Field code is required', lang));
    }
    if (!isValidate) return;
    let body = {
      'app': appId,
      "properties": {}
    };
    body.properties[fieldCode] = {
      "type": "DATE",
      "label": displayName,
      "code": fieldCode,
      "defaultNowValue": true,
      "required": true
    }
    kintone.api(kintone.api.url('/k/v1/preview/app/form/fields', true), 'POST', body, function (resp) {
      // success
      console.log(resp);
      console.log(resp.revision);
      var body = {
        'apps': [
          {
            'app': appId,
            'revision': resp.revision
          }
        ]
      };
      kintone.api(kintone.api.url('/k/v1/preview/app/deploy', true), 'POST', body, function (resp) {
        // success
        console.log(resp);
        alert(getPluginText('Create success', lang));
        $('#endDateDisplayName').val('');
        $('#endDateFC').val('');
        $('#error-displayNameEndDate').text('');
        $('#error-endDateFC').text('');
        $('#endDateFieldCode').val(fieldCode);
      }, function (error) {
        // error
        alert(getPluginText('Field codes are duplicated.', lang));
        console.log(error);
      });
    }, function (error) {
      // error
      alert(getPluginText('Field codes are duplicated.', lang));
      console.log(error);
    });
  })
  $('#btnCreateTimesheet').on('click', function (e) {
    e.preventDefault();
    let displayName = $('#timesheetDisplayName').val();
    let fieldCode = $('#timesheetFC').val();
    let isValidate = true;
    if (!displayName) {
      isValidate = false;
      $('#error-displayNameTimesheet').text(getPluginText('Display name is required', lang));
    }
    if (!fieldCode) {
      isValidate = false;
      $('#error-timesheetFC').text(getPluginText('Field code is required', lang));
    }
    if (!isValidate) return;
    let body = {
      'app': appId,
      "properties": {}
    };
    body.properties[fieldCode] = {
      "type": "FILE",
      "label": displayName,
      "code": fieldCode
    }
    kintone.api(kintone.api.url('/k/v1/preview/app/form/fields', true), 'POST', body, function (resp) {
      // success
      console.log(resp);
      console.log(resp.revision);
      var body = {
        'apps': [
          {
            'app': appId,
            'revision': resp.revision
          }
        ]
      };
      kintone.api(kintone.api.url('/k/v1/preview/app/deploy', true), 'POST', body, function (resp) {
        // success
        console.log(resp);
        alert(getPluginText('Create success', lang));
        $('#timesheetDisplayName').val('');
        $('#timesheetFC').val('');
        $('#error-displayNameTimesheet').text('');
        $('#error-timesheetFC').text('');
        $('#timesheetFieldCode').val(fieldCode);
      }, function (error) {
        // error
        alert(getPluginText('Field codes are duplicated.', lang));
        console.log(error);
      });
    }, function (error) {
      // error
      alert(getPluginText('Field codes are duplicated.', lang));
      console.log(error);
    });
  })
  $showToken.change(function (e) {
    console.log(e.target.checked);
    if (e.target.checked) {
      $token.prop("type", "text");
    }
    else {
      $token.prop("type", "password");
    }
  });
})(jQuery, kintone.$PLUGIN_ID);

