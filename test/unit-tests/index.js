
const {
    STATUS,
    StatusMonitor,
    Utils,
    HttpRequest
} = require('../../src/index');

const {HealthCheckMonitor} = require('healthcheck-monitor')
const chai = require('chai');
const { EventEmitter } = require('events');
const expect = chai.expect;
chai.use(require('chai-spies'));
const {MockedClassService} = require('unit-test-class');
const mockService = new MockedClassService(chai.spy);

describe('HealthCheckMonitor' , ()=>{
    const mockFactory = mockService.mock(StatusMonitor);
    describe('get HttpRequest',()=>{
        it('Should be HealtHttpRequesthCheckMonitor', ()=>{
            const statucCheck = mockFactory.test('HttpRequest').create().instance;
            expect(statucCheck.HttpRequest).eq(HttpRequest);
        });
    });
    describe('get HealthCheckMonitor',()=>{
        it('Should be HealthCheckMonitor', ()=>{
            const statucCheck = mockFactory.test('HealthCheckMonitor').create().instance;
            expect(statucCheck.HealthCheckMonitor).eq(HealthCheckMonitor);
        });
    });
    describe('get Utils',()=>{
        it('Should be Utils', ()=>{
            const statucCheck = mockFactory.test('Utils').create().instance;
            expect(statucCheck.Utils).eq(Utils);
        });
    });
    describe('get STATUS',()=>{
        it('Should be STATUS', ()=>{
            const statucCheck = mockFactory.test('STATUS').create().instance;
            expect(statucCheck.STATUS).eq(STATUS);
        });
    });
    describe('#getTestOptions',()=>{
        it('Should getTestOptions', ()=>{
            const statucCheck = mockFactory.test('getTestOptions').create().instance;
            const interval = 100;
            const timeout = 200;
            const startPeriod = 300;
            const retries = 1;
            const retryPauseTime =  1;
            const healthyAfter = 2;
            const unhealthyAfter = 3; 
            const httpMonitorAction = ()=>{};
            const testOptions = statucCheck.getTestOptions({
                interval,
                timeout ,
                startPeriod ,
                retries,
                retryPauseTime ,
                healthyAfter ,
                unhealthyAfter  
            } ,httpMonitorAction );
            expect(testOptions.interval).eq(interval);
            expect(testOptions.timeout).eq(timeout);
            expect(testOptions.startPeriod).eq(startPeriod);
            expect(testOptions.retries).eq(retries);
            expect(testOptions.retryPauseTime).eq(retryPauseTime);
            expect(testOptions.healthyAfter).eq(healthyAfter);
            expect(testOptions.unhealthyAfter).eq(unhealthyAfter);
            expect(testOptions.action).eq(httpMonitorAction);
        });
    });
    describe('#getHTTPMonitorOptions' , ()=>{
        it('Should return request' , ()=>{
            const request = 4;
            const mockStatusMonitor = mockFactory
                .test('getHTTPMonitorOptions');
            const statusCheck = mockStatusMonitor.create().instance;
            expect(statusCheck.getHTTPMonitorOptions({request}).httpRequestAction).eq(4)
        });
        it('Should return getHTTPMontiorAction' , ()=>{
            const mockStatusMonitor = mockFactory
                .test('getHTTPMonitorOptions')
                    .spies({
                        getHTTPMontiorAction : chai.spy(()=>1)
                    });
            const statusCheck = mockStatusMonitor.create().instance;
            expect(statusCheck.getHTTPMonitorOptions({}).httpRequestAction).eq(1)
        });
    });
    describe('getHTTPMontiorAction' , ()=>{
        let httpRequestSpy;
        let mockHealthCheckMonitor;
        let getNumberOrDefault;
        beforeEach(()=>{
            httpRequestSpy = chai.spy((a,b,cb)=>{

            })
            class HttpRequestDummy{
                request(){
                    return httpRequestSpy.apply(this,arguments)
                }
            }
            
            getNumberOrDefault = chai.spy(n=> n);
            mockHealthCheckMonitor = mockFactory
            .spies({
                get HttpRequest(){
                    return HttpRequestDummy
                },
                get Utils(){
                    return {
                        getNumberOrDefault
                    }
                }
            })
            .test(['getHTTPMontiorAction','STATUS' ]);
            
        })
        it('Should return a function' , ()=>{
            const statusMonitor = mockHealthCheckMonitor.create().instance;

            const result = statusMonitor.getHTTPMontiorAction({});
            expect(result).to.be.a('function');
        })
        it('Should get timeout' , ()=>{
            const statusMonitor = mockHealthCheckMonitor.create().instance;

            const cb = statusMonitor.getHTTPMontiorAction({
                timeout : 1500
            });
            cb();
            expect(getNumberOrDefault).to.have.been.called.with(1500)
        })
        it('Should make request' , ()=>{
            const statusMonitor = mockHealthCheckMonitor.create().instance;
            // httpRequestSpy = chai.spy((a,b,cb)=>{
                
            // })
            const options = {
                timeout : 1500
            };
            const cb = statusMonitor.getHTTPMontiorAction(options);
            cb();
            expect(httpRequestSpy).to.have.been.called.with(options , 1500);
        });
        it('Should respond healthy if status code is' , ()=>{
            const statusMonitor = mockHealthCheckMonitor.create().instance;
            const res = {
                statusCode : 200
            }
            httpRequestSpy = chai.spy((a,b,cb)=>{
                cb(null , res);
            })
            const options = {
                timeout : 1500
            };
            const onResponse = chai.spy();
            statusMonitor.STATUS;

            const cb = statusMonitor.getHTTPMontiorAction(options);
            cb({} , onResponse);

            expect(onResponse).to.have.been.called.with(STATUS.HEALTHY , res);
        })
        it('Should respond unhealthy if status code is' , ()=>{
            const statusMonitor = mockHealthCheckMonitor.create().instance;
            const res = {
                statusCode : 500
            }
            httpRequestSpy = chai.spy((a,b,cb)=>{
                cb(null , res);
            })
            const options = {
                timeout : 1500
            };
            const onResponse = chai.spy();
            statusMonitor.STATUS;

            const cb = statusMonitor.getHTTPMontiorAction(options);
            cb({} , onResponse);

            expect(onResponse).to.have.been.called.with(STATUS.UNHEALTHY , res);
        })
        it('Should respond unhealthy if request error' , ()=>{
            const statusMonitor = mockHealthCheckMonitor.create().instance;
            const error = new Error('');
            const res = {
                statusCode : 500
            }
            httpRequestSpy = chai.spy((a,b,cb)=>{
                cb(error );
            })
            const options = {
                timeout : 1500
            };
            const onResponse = chai.spy();
            statusMonitor.STATUS;

            const cb = statusMonitor.getHTTPMontiorAction(options);
            cb({} , onResponse);

            expect(onResponse).to.have.been.called.with(STATUS.UNHEALTHY , error);
        });
    });
    describe('#constructor', ()=>{
        it('Should call init',()=>{
            const options = {};
            mockHealthCheckMonitor = mockFactory
            .test(['constructor' ]);
            const healthCheckMonitor = mockHealthCheckMonitor.create(options).instance;

            expect(healthCheckMonitor.init).to.have.been.called.with(options)
        })
    });
    describe('#init', ()=>{
        let getTestOptions;
        let getHTTPMonitorOptions;
        let mockHealthCheckMonitor;
        beforeEach(()=>{
            class HealthCheckMonitorDummy extends EventEmitter{
              
            }
            
            getTestOptions = chai.spy(n=> n);
            getHTTPMonitorOptions = chai.spy(n=> n);

            mockHealthCheckMonitor = mockFactory
            .spies({
                get HealthCheckMonitor(){
                    return HealthCheckMonitorDummy
                },
                getHTTPMonitorOptions,
                getTestOptions 
            })
            .test(['init','STATUS'   , 'Utils']);
            
        });
        it('Should listen to statusMonitor events' , ()=>{
            const options = {
                timeout : 1500
            }
            const healthCheckMonitor = mockHealthCheckMonitor.create(options).instance;
            healthCheckMonitor.emit = chai.spy();
            
            healthCheckMonitor.init()

            healthCheckMonitor.statusMonitor.emit('statusChange' , 'vstatusChange')
            healthCheckMonitor.statusMonitor.emit('testResult' , 'vtestResult')

            expect(getTestOptions).to.have.been.called();
            expect(getHTTPMonitorOptions).to.have.been.called();
            expect(healthCheckMonitor.emit).to.have.been.called.with('statusChange' , 'vstatusChange');
            expect(healthCheckMonitor.emit).to.have.been.called.with('testResult' , 'vtestResult');
        });
    });
    describe('get status',()=>{
        it('Should get statusMonitor.status', ()=>{
            const statucCheck = mockFactory.test('status').create().instance;
            statucCheck.statusMonitor = {
                status : 'test'
            }
            expect(statucCheck.status).eq('test');
        });
    });
    describe('get isChanging',()=>{
        it('Should get statusMonitor.isChanging', ()=>{
            const statucCheck = mockFactory.test('isChanging').create().instance;
            statucCheck.statusMonitor = {
                isChanging : 'test'
            }
            expect(statucCheck.isChanging).eq('test');
        });
    });
    describe('get transitionStatus',()=>{
        it('Should get statusMonitor.transitionStatus', ()=>{
            const statucCheck = mockFactory.test('transitionStatus').create().instance;
            statucCheck.statusMonitor = {
                transitionStatus : 'test'
            }
            expect(statucCheck.transitionStatus).eq('test');
        });
    });
    describe('#start',()=>{
        it('Should call statusMonitor.#start', ()=>{
            const statucCheck = mockFactory.test('start').create().instance;
            statucCheck.statusMonitor = {
                start : chai.spy()
            }
            const cb = ()=>{};
            const result = statucCheck.start(cb);
            expect( statucCheck.statusMonitor.start).to.have.been.called.with(cb);
            expect(result).eq(statucCheck);
        });
    });
    describe('#pause',()=>{
        it('Should call statusMonitor.#pause', ()=>{
            const statucCheck = mockFactory.test('pause').create().instance;
            statucCheck.statusMonitor = {
                pause : chai.spy()
            }
            const result = statucCheck.pause();
            expect( statucCheck.statusMonitor.pause).to.have.been.called();
            expect(result).eq(statucCheck);
        });
    });
    describe('#resume',()=>{
        it('Should call statusMonitor.#resume', ()=>{
            const statucCheck = mockFactory.test('resume').create().instance;
            statucCheck.statusMonitor = {
                resume : chai.spy()
            }
            const cb = ()=>{};
            const result = statucCheck.resume(cb);
            expect( statucCheck.statusMonitor.resume).to.have.been.called.with(cb);
            expect(result).eq(statucCheck);
        });
    });
});

describe('Utils' , ()=>{
    describe('static #getNumberOrDefault' , ()=>{
        it('Should return number' , ()=>{
            expect(Utils.getNumberOrDefault(2 , 10)).eq(2)
        });
        it('Should return number is NAN' , ()=>{
            expect(Utils.getNumberOrDefault('d' , 2)).eq(2)
        });
    })
    describe('static #saflyGetObject' , ()=>{
        it('Should value' , ()=>{
            expect(Utils.saflyGetObject({'key':'value'} , 'key')).eq('value')
        });
        it('Should return empty obj instead' , ()=>{
            expect(Utils.saflyGetObject({'keydsad':'value'} , 'key')).be.an('object')
            expect(Utils.saflyGetObject({'keydsad':'value'} , 'key')).not.eq(undefined)
        });
    })
})