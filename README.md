# Status monitor

[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]

Monitor status of HTTP backends.

## Features
  * Retries for failled check
  * Timeout monitoring
  * Healthy after X checks
  * Unhealthy after Y checks
  * Pause between failled checks
  * Everything is super configurable - with resolved functions as options
  * Fully unit tested (*1)
  * TypeScript support

(*1) The only thing I didn't test is the outgoing http request. however, I any way recommend to overide it with 'request' module - as you will see in the examples.

##Simple to use
If you have any requests/issues please open an issue at Github.
This is the most basic usage
```js
    const {StatusMonitor , STATUS} = require('status-monitor');
const statusMonitor = new StatusMonitor({
            interval : 5000,
            timeout :   1500, 
            startPeriod :   0, 
            retries :  1, 
            retryPauseTime :  0,
            healthyAfter :  2, 
            unhealthyAfter :  1,
            requestOptions : {
                url : 'http://example.com/'
            }
    });
    statusMonitor.start();
    statusMonitor.on('statusChange' , ()=>{
        console.log(`Backend status changed to ${status}`)
    })

//Simple to start
statusMonitor.start();
```

## Use it with any request module
This module motivation is to handle the montiring of a backend server.
Therefore, it is recommended to use a standard module for http/s requests.
You can acctually replace it with TCP/UDP/IPC check or what ever....
```js
const request = require('request');
const statusMonitor = new StatusMonitor({
            interval : 5000,
            timeout :   1600, 
            startPeriod :   0, 
            retries :  1, 
            retryPauseTime :  0,
            healthyAfter :  2, 
            unhealthyAfter :  1,
            request : (testRunInfo , onResponse)=>{
                request({
                    url : 'http://example.com/',
                    timeout : 1500
                } , (error, response, body)=>{
                    if (body == 'OK' ){
                        onResponse(STATUS.HEALTHY)
                    }
                    else{
                        onResponse(STATUS.HEALTHY)
                    }
                })
            }
    });
    statusMonitor.start();
    statusMonitor.on('statusChange' , ()=>{
        console.log(`Backend status changed to ${status}`)
    })

```
## API
The following is a code example with full api usage
```js
    //All fields with defaults
    const statusMonitor = new StatusMonitor({
            interval : 5000, //MS, Interval between definitive results
            //BTW any field will be resovled if it's a function
            //It gives you total control on the values at any time
            //An example to a changin interval 1-3 seconds:
            // interval : ()=>{return (Math.floor(Math.random()*3) + 1)*1000},
            timeout :   5000, //MS, Time to wait till decided an action will be dicarded due to a timeout
            startPeriod :   0, //MS, Time to ater start() called
            retries :  1, //If service is unhealthy how many retry action to preform till definitive test result.
            retryPauseTime :  0,//MS, how much time to wait between each retry
            healthyAfter :  2, //How many consecutive healty action recorded before deciding the status is healty
            unhealthyAfter :  1,//How many consecutive unhealty action recorded before deciding the status is unhealty
            requestOptions : {
                url : "http://example.com/",
                headers : {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36'
                }
            }
            //Recomnded to use you own request logic
            request : (testRunInfo , onResponse)=>{
                //Just don't forget to call `onResponse`
                //if it's healthy
                onResponse(STATUS.HEALTHY );
                //if it's unhealthy
                onResponse(STATUS.UNHEALTHY ); 
            }
    });

//Simple to start
statusMonitor.start();
//You can wait for the first definitive status when starting
statusMonitor.start((testResult)=>{
    //You will also get that first status testResult

});
//You can pause the helthcheck at any time
statusMonitor.pause();
//After pausing you can simply resume
statusMonitor.resume();
//Or get notfied on the first definitive answer after resuming
statusMonitor.resume((testResult)=>{
    //You will also get that first status testResult

});
//You can even invok a manual test
statusMonitor.test((testResult)=>{
    //You will also get that first status testResult

});
//Listen to events
statusMonitor.on('statusChange' , (status)=>{
    //For any change of status after 
    //waiting `healthyAfter` or `unhealthyAfter`
    //will be called with the new status (enum STATUS)

});
statusMonitor.on('testResult' , (testResult)=>{
    //For every single check you will get an event with a `TestResult`

});

//You can also get information about the status at any time
statusMonitor.isChanging //true, if it's currently transitioning to a different status
statusMonitor.transitionStatus //enum STATUS, the status we are currently transitioning to.
```

## License

  [MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/status-monitor.svg
[npm-url]: https://npmjs.org/package/status-monitor
[travis-image]: https://img.shields.io/travis/hisco/status-monitor/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/hisco/status-monitor






