jQuery.noConflict();

(async function ($, PLUGIN_ID) {
  "use strict";
  const config = kintone.plugin.app.getConfig(PLUGIN_ID);
  console.log(config);
  const appId = kintone.app.getId();
  const lang = config?.language ? config?.language : "en";
  const apiKey = config.token;
  const timeSheetUrl = "https://timesheet-plugin.herokuapp.com/api/1";
  kintone.events.on("app.record.index.show", async function (event) {
    if (!$("#mf-jiraTimesheet").length) {
      $("body").append(
        `<div id="modal-confirm-search-all" class="modal">
          <div class="modal-content">
            <p>${getPluginText(
              "全てのタイムシートを取得したいですか？",
              lang
            )}</p>
            <div class="modal-buttons">
              <button class="modal-confirm-button">${getPluginText(
                "確認する",
                lang
              )}</button>
              <button class="modal-cancel-button">${getPluginText(
                "キャンセル",
                lang
              )}</button>
            </div>
          </div>
        </div>`
      );
      let modalDiv = $("<div>", {
        id: "modalLoading",
        class: "modal1",
        html: `<div class="modal-content1">
            <div class="loader"></div>
            <p>${getPluginText("Get timesheet data", lang)}</p>
          </div>`,
      });
      $("body").append(modalDiv);
      $(".gaia-argoui-app-index-toolbar").append(
        `<div class="mf-jiraTimesheet-controls" id="mf-jiraTimesheet">
          <div class="flex-row">
            <div class="flex-column">
              <label for="mf-startDate" class="mf-date-label">${getPluginText(
                "Start date",
                lang
              )}</label>
              <input type="date" id="mf-startDate" class="mf-date-input plugin-mr-small">
            </div>

            <div class="flex-column">
              <label for="mf-endDate" class="mf-date-label">${getPluginText(
                "End date",
                lang
              )}</label>
              <input type="date" id="mf-endDate" class="mf-date-input plugin-mr-small">
            </div>

            <button id="btnGetTimesheet" class="mf-submit-button mr-2">${getPluginText(
              "Get timesheet",
              lang
            )}</button>

            <button id="btnGetAllTimesheet" class="mf-submit-button">${getPluginText(
              "Get all timesheet",
              lang
            )}</button>
          </div>
        </div>`
      );
      $("#mf-startDate").on("click", () => {
        $("#mf-startDate").removeClass("bg-color-warning");
      });
      $("#mf-endDate").on("click", () => {
        $("#mf-endDate").removeClass("bg-color-warning");
      });
      if (localStorage.getItem("mf-startDate")) {
        $("#mf-startDate").val(localStorage.getItem("mf-startDate"));
        localStorage.setItem("mf-startDate", "");
      }
      if (localStorage.getItem("mf-endDate")) {
        $("#mf-endDate").val(localStorage.getItem("mf-endDate"));
        localStorage.setItem("mf-endDate", "");
      }

      $("#btnGetAllTimesheet").on("click", () => {
        $("#modal-confirm-search-all").show();
      });

      $(".modal-cancel-button").on("click", () => {
        $("#modal-confirm-search-all").hide();
      });

      $("#btnGetTimesheet, .modal-confirm-button").click(
        async function (event) {
          try {
            $("#mf-startDate").removeClass("bg-color-warning");
            $("#mf-endDate").removeClass("bg-color-warning");
            $("#modal-confirm-search-all").hide();
            let startDateValue = $("#mf-startDate").val();
            let endDateValue = $("#mf-endDate").val();
            
            if (event.target.className === "modal-confirm-button") {
              startDateValue = "1970-01-01";
              let currentDate = new Date();
              let year = currentDate.getFullYear();
              let month = String(currentDate.getMonth() + 1).padStart(2, "0");
              let day = String(currentDate.getDate()).padStart(2, "0");
              endDateValue = `${year}-${month}-${day}`;
            } else {
              localStorage.setItem("mf-startDate", startDateValue);
              localStorage.setItem("mf-endDate", endDateValue);
            }
            if (!startDateValue && !endDateValue) {
              localStorage.setItem("mf-startDate", "");
              localStorage.setItem("mf-endDate", "");
              $("#mf-startDate").addClass("bg-color-warning");
              $("#mf-endDate").addClass("bg-color-warning");
              alert(getPluginText("Enter the start date and end date!", lang));
              return;
            }
            if (!startDateValue && endDateValue) {
              localStorage.setItem("mf-startDate", "");
              $("#mf-startDate").addClass("bg-color-warning");
              alert(getPluginText("Enter the start date!", lang));
              return;
            }
            if (startDateValue && !endDateValue) {
              localStorage.setItem("mf-endDate", "");
              $("#mf-endDate").addClass("bg-color-warning");
              alert(getPluginText("Enter the end date!", lang));
              return;
            }
            if (
              startDateValue &&
              endDateValue &&
              moment(startDateValue).diff(moment(endDateValue)) > 0
            ) {
              localStorage.setItem("mf-startDate", "");
              $("#mf-startDate").addClass("bg-color-warning");
              alert(getPluginText("Start date greater than end date!", lang));
              return;
            }
            // fix case reload trang web sau khi lấy dữ liệu công số sẽ mất startDate và endDate
            const apiUrl =
              timeSheetUrl +
              `/exportData.csv?start=${startDateValue}&end=${endDateValue}&allUsers=true&Apikey=${apiKey}`;
            modalDiv.show();
            let result = await proxyRequest(PLUGIN_ID, apiUrl, "GET", {}, {});
            console.log("timesheetdata", result);
            if (result.status.toString() === "401") {
              alert(getPluginText("Invalid token", lang));
            } else if (result.status.toString() === "403") {
              alert(
                getPluginText(
                  "Jira token does not have permission to access the resource",
                  lang
                )
              );
            } else {
              let response = convertCsvToArray(result.body);
              
              if (response.length === 0) {
                modalDiv.hide();
                return
              }

              // get all records
              let records = await getAllRecordsFromKintone(appId);
              // filter exist data
              const expectData = [];
              let map = new Map();
              for (let item of records) {
                let key = JSON.stringify({
                  projectName: item[`${config?.timesheetProject}`].value,
                  issueType: item[`${config?.timesheetIssueType}`].value,
                  key: item[`${config?.timesheetKey}`].value,
                  summary: item[`${config?.timesheetSummary}`].value,
                  priority: item[`${config?.timesheetPriority}`].value,
                  displayName: item[`${config?.timesheetDisplayName}`].value,
                  timeSpent:
                    item[`${config?.timesheetTimespent}`].value.toString(),
                  dateStarted: new Date(
                    `${item[`${config?.timesheetDateStarted}`].value}`
                  ).toISOString(),
                  workDescription:
                    item[`${config?.timesheetWorkDescription}`].value,
                });
                let count = map.get(key) || 0;
                map.set(key, count + 1);
              }
              for (let item of response) {
                if (!item.timeSpent) continue;
                let dateStarted = new Date(`${item.dateStarted}`);
                dateStarted.setSeconds(0);
                let key = JSON.stringify({
                  projectName: item.projectName,
                  issueType: item.issueType,
                  key: item.key,
                  summary: item.summary,
                  priority: item.priority,
                  displayName: item.displayName,
                  timeSpent: item.timeSpent.toString(),
                  dateStarted: dateStarted.toISOString(),
                  workDescription: item.workDescription,
                });
                if (!!map.get(key)) continue;
                expectData.push(item);
              }
              let tmpRecords = [];
              for (let item of expectData) {
                tmpRecords.push({
                  [`${config?.timesheetProject}`]: {
                    value: item?.projectName,
                  },
                  [`${config?.timesheetIssueType}`]: {
                    value: item?.issueType,
                  },
                  [`${config?.timesheetKey}`]: {
                    value: item?.key,
                  },
                  [`${config?.timesheetSummary}`]: {
                    value: item?.summary,
                  },
                  [`${config?.timesheetPriority}`]: {
                    value: item?.priority,
                  },
                  [`${config?.timesheetDateStarted}`]: {
                    value: new Date(`${item?.dateStarted}`).toISOString(),
                  },
                  [`${config?.timesheetDisplayName}`]: {
                    value: item?.displayName,
                  },
                  [`${config?.timesheetTimespent}`]: {
                    value: +item?.timeSpent,
                  },
                  [`${config?.timesheetWorkDescription}`]: {
                    value: item?.workDescription,
                  },
                });
                if (tmpRecords.length === 100) {
                  await addRecords({
                    app: appId,
                    records: tmpRecords,
                  });
                  tmpRecords = [];
                }
              }
              if (tmpRecords.length > 0) {
                await addRecords({
                  app: appId,
                  records: tmpRecords,
                });
              }
            }
          } catch (error) {
            alert(error);
          }

          modalDiv.hide();
          window.location.reload();
        }
      );
    }
  });
})(jQuery, kintone.$PLUGIN_ID);
