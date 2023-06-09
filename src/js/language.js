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
    'You need to configure the 3 fieldcodes as start date, end date and timesheet data storage file to use MF kintone-plugin-Timesheeet.': {
        en: 'You need to configure the 3 fieldcodes as start date, end date and timesheet data storage file to use MF kintone-plugin-Timesheeet.',
        ja: `「MF kintone-plugin-Timesheet」のプラグインを利用するために、開始日、終了日、タイムシートのデータを保存するファイルの3つのフィールドコードを設定する必要があります。`
    },
    "The start date field must have the type DATE": {
        en: "The start date field must have the type DATE",
        ja: "「開始日」フィールドは日付型を選択しないといけない。"
    },
    "The end date field must have the type DATE": {
        en: "The end date field must have the type DATE",
        ja: "「終了日」フィールドは日付型を選択しないといけない。"
    },
    "The timesheet data storage file field must have the type FILE": {
        en: "The timesheet data storage file field must have the type FILE",
        ja: "「タイムシートのデータを保存するファイル」のフィールド型は「ファイル」型である。"
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
    'Timesheet data storage file': {
        en: 'Timesheet data storage file',
        ja: 'タイムシートのデータを保存するファイル'
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
    "If you haven't installed the start date, end date and timesheet data storage file fields on the form, please set them up here.": {
        en: "If you haven't installed the start date, end date and timesheet data storage file fields on the form, please set them up here.",
        ja: "開始日、終了日、タイムシートのデータを保存するファイルのフィールドをフォームにインストールしていない場合は、ここで設定してください。"
    },
    "If you have installed these 3 fields, start date, end date and timesheet data storage file in the form, please enter their field codes below.": {
        en: "If you have installed these 3 fields, start date, end date and timesheet data storage file in the form, please enter their field codes below.",
        ja: "開始日、終了日、タイムシートのデータを保存するファイルの3つのフィールドをフォームにインストールしている場合は以下にフィールドコードを入力してください。"
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


