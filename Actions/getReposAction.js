/**
  *
  * main() will be run when you invoke this action
  *
  * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
  
module.paths.push('/usr/lib/node_modules');
const url = require('url');
const { promisify } = require('util');
const request = promisify(require('request'));
async function main(params) {
    
    let orgName = "Gypsyan";

    let apiHost = `https://api.github.com/orgs/${orgName}/repos`;

    let sendMessageResult;
    try {
        sendMessageResult = await (request({
        method: 'get',
        headers:{
            'user-agent': orgName
        },
        uri: apiHost
        }));
    } catch (err) {
        return Promise.reject({
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: { message: err },
        })
    }

    var resDic = [];
    
    try {   
        var tt = JSON.parse(sendMessageResult.body);
        for (var i = 0; i < tt.length; i++){
        let value =  tt[i];
        var dic = {
            'name':value.name,
            'url':value.html_url,
            'description':value.description ? value.description : 'No description available now',
            'open_issues':value.open_issues,
            'forks_count':value.forks_count,
            'watchers_count':value.watchers_count,
            'stargazers_count':value.stargazers_count
        };
        resDic.push(dic);
        };
    } catch (e) {
        return Promise.reject(new Error('error parsing send message result'));
    }
  return ({message:resDic});
}



