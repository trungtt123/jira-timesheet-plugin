async function updateRecord(body) {
    return new Promise((resolve, reject) => {
        kintone.api(kintone.api.url('/k/v1/record', true), 'PUT', body, function (resp) {
            // Xử lý thành công
            resolve(resp);
        }, function (error) {
            // Xử lý lỗi
            reject(error);
        });
    });
}
async function uploadFile(formData) {
    const domainKintone = window.location.hostname;
    let url = `https://${domainKintone}/k/v1/file.json`;
    try {
        let response = await fetch(url, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        if (response.ok) {
            return await response.json();
        } else {
            let errorData = await response.json();
            console.log(errorData);
            // Xử lý lỗi
        }
    } catch (error) {
        console.log(error);
        // Xử lý lỗi
    }
}
async function addRecord(body) {
    return new Promise((resolve, reject) => {
        kintone.api(kintone.api.url('/k/v1/record', true), 'POST', body, function (resp) {
            // success
            resolve(resp);
        }, function (error) {
            // error
            reject(error);
        });
    });
}
async function addRecords(body) {
    return new Promise((resolve, reject) => {
        kintone.api(kintone.api.url('/k/v1/records', true), 'POST', body, function (resp) {
            // success
            resolve(resp);
        }, function (error) {
            // error
            reject(error);
        });
    });
}
async function getRecord(appId, recordId) {
    return new Promise((resolve, reject) => {
        kintone.api(kintone.api.url('/k/v1/record', true) + `?app=${appId}&id=${recordId}`, 'GET', {}, function (resp) {
            resolve(resp);
        }, function (error) {
            reject(error);
        });
    });
}
async function getRecords(appId, size, offset) {
    return new Promise((resolve, reject) => {
        kintone.api(kintone.api.url('/k/v1/records', true), 'GET', { app: appId, query: `limit ${size} offset ${offset}` }, function (resp) {
            resolve(resp);
        }, function (error) {
            reject(error);
        });
    });
}
async function createCursor(appId, size = 500) {
    // auto get 500 records
    const body = {
        'app': appId,
        'size': size
    };
    return new Promise((resolve, reject) => {
        kintone.api(kintone.api.url('/k/v1/records/cursor', true), 'POST', body, function (resp) {
            // success
            resolve(resp);
        }, function (error) {
            // error
            reject(error);
        });
    });
}
function deleteCursor(cursorId) {
    return new Promise((resolve, reject) => {
      kintone.api(kintone.api.url('/k/v1/records/cursor', true), 'DELETE', { id: cursorId }, function(resp) {
        // success
        resolve(resp);
      }, function(error) {
        // error
        reject(error);
      });
    });
  }
async function getRecordByCursor(cursor) {
    var body = {
        'id': cursor.id
    };
    return new Promise((resolve, reject) => {
        kintone.api(kintone.api.url('/k/v1/records/cursor', true), 'GET', body, function (resp) {
            // success
            let records = resp.records;
            if (resp.next) {
                resolve(getRecordByCursor(cursor)
                    .then(nextRecords => records.concat(nextRecords)).catch(e => {
                        console.error(e);
                    }));
            }
            resolve(records);
        }, function (error) {
            // error
            reject(error);
        });
    })
}
async function getAllRecordsFromKintone(appId) {
    try {
        // create cursor
        const cursor = await createCursor(appId, 500);
        // fetch all data
        let allRecords = await getRecordByCursor(cursor);
        // delete cursor
        // await deleteCursor(cursor.id);
        return allRecords;
    }
    catch (e) {
        console.error(e);
    }
}

async function downloadAndReadKintoneFile(fileKey) {
    return new Promise((resolve, reject) => {
        const domainKintone = window.location.hostname;
        let url = `https://${domainKintone}/k/v1/file.json?fileKey=${fileKey}`;
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.responseType = 'blob';
        xhr.onload = function () {
            if (xhr.status === 200) {
                let blob = xhr.response;
                let reader = new FileReader();
                reader.onloadend = function () {
                    let fileData = reader.result;
                    resolve(fileData);
                };
                reader.onerror = function (error) {
                    reject(error);
                };
                reader.readAsText(blob);
            } else {
                reject(xhr.responseText);
            }
        };
        xhr.send();
    });
}
async function proxyRequest(PLUGIN_ID, apiUrl, method, body, headers) {
    return new Promise((resolve, reject) => {
        kintone.plugin.app.proxy(PLUGIN_ID, apiUrl, method, body, headers, function (respBody, respStatus, respHeaders) {
            resolve({ body: respBody, status: respStatus, headers: respHeaders });
        }, function (error) {
            reject(error);
        });
    });
}
async function getAppData(appId) {
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
async function deployApp(appId, body) {
    return new Promise(function (resolve, reject) {
        kintone.api(kintone.api.url('/k/v1/preview/app/form/fields', true), 'POST', body, function (resp) {
            console.log('resp', resp)
            let deployBody = {
                'apps': [
                    {
                        'app': appId,
                        'revision': resp.revision
                    }
                ]
            };
            kintone.api(kintone.api.url('/k/v1/preview/app/deploy', true), 'POST', deployBody, async function (resp) {
                // success
                resolve(resp);
            }, function (error) {
                // error
                console.log(error);
                reject(error);
            });
        }, function (error) {
            // error
            console.log(error);
            reject(error);
        });
    });
}
