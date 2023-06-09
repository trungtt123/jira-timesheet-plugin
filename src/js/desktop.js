jQuery.noConflict();

(async function ($, PLUGIN_ID) {
  'use strict';
  let config = kintone.plugin.app.getConfig(PLUGIN_ID);
  console.log(config);
  const appId = kintone.app.getId();
  const lang = config?.language ? config?.language : 'en';
  const apiKey = config.token;
  const showStartDate = config?.showStartDate === 'true' ? true : false;
  const showEndDate = config?.showEndDate === 'true' ? true : false;
  const showSubmitButton = config?.showSubmitButton === 'true' ? true : false;
  const startDateFieldCode = config?.startDateFieldCode;
  const endDateFieldCode = config?.endDateFieldCode;
  const timesheetFieldCode = config?.timesheetFieldCode;
  const timeSheetUrl = 'https://timesheet-plugin.herokuapp.com/api/1';
  let timesheetData;
  function initPluginLayout() {
    let pluginSpace = $('#plugin-space');
    if (!pluginSpace.length) {
      $('#record-gaia').parent().append(`<div id="plugin-space"><h3>MF kintone-plugin-Timesheeet</h3></div>`);
      pluginSpace = $('#plugin-space');
    }
    let timeSheetStatus = $('<div>').attr('id', 'timeSheetStatus');
    let costTable = $('<div>').attr('id', 'projectCostTable');
    let btnSubmit = $('<button>').attr('id', 'btnSubmit').text(getPluginText('Submit', lang));
    let loading = $('<div>').attr('id', 'loading').html(`<i class="fa fa-spinner fa-spin"></i>&nbsp;${getPluginText('Loading', lang)}`);
    btnSubmit.addClass('buttonload');
    timeSheetStatus.addClass('timesheet-status');
    timeSheetStatus.hide();
    costTable.hide();
    btnSubmit.hide();
    loading.hide();
    pluginSpace.append(btnSubmit);
    pluginSpace.append(loading);
    pluginSpace.append(timeSheetStatus);
    pluginSpace.append(costTable);
  }
  function clearPluginLayout() {
    let timeSheetStatus = $('#timesheetStatus');
    if (timeSheetStatus) timeSheetStatus.remove();
    let costTable = $('#projectCostTable');
    if (costTable) costTable.remove();
    let btnSubmit = $('#btnSubmit');
    if (btnSubmit) btnSubmit.remove();
    let loading = $('#loading');
    if (loading) loading.remove();
    let pluginSpace = $('#plugin-space');
    if (pluginSpace) pluginSpace.remove();
  }
  if (!startDateFieldCode || !endDateFieldCode || !timesheetFieldCode) {
    alert(getPluginText('You need to configure the 3 fieldcodes as start date, end date and timesheet data storage file to use MF kintone-plugin-Timesheeet.', lang));
    return;
  }
  else {
    try {
      let appFormData = await getAppData(appId);
      if (appFormData.properties[startDateFieldCode]?.type !== "DATE") {
        alert(getPluginText('The start date field must have the type DATE', lang));
        return;
      }
      if (appFormData.properties[endDateFieldCode]?.type !== "DATE") {
        alert(getPluginText('The end date field must have the type DATE', lang));
        return;
      }
      if (appFormData.properties[timesheetFieldCode]?.type !== "FILE") {
        alert(getPluginText('The timesheet data storage file field must have the type FILE', lang));
        return;
      }
    }
    catch (e) {
      console.error(e);
    }
  }
  kintone.events.on('app.record.index.show', async function (event) {
    let arr = kintone.app.getFieldElements(timesheetFieldCode);
    if (arr && arr.length > 0) {
      let position = -1;
      console.log(arr[0]);
      console.log(arr[0].parentElement);
      let row = arr[0].parentElement;
      let tds = row.querySelectorAll('td');
      for (let i = 0; i < tds.length; i++) {
        if (tds[i] === arr[0]) {
          position = i;
          break;
        }
      }
      arr.forEach(element => {
        element.style.display = 'none';
      });
      $(`#view-list-data-gaia table.recordlist-gaia.recordlist-manually-adjusted-gaia thead th:eq(${position})`).hide();
    }
  })
  // event app record detail show
  kintone.events.on('app.record.detail.show', async function (event) {
    clearPluginLayout();
    initPluginLayout();

    kintone.app.record.setFieldShown(startDateFieldCode, showStartDate);
    kintone.app.record.setFieldShown(endDateFieldCode, showEndDate);
    kintone.app.record.setFieldShown(timesheetFieldCode, false);

    let record = event.record;

    let $timeSheetStatus = $('#timeSheetStatus');
    let $projectCostTable = $('#projectCostTable');
    let $loading = $('#loading');

    $timeSheetStatus.hide();
    $projectCostTable.hide();
    $loading.show();
    console.log('record', record);
    let fileKey = record[`${timesheetFieldCode}`].value[0].fileKey;
    downloadAndReadKintoneFile(fileKey).then((response) => {
      if (isJSON(response)) {
        response = JSON.parse(response);
        if (Object.keys(response).length === 0) {
          $timeSheetStatus.text(getPluginText('No data', lang));
          $timeSheetStatus.show();
        }
        else {
          $projectCostTable.html(convertJsonToHtmlTable(response));
          $projectCostTable.show();
        }
      }
      else {
        $timeSheetStatus.text(getPluginText('No data', lang));
        $timeSheetStatus.show();
      }
    }).catch((e) => {
      console.error(e);
      $timeSheetStatus.text(getPluginText('No data', lang));
      $timeSheetStatus.show();
    }).finally(() => {
      $loading.hide();
    });
  });
  kintone.events.on(['app.record.create.show', 'app.record.edit.show'], async function (event) {
    clearPluginLayout();
    initPluginLayout();

    kintone.app.record.setFieldShown(startDateFieldCode, showStartDate);
    kintone.app.record.setFieldShown(endDateFieldCode, showEndDate);
    kintone.app.record.setFieldShown(timesheetFieldCode, false);

    let record = event.record;
    let startDateValue = record[config?.startDateFieldCode].value;
    let endDateValue = record[config?.endDateFieldCode].value;

    let $submitButton = $('#btnSubmit');
    let $timeSheetStatus = $('#timeSheetStatus');
    let $projectCostTable = $('#projectCostTable');
    let $loading = $('#loading');

    if (showSubmitButton) {
      $submitButton.show();
      // handle event click submit button
      $submitButton.on('click', function () {
        if (startDateValue > endDateValue) {
          alert(getPluginText('Start date must be less than or equal to end date.', lang));
          return;
        }
        $submitButton.hide();
        $timeSheetStatus.hide();
        $projectCostTable.hide();
        $loading.show();
        // call api get project cost data
        const apiUrl = timeSheetUrl + `/exportData.csv?start=${startDateValue}&end=${endDateValue}&allUsers=true&Apikey=${apiKey}`;
        proxyRequest(PLUGIN_ID, apiUrl, 'GET', {}, {}).then((result) => {
          let response = convertCsvToObject(result.body);
          timesheetData = response;
          if (Object.keys(response).length === 0) {
            $timeSheetStatus.text(getPluginText('No data', lang));
            $timeSheetStatus.show();
          }
          else {
            $projectCostTable.html(convertJsonToHtmlTable(response));
            $projectCostTable.show();
          }
          $submitButton.show();

        }).catch(e => {
          console.error(e);
        }).finally(() => {
          $loading.hide();
        })

      });
    }
    kintone.events.on('app.record.create.change.startDate', function (event) {
      let record = event.record;
      startDateValue = record['startDate'].value;
      console.log('startDateValue', startDateValue)
    });
    kintone.events.on('app.record.create.change.endDate', function (event) {
      let record = event.record;
      endDateValue = record['endDate'].value;
      console.log('endDateValue', endDateValue)
    });
    kintone.events.on('app.record.edit.change.startDate', function (event) {
      let record = event.record;
      startDateValue = record['startDate'].value;
      console.log('startDateValue', startDateValue)
    });
    kintone.events.on('app.record.edit.change.endDate', function (event) {
      let record = event.record;
      endDateValue = record['endDate'].value;
      console.log('endDateValue', endDateValue)
    });
  });
  kintone.events.on(['app.record.create.submit.success', 'app.record.edit.submit.success'], async function (event) {
    // Lấy dữ liệu của bản ghi mới được tạo
    try {
      let record = event.record;
      let fileData = timesheetData ? JSON.stringify(timesheetData) : '';
      let blob = new Blob([fileData], { type: 'text/plain' });
      let formData = new FormData();
      formData.append('__REQUEST_TOKEN__', kintone.getRequestToken());
      formData.append('file', blob, 'mf-jira-timesheet.txt');
      let fileKey = (await uploadFile(formData)).fileKey;
      let body = {
        "app": appId,
        "id": record.$id.value,
        "record": {}
      }
      body['record'][`${config.timesheetFieldCode}`] = {
        "value": [{ "fileKey": fileKey }]
      };
      await updateRecord(body);
    }
    catch (e) {
      console.error(e);
    }
  });
})(jQuery, kintone.$PLUGIN_ID);
