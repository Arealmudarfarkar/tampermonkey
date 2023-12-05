// ==UserScript==
// @name         WorkOrder Info Change
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Trigger script based on URL hash change
// @author       YourName3
// @match        https://app.shopvox.com/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    function processUrlHash() {
        var hash = window.location.hash;

        // Inline array of URL types
        var urlTypes = ['quotes', 'work_orders', 'invoices'];

        urlTypes.forEach(function(type) {
            var pattern = new RegExp('pos/' + type + '/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', 'i');
            var match = pattern.exec(hash);
            if (match) {
                var guid = match[1];
                console.log("GUID extracted for " + type + ": " + guid);
                sendDataToAzure(guid, type); // Include the type in the function call
            }
        });
    }

    function sendDataToAzure(guid, type) {
        var azureUrl = "https://prod-25.australiasoutheast.logic.azure.com:443/workflows/...";

        GM_xmlhttpRequest({
            method: "POST",
            url: azureUrl,
            data: JSON.stringify({ guid: guid, type: type }), // Include 'type' in the JSON data
            headers: {
                "Content-Type": "application/json"
            },
            onload: function(response) {
                console.log("Response from Azure: " + response.responseText);
                displayAzureResponse(response.responseText);
            },
            onerror: function(error) {
                console.error("Error sending data to Azure: ", error.responseText);
            }
        });
    }
  function displayAzureResponse(jsonData) {
        try {
            var data = JSON.parse(jsonData);
            var customerData = data.customerData; // Extracting customerData from the response

            var responseDiv = document.createElement('div');
            responseDiv.className = 'row';
            responseDiv.innerHTML = '<div class="col-sm-12 detail">' +
                                    '<div class="title ng-binding">Additional Customer Data</div>' +
                                    '<div class="ng-scope simple-format">' + customerData + '</div>' +
                                    '</div>';

            var insertLocation = document.querySelector('.details.ng-scope');
            if (insertLocation) {
                var wrapperDiv = document.createElement('div');
                wrapperDiv.className = 'wrapper';
                wrapperDiv.appendChild(responseDiv);

                insertLocation.appendChild(wrapperDiv);
            } else {
                console.error('Could not find the insertion point for the customer data.');
            }
        } catch (e) {
            console.error('Error parsing JSON response: ', e);
        }
    }

 window.addEventListener('hashchange', processUrlHash, false);
    processUrlHash();
})();
