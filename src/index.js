const { EventEmitter } = require('events');
const url = require('url');
const {HealthCheckMonitor , STATUS , TestResult} = require('healthcheck-monitor');
const {HttpRequest , HttpHeadersOriginalCase} = require('./http');
const DEFAULT_HTTP_TIMEOUT = 5000;

class StatusMonitor extends EventEmitter{
    get HttpRequest(){
        return HttpRequest;
    }
    get HealthCheckMonitor(){
        return HealthCheckMonitor;
    }
    get Utils(){
        return Utils;
    }
    get STATUS(){
        return STATUS;
    }
    getTestOptions(options , httpMonitorAction){
        return {
            interval : options.interval,
            timeout : options.timeout ,
            startPeriod : options.startPeriod,
            retries : options.retries,
            action : httpMonitorAction,
            retryPauseTime :  options.retryPauseTime,
            healthyAfter : options.healthyAfter,
            unhealthyAfter : options.unhealthyAfter    
        }
    }
    getHTTPMonitorOptions(options){
        let httpRequestAction;
        if (options.request){
            httpRequestAction = options.request;
        }
        else{
            httpRequestAction = this.getHTTPMontiorAction(options);
        }
        return {
            httpRequestAction
        };
    }
    getHTTPMontiorAction(options){
        const Utils = this.Utils;
        const httpRequest = new (this.HttpRequest)();
        const STATUS = this.STATUS;
        return function httpMonitorAction(testRunInfo , onResponse){
            const timeout = Utils.getNumberOrDefault(options.timeout , DEFAULT_HTTP_TIMEOUT);
            httpRequest.request(options , timeout   , (error , res)=>{
                if (error)
                    onResponse(STATUS.UNHEALTHY ,  error);
                else if(res.statusCode >= 200 && res.statusCode <= 299)
                    onResponse(STATUS.HEALTHY , res );
                else
                    onResponse(STATUS.UNHEALTHY ,res);
            })
        }
    }
    constructor(options){
        super();
        this.init(options);
    }
    init(options){
        options = options||{};
        const httpOptions = this.Utils.saflyGetObject(options, "requestOptions");
        httpOptions.timeout = options.timeout =  options.timeout || DEFAULT_HTTP_TIMEOUT;
        
        const httpMonitorOptions = this.getHTTPMonitorOptions(httpOptions);

        this.statusMonitor = new (this.HealthCheckMonitor)(
            this.getTestOptions(options , httpMonitorOptions.httpRequestAction)
        );
        this.statusMonitor.on('testResult',(value)=> {
            this.emit('testResult' , value);
        })
        this.statusMonitor.on('statusChange',(value)=> {
            this.emit('statusChange' , value);
        })
    }
    get status(){
        return this.statusMonitor.status;
    }
    get isChanging(){
        return this.statusMonitor.isChanging;
    }
    get transitionStatus(){
        return this.statusMonitor.transitionStatus;
    }
    start(onStart){
        this.statusMonitor.start(onStart);
        return this;
    }
    pause(){
        this.statusMonitor.pause();
        return this;
    }
    resume(onResume){
        this.statusMonitor.resume(onResume);
        return this;
    }
}

class Utils{
    static getNumberOrDefault(value , defaultValue){
        if (isNaN(value))
            return defaultValue;
        else
            return value;
    }
    static saflyGetObject(obj , key){
        return obj[key] || {};
    }
   
}

module.exports = {
    StatusMonitor,
    TestResult,
    Utils,
    STATUS,
    HttpRequest,
    HttpHeadersOriginalCase
}