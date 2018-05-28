declare module StatusMonitor{
    export enum TEST_STATE{
        INITIALIZING,
        STARTING,
        RUNINNG,
        PAUSED,
    }
    export enum STATUS{
        'STARTING'= 'STARTING',
        'UNKOWN'='UNKOWN',
        'HEALTHY'='HEALTHY',
        'UNHEALTHY'='UNHEALTHY'
    }
    export class TestRunInfo{
        constructor(
            triggeredBy : string,
            at : number,
            runNumber : number
        );
        triggeredBy : string;
        at : number;
        runNumber : number;
    }
    export class TestResult<T>{
        constructor(
            testRunInfo : TestRunInfo ,
            resut : T
        );
        triggeredBy : string;
        at : number;
        duration : number;
        retries : number;
        status : STATUS;
        data : T;
    }
    export type HealthcheckOnTestResult<T> = (testResult : TestResult<T>)=>void;
    export type HealthcheckOnResponse = (status:STATUS,data?:Error)=>void;
    export type HealthcheckAction = (testRunInfo : TestRunInfo , onResponse : HealthcheckOnResponse)=>void;
    export interface HealthcheckMonitorOptions{
        interval : ()=>number,
        timeout : ()=>number ,
        startPeriod : ()=>number,
        retries : ()=>number,
        retryPauseTime : ()=>number,
        healthyAfter : ()=>number,
        unhealthyAfter : ()=>number,
        request? : HealthcheckAction
    }
    export class StatusMonitor{
		constructor(options : HealthcheckMonitorOptions);
		start<T>(onStart? : HealthcheckOnTestResult<T>):void;
        pause():void;
        resume(onResume : ()=>void):void;
        on(eventName : string , cb:()=>void ):void;
        emit(eventName : string , value:any):void;
        removeEventListener(eventName : string , cb:()=>void):void;
        removeEventListeners(eventName : string)
    }

}