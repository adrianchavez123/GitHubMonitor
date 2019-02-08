/**
  *
  * main() will be run when you invoke this action
  *
  * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
  
var request = require('request');
var openwhisk = require('openwhisk');

function main(params) {
    
    var response = {};
    var whisk = openwhisk();

    var apikey = "Push service APIKey";
    var appId = "Push service AppGUID";
    var apiHost = " Region" // Eg, for US South - imfpush.ng.bluemix.net
    
    if(params.issue) {
        response = {
        'title':params.issue.title,
        'kind':'issue',
        'state':params.issue.state,
        'number':params.issue.number,
        'url':params.issue.html_url,
        'userName':params.issue.user.login,
        'created_at':params.issue.created_at,
        'updated_at':params.issue.updated_at,
        'comments':params.issue.comments,
        'body':params.issue.body,
        'assignees':params.issue.assignees.length,
        'organization':params.organization.login,
        'organizationurl':params.organization.url
        };
    } else if (params.pull_request) {
        response = {
        'title':params.pull_request.title,
        'kind':'pullRequest',
        'state':params.pull_request.state,
        'number':params.pull_request.number,
        'url':params.pull_request._links.html.href,
        'userName':params.pull_request.user.login,
        'created_at':params.pull_request.created_at,
        'updated_at':params.pull_request.updated_at,
        'comments':params.pull_request.comments,
        'body':params.pull_request.body,
        'assignees':params.pull_request.assignees.length,
        'organization':params.organization.login,
        'organizationurl':params.organization.url
        };
    }
    
    var apnsPayload = JSON.stringify(response);
    console.log(apnsPayload);
    const name = 'push-notifications/send-message'
    const blocking = true, result = true
    const paramsJson = {
        appId:appId,
        apikey:apikey,
        messageText:"these are some words to reverse",
        apiHost:apiHost,
        apnsPayload:response,
        gcmPayload:response
    };
    
    return whisk.actions.invoke({name, blocking, result,params:paramsJson});	
}
