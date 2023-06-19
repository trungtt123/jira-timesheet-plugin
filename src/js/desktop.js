jQuery.noConflict();

(async function ($, PLUGIN_ID) {
  'use strict';
  const config = kintone.plugin.app.getConfig(PLUGIN_ID);
  console.log(config);
  const appId = kintone.app.getId();
  const lang = config?.language ? config?.language : 'en';
  const apiKey = config.token;
  const startDateFieldCode = config?.startDateFieldCode;
  const endDateFieldCode = config?.endDateFieldCode;
  const timesheetFieldCode = config?.timesheetFieldCode;
  const timeSheetUrl = 'https://timesheet-plugin.herokuapp.com/api/1';
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
      // if (appFormData.properties[timesheetFieldCode]?.type !== "FILE") {
      //   alert(getPluginText('The timesheet data storage file field must have the type FILE', lang));
      //   return;
      // }
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
      $(`#view-list-data-gaia table.recordlist-gaia thead th:eq(${position})`).hide();
    }
  })

  kintone.events.on(['app.record.create.show', 'app.record.edit.show'], async function (event) {
    let record = event.record;
    console.log(record);
    let startDateValue = record[config?.startDateFieldCode].value;
    let endDateValue = record[config?.endDateFieldCode].value;
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
    const modalDiv = $('<div>', {
      id: 'modalLoading',
      class: 'modal',
      html: `
        <div class="modal-content">
          <div class="loader"></div>
          <p>Loading...</p>
        </div>
      `,
    });
    
    // Gắn modalDiv vào vị trí mong muốn trong tài liệu
    // Ví dụ: Gắn vào thẻ body
    $('body').append(modalDiv);
    modalDiv.hide();
    try {
      let record = event.record;
      console.log(record);
      let startDateValue = record[`${startDateFieldCode}`]?.value;
      let endDateValue = record[`${endDateFieldCode}`]?.value;
      const apiUrl = timeSheetUrl + `/exportData.csv?start=${startDateValue}&end=${endDateValue}&allUsers=true&Apikey=${apiKey}`;
      let result = await proxyRequest(PLUGIN_ID, apiUrl, 'GET', {}, {});
      console.log('timesheetdata', result);
      if (result.status.toString() === '401') {
        alert(getPluginText('Invalid token', lang));
      }
      else {
        let response = convertCsvToArray(result.body);
        // get all records
        let { records } = await getRecords(appId);
        let currentData = [];
        for (let item of records) {
          if (item.$id.value === record.$id.value) continue;
          let tableData = item[config?.timesheetFieldCode].value;
          tableData = tableData.map(o => {
            return {
              projectName: o.value[`${config?.timesheetProject}`].value,
              issueType: o.value[`${config?.timesheetIssueType}`].value,
              key: o.value[`${config?.timesheetKey}`].value,
              summary: o.value[`${config?.timesheetSummary}`].value,
              priority: o.value[`${config?.timesheetPriority}`].value,
              displayName: o.value[`${config?.timesheetDisplayname}`].value,
              timeSpent: o.value[`${config?.timesheetTimespent}`].value,
              dateStarted: o.value[`${config?.timesheetDateTime}`].value,
              workDescription: o.value[`${config?.timesheetWorkDescription}`].value,
            }

          });
          currentData = currentData.concat(tableData);
        }
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
        let body = {
          "app": appId,
          "id": record.$id.value,
          "record": {}
        }
        let newSubtableData = [];
        for (let item of expectData) {
          newSubtableData.push({
            value: {
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
              [`${config?.timesheetDateTime}`]: {
                value: new Date(`${item?.dateStarted}`).toISOString()
              },
              [`${config?.timesheetDisplayname}`]: {
                value: item?.displayName
              },
              [`${config?.timesheetTimespent}`]: {
                value: +item?.timeSpent
              },
              [`${config?.timesheetWorkDescription}`]: {
                value: item?.workDescription
              }
            }
          })
        }
        body['record'][`${config.timesheetFieldCode}`] = {
          "value": newSubtableData
        };
        await updateRecord(body);
      }
    }
    catch (e) {
      console.error(e);
    }
    modalDiv.remove();
  });
})(jQuery, kintone.$PLUGIN_ID);
