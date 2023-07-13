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
async function createCursor(body) {
    // auto get 500 records
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
async function getAllRecordsFromKintone(body) {
    try {
        // create cursor
        const cursor = await createCursor(body);
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

async function deleteRecordsByRecordIds(appId, recordIdsDelete) {
    for (let i = 0; i < recordIdsDelete.length; i += 100) {
        const batchIds = recordIdsDelete.slice(i, i + 100);
        
        await new Promise((resolve, reject) => {
            kintone.api(kintone.api.url('/k/v1/records', true), 'DELETE', { app: appId, ids: batchIds }, function (resp) {
                resolve(resp);
            }, function (error) {
                reject(error);
            });
        });
    }
}

async function insertRecords(appId, recordsInsert) {
    for (let i = 0; i < recordsInsert.length; i += 100) {
        const records = recordsInsert.slice(i, i + 100);

        await new Promise((resolve, reject) => {
            kintone.api(kintone.api.url('/k/v1/records', true), 'POST', { app: appId, records: records }, function (resp) {
                resolve(resp);
            }, function (error) {
                reject(error);
            });
        });
    }
}