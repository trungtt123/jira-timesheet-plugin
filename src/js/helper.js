function convertJsonToHtmlTable(data) {
    try {
        let headerTabTxt = `<th></th>`;
        let bodyTabTxt = ``;
        let projects = [];
        for (let user of Object.keys(data)) {
            headerTabTxt += `<th><p style="text-align: center; padding-left: 5px; padding-right: 5px">${user}</p></th>`;
            for (let item of data[user]) {
                if (!projects.includes(item.projectName)) {
                    projects.push(item.projectName);
                }
            }
        }
        for (let projectName of projects) {
            let row = `<td>${projectName}</td>`;
            for (let user of Object.keys(data)) {
                let projectUser = data[user]?.find(o => o.projectName === projectName);
                if (projectUser) row += `<td><p style="text-align: center; font-weight: bold;">${projectUser.value}</p></td>`;
                else row += `<td><p style="text-align: center; font-weight: bold;">${0}</p></td>`;
            }
            bodyTabTxt += `<tr>${row}</tr>`;
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
        return tableHtmlText;
    }
    catch (e) {
        console.error(e);
    }
}
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
        let user = result.find(user => user.displayName === o.displayName);
        if (!user) {
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
            let projectIndex = user.projects.findIndex(project => project.projectName === o.projectName);
            if (projectIndex === -1) {
                user.projects.push({
                    projectName: o.projectName,
                    totalTimeSpent: o.timeSpent
                });
                user.totalTime += o.timeSpent;
            }
            else {
                user.projects[projectIndex].totalTimeSpent += o.timeSpent;
                user.totalTime += o.timeSpent;
            }
        }
    }
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
        }
        const percentRemain = 100 - currentPercentTmp;
        for (let projectIndex = 0; projectIndex < percentRemain; projectIndex++) {
            user.projects[projectIndex]['timePercent']++;
        }
        for (let project of user.projects) {
            expactedData[`${user.displayName}`].push({
                projectName: project.projectName,
                value: project.timePercent
            });
        }
    }
    return expactedData;
}
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
function isJSON(data) {
    try {
        JSON.parse(data);
        return true;
    } catch (error) {
        return false;
    }
}
