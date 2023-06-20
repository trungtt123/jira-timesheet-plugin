jQuery.noConflict();

(async function ($, PLUGIN_ID) {
  'use strict';
  console.log(kintone.plugin.app.getConfig(PLUGIN_ID));
  const config = kintone.plugin.app.getConfig(PLUGIN_ID);
  const appId = kintone.app.getId();
  const lang = config?.language ? config?.language : 'en';
  let appData;
  function initConfigLayout() {
    $(".plugin-text-field").each(function () {
      let text = $(this).text();
      $(this).text(getPluginText(text, lang));
    });
  }
  async function updateSelectOption(selects) {
    appData = await getAppData(appId);
    console.log('appData', appData)
    let listFields = Object.keys(appData.properties);
    let dateField = [''].concat(listFields?.filter(o => appData.properties[o]?.type === 'DATE'));
    let subtableField = [''].concat(listFields?.filter(o => appData.properties[o]?.type === 'SUBTABLE'));
    if (selects?.includes('startDateFieldCode')) {
      $('#startDateFieldCode').empty();
      for (let date of dateField) {
        $('#startDateFieldCode').append($('<option>', {
          value: date,
          text: date
        }));
      }
    }
    if (selects?.includes('endDateFieldCode')) {
      $('#endDateFieldCode').empty();
      for (let date of dateField) {
        $('#endDateFieldCode').append($('<option>', {
          value: date,
          text: date
        }));
      }
    }
    if (selects?.includes('timesheetFieldCode')) {
      $('#timesheetFieldCode').empty();
      for (let subtable of subtableField) {
        $('#timesheetFieldCode').append($('<option>', {
          value: subtable,
          text: subtable
        }));
      }
    }
  }
  await updateSelectOption(['startDateFieldCode', 'endDateFieldCode', 'timesheetFieldCode']);
  $('#timesheetFieldCode').change(function () {
    let textField = [''];
    let dateTimeField = [''];
    let numberField = [''];
    try {
      $('#timesheetProject, #timesheetIssueType, #timesheetKey, #timesheetSummary, #timesheetPriority, #timesheetDisplayName, #timesheetWorkDescription,#timesheetDateStarted,#timesheetTimespent').empty();
      let timesheetFieldCode = $('#timesheetFieldCode').val();
      let listFieldsOfTimesheet = appData.properties[timesheetFieldCode]?.fields;
      let listFieldName = Object.keys(listFieldsOfTimesheet);
      textField = textField.concat(listFieldName?.filter(o => listFieldsOfTimesheet[o]?.type === 'SINGLE_LINE_TEXT'));
      dateTimeField = dateTimeField.concat(listFieldName?.filter(o => listFieldsOfTimesheet[o]?.type === 'DATETIME'));
      numberField = numberField.concat(listFieldName?.filter(o => listFieldsOfTimesheet[o]?.type === 'NUMBER'));
    }
    catch (e) {
      console.log(e);
    }
    for (let text of textField) {
      $('#timesheetProject, #timesheetIssueType, #timesheetKey, #timesheetSummary, #timesheetPriority, #timesheetDisplayName, #timesheetWorkDescription').append($('<option>', {
        value: text,
        text: text
      }));
    }
    for (let dateTime of dateTimeField) {
      $('#timesheetDateStarted').append($('<option>', {
        value: dateTime,
        text: dateTime
      }));
    }
    for (let number of numberField) {
      $('#timesheetTimespent').append($('<option>', {
        value: number,
        text: number
      }));
    }
    $('#timesheetProject, #timesheetIssueType, #timesheetKey, #timesheetSummary, #timesheetPriority, #timesheetDisplayName, #timesheetWorkDescription, #timesheetDateStarted, #timesheetTimespent').val('');
  });
  $('#token').val(config?.token);
  $('#startDateFieldCode').val(config?.startDateFieldCode);
  $('#endDateFieldCode').val(config?.endDateFieldCode);
  $('#timesheetFieldCode').val(config?.timesheetFieldCode);
  $('#plugin-language').val(config?.language ? config?.language : 'en');
  $('#timesheetFieldCode').trigger('change');
  $('#timesheetProject').val(config?.timesheetProject);
  $('#timesheetIssueType').val(config?.timesheetIssueType);
  $('#timesheetKey').val(config?.timesheetKey);
  $('#timesheetSummary').val(config?.timesheetSummary);
  $('#timesheetPriority').val(config?.timesheetPriority);
  $('#timesheetDateStarted').val(config?.timesheetDateStarted);
  $('#timesheetDisplayName').val(config?.timesheetDisplayName);
  $('#timesheetTimespent').val(config?.timesheetTimespent);
  $('#timesheetWorkDescription').val(config?.timesheetWorkDescription);


  initConfigLayout();

  let $form = $('.js-submit-settings');
  let $cancelButton = $('.js-cancel-button');
  let $showToken = $('#showToken');
  if (!($form.length > 0 && $cancelButton.length > 0)) {
    throw new Error('Required elements do not exist.');
  }

  $('#btnSave').on('click', function (e) {
    e.preventDefault();
    let token = $('#token').val();
    let startDateFieldCode = $('#startDateFieldCode').val();
    let endDateFieldCode = $('#endDateFieldCode').val();
    let timesheetFieldCode = $('#timesheetFieldCode').val();
    let timesheetProject = $('#timesheetProject').val();
    let timesheetIssueType = $('#timesheetIssueType').val();
    let timesheetKey = $('#timesheetKey').val();
    let timesheetSummary = $('#timesheetSummary').val();
    let timesheetPriority = $('#timesheetPriority').val();
    let timesheetDateStarted = $('#timesheetDateStarted').val();
    let timesheetDisplayName = $('#timesheetDisplayName').val();
    let timesheetTimespent = $('#timesheetTimespent').val();
    let timesheetWorkDescription = $('#timesheetWorkDescription').val();
    let language = $('#plugin-language').val();
    let config = {
      token,
      startDateFieldCode,
      endDateFieldCode,
      timesheetFieldCode,
      timesheetProject,
      timesheetIssueType,
      timesheetKey,
      timesheetSummary,
      timesheetPriority,
      timesheetDateStarted,
      timesheetDisplayName,
      timesheetTimespent,
      timesheetWorkDescription,
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
    $('#modalLoading').show();
    deployApp(appId, body).then(async () => {
      await sleep(10);
      await updateSelectOption(['startDateFieldCode']);
      alert(getPluginText('Create success', lang));
      $('#startDateDisplayName').val('');
      $('#startDateFC').val('');
      $('#error-displayNameStartDate').text('');
      $('#error-startDateFC').text('');
      $('#startDateFieldCode').val(fieldCode);
    }).catch((e) => {
      alert(getPluginText('Field codes are duplicated.', lang));
      console.log(e)
    }).finally(() => {
      $('#modalLoading').hide();
    });
  })
  $('#btnCreateEndDate').on('click', async function (e) {
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
    $('#modalLoading').show();
    deployApp(appId, body).then(async () => {
      await sleep(10);
      await updateSelectOption(['endDateFieldCode']);
      alert(getPluginText('Create success', lang));
      $('#endDateDisplayName').val('');
      $('#endDateFC').val('');
      $('#error-displayNameEndDate').text('');
      $('#error-endDateFC').text('');
      $('#endDateFieldCode').val(fieldCode);
    }).catch((e) => {
      alert(getPluginText('Field codes are duplicated.', lang));
      console.log(e)
    }).finally(() => {
      $('#modalLoading').hide();
    });
  })
  $('#btnCreateTimesheet').on('click', function (e) {
    e.preventDefault();
    let displayName = $('#timesheetDataDisplayName').val();
    let fieldCode = $('#timesheetFC').val();
    let isValidate = true;
    if (!displayName) {
      isValidate = false;
      $('#error-displayNameDataTimesheet').text(getPluginText('Display name is required', lang));
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
      "type": "SUBTABLE",
      "fields": {
        [`${fieldCode}_project`]: {
          'type': 'SINGLE_LINE_TEXT',
          'code': `${fieldCode}_project`,
          'label': 'Project'
        },
        [`${fieldCode}_issueType`]: {
          'type': 'SINGLE_LINE_TEXT',
          'code': `${fieldCode}_issueType`,
          'label': 'Issue Type'
        },
        [`${fieldCode}_key`]: {
          'type': 'SINGLE_LINE_TEXT',
          'code': `${fieldCode}_key`,
          'label': 'Key'
        },
        [`${fieldCode}_summary`]: {
          'type': 'SINGLE_LINE_TEXT',
          'code': `${fieldCode}_summary`,
          'label': 'Summary'
        },
        [`${fieldCode}_priority`]: {
          'type': 'SINGLE_LINE_TEXT',
          'code': `${fieldCode}_priority`,
          'label': 'Priority'
        },
        [`${fieldCode}_dateStarted`]: {
          'type': 'DATETIME',
          'code': `${fieldCode}_dateStarted`,
          'label': 'Date started'
        },
        [`${fieldCode}_displayName`]: {
          'type': 'SINGLE_LINE_TEXT',
          'code': `${fieldCode}_displayName`,
          'label': 'Display Name'
        },
        [`${fieldCode}_timeSpent`]: {
          'type': 'NUMBER',
          'code': `${fieldCode}_timeSpent`,
          'label': 'Time spent (h)'
        },
        [`${fieldCode}_workDescription`]: {
          'type': 'SINGLE_LINE_TEXT',
          'code': `${fieldCode}_workDescription`,
          'label': 'Work description'
        }
      },
      "code": fieldCode,
      "label": displayName
    }
    $('#modalLoading').show();
    deployApp(appId, body).then(async () => {
      await sleep(10);
      await updateSelectOption(['timesheetFieldCode']);
      alert(getPluginText('Create success', lang));
      $('#timesheetDataDisplayName').val('');
      $('#timesheetFC').val('');
      $('#error-displayNameDataTimesheet').text('');
      $('#error-timesheetFC').text('');
      $('#timesheetFieldCode').val(fieldCode);
      $('#timesheetFieldCode').trigger('change');
      $('#timesheetProject').val(`${fieldCode}_project`);
      $('#timesheetIssueType').val(`${fieldCode}_issueType`);
      $('#timesheetKey').val(`${fieldCode}_key`);
      $('#timesheetSummary').val(`${fieldCode}_summary`);
      $('#timesheetPriority').val(`${fieldCode}_priority`);
      $('#timesheetDateStarted').val(`${fieldCode}_dateStarted`);
      $('#timesheetDisplayName').val(`${fieldCode}_displayName`);
      $('#timesheetTimespent').val(`${fieldCode}_timeSpent`);
      $('#timesheetWorkDescription').val(`${fieldCode}_workDescription`);
    }).catch((e) => {
      alert(getPluginText('Field codes are duplicated.', lang));
      console.log(e)
    }).finally(() => {
      $('#modalLoading').hide();
    });
  })
  $showToken.change(function (e) {
    console.log(e.target.checked);
    if (e.target.checked) {
      $('#token').prop("type", "text");
    }
    else {
      $('#token').prop("type", "password");
    }
  });
})(jQuery, kintone.$PLUGIN_ID);

