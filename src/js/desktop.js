jQuery.noConflict();

(async function ($, PLUGIN_ID) {
  'use strict';
  const config = kintone.plugin.app.getConfig(PLUGIN_ID);
  console.log(config);
  const appId = kintone.app.getId();
  const lang = config?.language ? config?.language : 'en';
  const apiKey = config.token;
  const timeSheetUrl = 'https://timesheet-plugin.herokuapp.com/api/1';
  kintone.events.on('app.record.index.show', async function (event) {
    if (!$('#mf-jiraTimesheet').length) {
      let modalDiv = $('<div>', {
        id: 'modalLoading',
        class: 'modal',
        html: `
          <div class="modal-content">
            <div class="loader"></div>
            <p>${getPluginText('Get timesheet data', lang)}...</p>
          </div>
        `,
      });
      $('body').append(modalDiv);
      $('.gaia-argoui-app-index-toolbar').append(
        `
        <div class="mf-jiraTimesheet-controls" id="mf-jiraTimesheet">
          <div class="flex-row">
            <div class="flex-column">
              <label for="mf-startDate" class="mf-date-label">${getPluginText('Start date', lang)}</label>
              <input type="date" id="mf-startDate" class="mf-date-input plugin-mb-1 plugin-mr-small">
            </div>
            <div class="flex-column">
              <label for="mf-endDate" class="mf-date-label">${getPluginText('End date', lang)}</label>
              <input type="date" id="mf-endDate" class="mf-date-input plugin-mb-1 plugin-mr-small">
            </div>
            <button id="btnGetTimesheet" class="mf-submit-button plugin-mb-1" style="margin-top: 26px">${getPluginText('Get timesheet', lang)}</button>
          </div>
          <div>
          <button id="btnGetAllTimesheet" class="mf-submit-button">${getPluginText('Get all timesheet', lang)}</button>
          </div>
        </div>
        `
      );
      $('#btnGetTimesheet, #btnGetAllTimesheet').click(async function (event) {;
        // Xử lý sự kiện click ở đây)
        let startDateValue = $('#mf-startDate').val();
        let endDateValue = $('#mf-endDate').val();
        if (event.target.id === 'btnGetAllTimesheet') {
          startDateValue = '1970-01-01';
          let currentDate = new Date();
          let year = currentDate.getFullYear();
          let month = String(currentDate.getMonth() + 1).padStart(2, '0');
          let day = String(currentDate.getDate()).padStart(2, '0');
          endDateValue = `${year}-${month}-${day}`;
        }
        if (!startDateValue || !endDateValue) {
          alert(getPluginText('Enter the start date and end date!', lang));
          return;
        }
        const apiUrl = timeSheetUrl + `/exportData.csv?start=${startDateValue}&end=${endDateValue}&allUsers=true&Apikey=${apiKey}`;
        modalDiv.show();
        let result = await proxyRequest(PLUGIN_ID, apiUrl, 'GET', {}, {});
        console.log('timesheetdata', result);
        if (result.status.toString() === '401') {
          alert(getPluginText('Invalid token', lang));
        }
        else {
          let response = convertCsvToArray(result.body);
          // get all records
          let { records } = await getRecords(appId);
          let currentData = records.map(o => {
            return {
              projectName: o[`${config?.timesheetProject}`].value,
              issueType: o[`${config?.timesheetIssueType}`].value,
              key: o[`${config?.timesheetKey}`].value,
              summary: o[`${config?.timesheetSummary}`].value,
              priority: o[`${config?.timesheetPriority}`].value,
              displayName: o[`${config?.timesheetDisplayName}`].value,
              timeSpent: o[`${config?.timesheetTimespent}`].value,
              dateStarted: o[`${config?.timesheetDateStarted}`].value,
              workDescription: o[`${config?.timesheetWorkDescription}`].value
            }
          });
          // filter exist data
          const expectData = [];
          for (let a of response) {
            let check = true;
            for (let b of currentData) {
              if (a.projectName === b.projectName && a.issueType === b.issueType && a.key === b.key &&
                a.summary === b.summary && a.priority === b.priority && a.displayName === b.displayName &&
                a.timeSpent.toString() === b.timeSpent.toString() && new Date(`${a.dateStarted}`).toISOString() === new Date(`${b.dateStarted}`).toISOString() && a.workDescription === b.workDescription
              ) {
                check = false;
                break;
              }
            }
            if (check) expectData.push(a);
          }
          for (let item of expectData) {
            let body = {
              'app': appId,
              'record': {
                [`${config?.timesheetProject}`]: {
                  value: item?.projectName
                },
                [`${config?.timesheetIssueType}`]: {
                  value: item?.issueType
                },
                [`${config?.timesheetKey}`]: {
                  value: item?.key
                },
                [`${config?.timesheetSummary}`]: {
                  value: item?.summary
                },
                [`${config?.timesheetPriority}`]: {
                  value: item?.priority
                },
                [`${config?.timesheetDateStarted}`]: {
                  value: new Date(`${item?.dateStarted}`).toISOString()
                },
                [`${config?.timesheetDisplayName}`]: {
                  value: item?.displayName
                },
                [`${config?.timesheetTimespent}`]: {
                  value: +item?.timeSpent
                },
                [`${config?.timesheetWorkDescription}`]: {
                  value: item?.workDescription
                }
              }
            }
            await addRecord(body);
          }
        }
        modalDiv.hide();
        window.location.reload();
      });
    }
  })
})(jQuery, kintone.$PLUGIN_ID);
