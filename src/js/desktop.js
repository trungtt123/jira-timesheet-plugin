jQuery.noConflict();
const pluginText = {
  'Submit': {
    en: 'Submit',
    ja: '送信'
  },
  'Loading': {
    en: 'Loading',
    ja: '読み込み'
  },
  'No data': {
    en: 'No data',
    ja: 'データなし'
  },
  'Start date must be less than or equal to end date.': {
    en: 'Start date must be less than or equal to end date.',
    ja: '開始日には終了日より前の日付あるいは同じ日付を指定してください。'
  },
  'You need to configure the 2 fieldcodes as startdate and enddate to use MF kintone-plugin-Timesheeet.': {
    en: 'You need to configure the 2 fieldcodes as startdate and enddate to use MF kintone-plugin-Timesheeet.',
    ja: `「MF kintone-plugin-Timeshee」のプラグインを使用できるために、
    「開始日」と「終了日」のフィールドにフィールドコード値を設定しないといけないです。
    「startdate」値と「enddate」値を固定してください。`
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
  function getAppData() {
    return new Promise(function (resolve, reject) {
      const body = {
        'app': appId
      }
      kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', body, function (resp) {
        // success
        resolve(resp);
      }, function (error) {
        // error
        reject(error);
      });
    });
  }
  if (!startDateFieldCode || !endDateFieldCode) {
    alert(getPluginText('You need to configure the 2 fieldcodes as startdate and enddate to use MF kintone-plugin-Timesheeet.', lang));
    return;
  }
  else {
    let appFormData = await getAppData();
    console.log(appFormData);
    if (appFormData.properties[startDateFieldCode]?.type !== "DATE") {
      alert(getPluginText('The start date field must have the type DATE', lang));
      return;
    }
    if (appFormData.properties[endDateFieldCode]?.type !== "DATE") {
      alert(getPluginText('The end date field must have the type DATE', lang));
      return;
    } 
  }
  // create table element
  function convertJsonToHtmlTable(data) {
    try {
      // let tableHtml = document.createElement('div');
      // tableHtml.id = 'project-cost-table'
      let headerTabTxt = `<th></th>`;
      let bodyTabTxt = ``;

      for (let user of data.data) {
        headerTabTxt += `<th><p style="text-align: center; padding-left: 5px; padding-right: 5px">${user.displayName}</p></th>`
      }
      for (let projectName of data.projects) {
        let row = `<td>${projectName}</td>`;
        for (let user of data.data) {
          let project = user.projects.find(o => o.projectName === projectName)
          if (project) {
            row += `<td><p style="text-align: center; font-weight: bold;">${project.timePercent}</p></td>`;
          }
          else row += `<td><p style="text-align: center; font-weight: bold;">${0}</p></td>`;
        }
        bodyTabTxt += `<tr>${row}</tr>`
      }
      let tableHtmlText = `<table>
        <thead>
        <tr>
        ${headerTabTxt}
        </tr>
        </thead>
        <tbody>
        ${bodyTabTxt}
        </tbody>
        </table>`;
      // tableHtml.innerHTML = tableHtmlText;

      return tableHtmlText;
    }
    catch (e) {
      console.error(e);
    }
  }
  // call api
  function convertCsvToObject(csvData) {
    const data = csvData.trim().split('\n');
    data.pop();
    data.splice(0, 1);
    let result = [];
    let listProjectName = [];
    for (let item of data) {
      let o = {};
      let itemTmp = item.split(',');
      o.projectName = itemTmp[0]?.slice(1, -1);
      o.issueType = itemTmp[1];
      o.key = itemTmp[2];
      o.summary = itemTmp[3]?.slice(1, -1);
      o.priority = itemTmp[4]?.slice(1, -1);
      o.dateStarted = itemTmp[5];
      o.displayName = itemTmp[6]?.slice(1, -1);
      if (!listProjectName.find(projectName => projectName === o.projectName)) {
        listProjectName.push(o.projectName);
      }
      o.timeSpent = +itemTmp[7];
      o.workDescription = itemTmp[8]?.slice(1, -1);
      let userIndex = result.findIndex(user => user.displayName === o.displayName);
      if (userIndex === -1) {
        result.push({
          displayName: o.displayName,
          projects: [{
            projectName: o.projectName,
            totalTimeSpent: o.timeSpent
          }],
          totalTime: o.timeSpent
        })
      }
      else {
        let projectIndex = result[userIndex].projects.findIndex(project => project.projectName === o.projectName);
        if (projectIndex === -1) {
          result[userIndex].projects.push({
            projectName: o.projectName,
            totalTimeSpent: o.timeSpent
          });
          result[userIndex].totalTime += o.timeSpent;
        }
        else {
          result[userIndex].projects[projectIndex].totalTimeSpent += o.timeSpent;
          result[userIndex].totalTime += o.timeSpent;
        }
      }
    }
    console.log('result', result);
    let expactedData = {};
    for (let user of result) {
      expactedData[`${user.displayName}`] = [];
      let currentPercentTmp = 0;
      user.projects.sort(function (a, b) {
        return b.totalTimeSpent - a.totalTimeSpent;
      });
      for (let projectIndex in user.projects) {
        user.projects[projectIndex]['timePercent'] = Math.floor(user.projects[projectIndex].totalTimeSpent / user.totalTime * 100);
        currentPercentTmp += user.projects[projectIndex]['timePercent'];
        user.projects[projectIndex]['timePercent'] = 100;
      }
      const percentRemain = 100 - currentPercentTmp;
      for (let projectIndex = 0; projectIndex < percentRemain; projectIndex++) {
        user.projects[projectIndex]['timePercent']++;
      }
    }
    console.log('result', result);
    return {
      projects: listProjectName,
      data: result
    };
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

  const timeSheetUrl = 'https://timesheet-plugin.herokuapp.com/api/1';
  // event app record detail show
  kintone.events.on('app.record.detail.show', function (event) {
    clearPluginLayout();
    initPluginLayout();

    kintone.app.record.setFieldShown(config?.startDateFieldCode, showStartDate);
    kintone.app.record.setFieldShown(config?.endDateFieldCode, showEndDate);

    let record = event.record;
    let startDateValue = record[config?.startDateFieldCode].value;
    let endDateValue = record[config?.endDateFieldCode].value;

    let $timeSheetStatus = $('#timeSheetStatus');
    let $projectCostTable = $('#projectCostTable');
    let $loading = $('#loading');

    $timeSheetStatus.hide();
    $projectCostTable.hide();
    $loading.show();
    // call api get project cost data
    const apiUrl = timeSheetUrl + `/exportData.csv?start=${startDateValue}&end=${endDateValue}&allUsers=true&Apikey=${apiKey}`;
    kintone.plugin.app.proxy(PLUGIN_ID, apiUrl, 'GET', {}, {}, function (body, status, headers) {
      let response = convertCsvToObject(body);
      if (response.projects.length === 0) {
        $timeSheetStatus.text(getPluginText('No data', lang));
        $timeSheetStatus.show();
      }
      else {
        $projectCostTable.html(convertJsonToHtmlTable(response));
        $projectCostTable.show();
      }
      $loading.hide();
    })
  });
  kintone.events.on('app.record.create.show', function (event) {
    clearPluginLayout();
    initPluginLayout();

    kintone.app.record.setFieldShown(config?.startDateFieldCode, showStartDate);
    kintone.app.record.setFieldShown(config?.endDateFieldCode, showEndDate);

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
        kintone.plugin.app.proxy(PLUGIN_ID, apiUrl, 'GET', {}, {}, function (body, status, headers) {
          let response = convertCsvToObject(body);
          if (response.projects.length === 0) {
            $timeSheetStatus.text(getPluginText('No data', lang));
            $timeSheetStatus.show();
          }
          else {
            $projectCostTable.html(convertJsonToHtmlTable(response));
            $projectCostTable.show();
          }
          $submitButton.show();
          $loading.hide();
        }, function (error) {
          console.log(error);
        });
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
  });
  kintone.events.on('app.record.edit.show', function (event) {
    clearPluginLayout();
    initPluginLayout();

    kintone.app.record.setFieldShown(config?.startDateFieldCode, showStartDate);
    kintone.app.record.setFieldShown(config?.endDateFieldCode, showEndDate);

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
        kintone.plugin.app.proxy(PLUGIN_ID, apiUrl, 'GET', {}, {}, function (body, status, headers) {
          let response = convertCsvToObject(body);
          if (response.projects.length === 0) {
            $timeSheetStatus.text(getPluginText('No data', lang));
            $timeSheetStatus.show();
          }
          else {
            $projectCostTable.html(convertJsonToHtmlTable(response));
            $projectCostTable.show();
          }
          $submitButton.show();
          $loading.hide();
        }, function (error) {
          console.log(error);
        });
      });
    }
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
})(jQuery, kintone.$PLUGIN_ID);
