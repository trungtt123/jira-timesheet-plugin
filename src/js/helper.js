function convertCsvToArray(csvData) {
    const data = csvData?.trim()?.split('\n');
    let result = [];
    for (let index = 1; index < data.length - 1; index++) {
        let item = data[index];
        let o = {};
        let itemTmp = item.split(',');
        o.projectName = itemTmp[0]?.slice(1, -1);
        o.issueType = itemTmp[1];
        o.key = itemTmp[2];
        o.summary = itemTmp[3]?.slice(1, -1);
        o.priority = itemTmp[4]?.slice(1, -1);
        o.dateStarted = itemTmp[5];
        o.displayName = itemTmp[6]?.slice(1, -1);
        o.timeSpent = +itemTmp[7];
        o.workDescription = itemTmp[8]?.slice(1, -1);
        result.push(o);
    }
    return result;
}