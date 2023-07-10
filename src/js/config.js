jQuery.noConflict();

(async function ($, PLUGIN_ID) {
  "use strict";

  const CONSTANTS = {
    APP_ID: kintone.app.getId(),
    STRINGS: {
      SUBTABLE: "SUBTABLE",
      SINGLE_LINE_TEXT: "SINGLE_LINE_TEXT",
      DATETIME: "DATETIME",
      NUMBER: "NUMBER",
    },
    EXCLUDED_TYPES: [
      "STATUS_ASSIGNEE",
      "CATEGORY",
      "CREATOR",
      "CREATED_TIME",
      "STATUS",
      "MODIFIER",
      "UPDATED_TIME",
      "RECORD_NUMBER",
      "GROUP",
    ],
  };
  const config = kintone.plugin.app.getConfig(PLUGIN_ID);
  const appId = kintone.app.getId();
  const lang = config?.language ? config?.language : "en";
  let appData = await getAppData(appId);
  function initConfigLayout() {
    $(".plugin-text-field").each(function () {
      let text = $(this).text();
      $(this).text(getPluginText(text, lang));
    });
  }

  const fields = ignoreFieldNotUse(appData.properties);
  createDropdownList(fields);

  $("#token").val(config?.token);
  $("#plugin-language").val(config?.language ? config?.language : "en");
  $("#timesheetProject").val(config?.timesheetProject);
  $("#timesheetIssueType").val(config?.timesheetIssueType);
  $("#timesheetKey").val(config?.timesheetKey);
  $("#timesheetSummary").val(config?.timesheetSummary);
  $("#timesheetPriority").val(config?.timesheetPriority);
  $("#timesheetDateStarted").val(config?.timesheetDateStarted);
  $("#timesheetDisplayName").val(config?.timesheetDisplayName);
  $("#timesheetTimespent").val(config?.timesheetTimespent);
  $("#timesheetWorkDescription").val(config?.timesheetWorkDescription);

  initConfigLayout();

  let $form = $(".js-submit-settings");
  let $cancelButton = $(".js-cancel-button");
  let $showToken = $("#showToken");
  if (!($form.length > 0 && $cancelButton.length > 0)) {
    throw new Error("Required elements do not exist.");
  }

  $("#btnSave").on("click", function (e) {
    e.preventDefault();
    let token = $("#token").val();
    let timesheetProject = $("#timesheetProject").val();
    let timesheetIssueType = $("#timesheetIssueType").val();
    let timesheetKey = $("#timesheetKey").val();
    let timesheetSummary = $("#timesheetSummary").val();
    let timesheetPriority = $("#timesheetPriority").val();
    let timesheetDateStarted = $("#timesheetDateStarted").val();
    let timesheetDisplayName = $("#timesheetDisplayName").val();
    let timesheetTimespent = $("#timesheetTimespent").val();
    let timesheetWorkDescription = $("#timesheetWorkDescription").val();
    let language = $("#plugin-language").val();
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
      language,
    };
    console.log("config", config);
    kintone.plugin.app.setConfig(config, function () {
      alert(
        getPluginText(
          "The plug-in settings have been saved. Please update the app!",
          lang
        )
      );
      window.location.href = "../../flow?app=" + kintone.app.getId();
    });
  });
  $cancelButton.on("click", function () {
    window.location.href = "../../" + kintone.app.getId() + "/plugin/";
  });
  $showToken.change(function (e) {
    if (e.target.checked) {
      $("#token").prop("type", "text");
    } else {
      $("#token").prop("type", "password");
    }
  });

  function ignoreFieldNotUse(value) {
    const fields = {};

    for (const [type, field] of Object.entries(value)) {
      if (!CONSTANTS.EXCLUDED_TYPES.includes(field.type)) {
        if (
          CONSTANTS.STRINGS.SUBTABLE === field.type &&
          !isEmpty(field.fields)
        ) {
          for (const [typeChildren, fieldChildren] of Object.entries(
            field.fields
          )) {
            fields[typeChildren] = fieldChildren;
          }
        } else {
          fields[type] = field;
        }
      }
    }

    return fields;
  }

  function createDropdownList(value) {
    const mappedFields = Object.entries(value).reduce(
      (result, [key, value]) => {
        const { type } = value;

        if (!result[type]) {
          result[type] = {};
        }

        result[type][key] = value;

        return result;
      },
      {}
    );

    for (const [type, fields] of Object.entries(mappedFields)) {
      Object.entries(fields).map(([key, field]) => {
        if (field.type === CONSTANTS.STRINGS.SINGLE_LINE_TEXT) {
          $(
            "#timesheetProject, #timesheetIssueType, #timesheetKey, #timesheetSummary, #timesheetPriority, #timesheetDisplayName, #timesheetWorkDescription"
          ).append(
            $("<option>", {
              value: field.code,
              text: `${field.label} (${field.code})`,
            })
          );
        }

        if (field.type === CONSTANTS.STRINGS.DATETIME) {
          $("#timesheetDateStarted").append(
            $("<option>", {
              value: field.code,
              text: `${field.label} (${field.code})`,
            })
          );
        }

        if (field.type === CONSTANTS.STRINGS.NUMBER) {
          $("#timesheetTimespent").append(
            $("<option>", {
              value: field.code,
              text: `${field.label} (${field.code})`,
            })
          );
        }
      });
    }
  }
})(jQuery, kintone.$PLUGIN_ID);
