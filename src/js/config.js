jQuery.noConflict();
const pluginText = {
  'Submit': {
    en: 'Submit',
    ja: '送信'
  },
  'Save': {
    en: 'Save',
    ja: '保存'
  },
  'Cancel': {
    en: 'Cancel',
    ja: 'キャンセル'
  },
  'Start date': {
    en: 'Start date',
    ja: '開始日'
  },
  'End date': {
    en: 'End date',
    ja: '終了日'
  },
  'Token': {
    en: 'Token',
    ja: 'トークン'
  },
  'Show token': {
    en: 'Show token',
    ja: 'トークンを表示する'
  },
  'Display name': {
    en: 'Display name',
    ja: '表示名'
  },
  'Field code': {
    en: 'Field code',
    ja: 'フィールドコード'
  },
  'Configure plugin display': {
    en: 'Configure plugin display',
    ja: 'プラグインの表示設定'
  },
  'Display name is required': {
    en: 'Display name is required',
    ja: '表示名は必須です。'
  },
  'Field code is required': {
    en: 'Field code is required',
    ja: 'フィールドコードは必須です'
  },
  'Create': {
    en: 'Create',
    ja: '作成する'
  },
  'Submit button': {
    en: 'Submit button',
    ja: '送信ボタン'
  },
  "If you haven't installed the start date and end date fields on the form, please set them up here.": {
    en: "If you haven't installed the start date and end date fields on the form, please set them up here.",
    ja: '「開始日」と「終了日」フィールドがフォームにインストールされていない場合は、ここで設定してください。'
  },
  "If you have installed these 2 fields, start date and end date in the form, please enter their field codes below.": {
    en: "If you have installed these 2 fields, start date and end date in the form, please enter their field codes below.",
    ja: "フォームで「開始日」と「終了日」のフィールドをインストールした場合は、その２つのフィールドの設定内でフィールドコードを入力してください。"
  },
  "Field codes are duplicated.": {
    en: "Field codes are duplicated.",
    ja: "フィールドコードが重複しています。"
  },
  "Create success": {
    en: "Create success",
    ja: "作成が完了しました。"
  },
  "The plug-in settings have been saved. Please update the app!": {
    en: "The plug-in settings have been saved. Please update the app!",
    ja: "プラグインの設定が保存されました。アプリを更新してください！"
  },
  "Language": {
    en: "Language",
    ja: "言語"
  },
  "The start date field must have the type DATE": {
    en: "The start date field must have the type DATE",
    ja: "「開始日」フィールドは日付型を選択しないといけない。"
  },
  "The end date field must have the type DATE": {
    en: "The end date field must have the type DATE",
    ja: "「終了日」フィールドは日付型を選択しないといけない。"
  }
}
function getPluginText(text, lang) {
  try {
    return pluginText[text][lang];
  }
  catch (e) {
    console.error(text, lang, e);
    return '';
  }
}

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
      if (startDateFieldCode && resp.properties[startDateFieldCode]?.type !== "DATE") {
        $('#error-startDateFieldCode').text(getPluginText('The start date field must have the type DATE', lang));
      }
      if (endDateFieldCode && resp.properties[endDateFieldCode]?.type !== "DATE") {
        $('#error-endDateFieldCode').text(getPluginText('The end date field must have the type DATE', lang));
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
  $('#plugin-language').val(config?.language ? config?.language : 'en');

  $('#btnSave').on('click', function (e) {
    e.preventDefault();
    let token = $token.val();
    let showStartDate = $('#showStartDate').prop("checked").toString();
    let showEndDate = $('#showEndDate').prop("checked").toString();
    let showSubmitButton = $('#showSubmitButton').prop("checked").toString();
    let startDateFieldCode = $('#startDateFieldCode').val();
    let endDateFieldCode = $('#endDateFieldCode').val();
    let language = $('#plugin-language').val();
    let config = {
      token,
      showStartDate,
      showEndDate,
      showSubmitButton,
      startDateFieldCode,
      endDateFieldCode,
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

