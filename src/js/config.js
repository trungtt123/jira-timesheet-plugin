jQuery.noConflict();

(async function ($, PLUGIN_ID) {
  'use strict';
  console.log(kintone.plugin.app.getConfig(PLUGIN_ID));
  const config = kintone.plugin.app.getConfig(PLUGIN_ID);
  const appId = kintone.app.getId();
  const lang = config?.language ? config?.language : 'en';
  let appData = await getAppData(appId);
  function initConfigLayout() {
    $(".plugin-text-field").each(function () {
      let text = $(this).text();
      $(this).text(getPluginText(text, lang));
    });
  }
  let listFieldsOfTimesheet = appData.properties;
  let listFieldName = Object.keys(listFieldsOfTimesheet);
  let textField = [''].concat(listFieldName?.filter(o => listFieldsOfTimesheet[o]?.type === 'SINGLE_LINE_TEXT'));
  let dateTimeField = [''].concat(listFieldName?.filter(o => listFieldsOfTimesheet[o]?.type === 'DATETIME'));
  let numberField = [''].concat(listFieldName?.filter(o => listFieldsOfTimesheet[o]?.type === 'NUMBER'));
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
  $('#token').val(config?.token);
  $('#plugin-language').val(config?.language ? config?.language : 'en');
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

