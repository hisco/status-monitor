
class HttpRequest{
    constructor(){
        this.urlParse = require('url').parse;
    }
    request(options , timeout , onResponse){
        const requestOptions = {
            timeout,
            requestData : options.requestData
        }
        if (options.url){
            const urlParsed = this.urlParse(options.url);
            let protocol = urlParsed.protocol || "http:";
            let port = urlParsed.port;
            options.protocol = protocol;
            if (protocol && !urlParsed.port){
                protocol =  urlParsed.protocol == "http:" || "https:";
            }
            if (!port){
                port = this.protocolToPort(protocol);
            }
            requestOptions.port = port;
            requestOptions.host = urlParsed.host;
            requestOptions.path = urlParsed.pathname || "/";
        }
        requestOptions.method = options.method ? options.method : "get";
        const httpModule = this.protocolToHttpModule(requestOptions.protocol);
        
        const req = httpModule.request(requestOptions, (res) => {
            res.setEncoding('utf8');
            res.on('data' , function dummy(){})
            res.on('end', () => {
                onResponse(null  , res );
            });
        });
        req.on('error' , (error)=>{
            onResponse(error , res );
        });
        if (requestOptions.requestData)
            req.write(requestOptions.requestData);
        req.end();
    }
    protocolToPort(protocol){
        if (protocol == 'https:')
            return 443;
        else return 80
    }
    get require(){
        return require;
    }
    protocolToHttpModule(protocol){
        if (protocol == "https:")
            return this.require('https');
        else
            return this.require('http');
    }
}


class HttpHeadersOriginalCase{
    constructor(headers){
        const headersSet = {};
        const sentHeaders = {};
        for (let key in headers){
            const lowered = key.toLowerCase();
            const alreadySet = headersSet[lowered];
            if (alreadySet){
                delete sentHeaders[alreadySet];
                delete alreadySet[lowered];
                sentHeaders[key] = headers[key];
            }
            else{
                sentHeaders[key] = headers[key];
                sentHeaders[lowered] = key; 
            }
        }
        for (let key in sentHeaders)
            sentHeaders[key] = new HttpHeaderName(sentHeaders[key]);

        return sentHeaders;
    }
}
class HttpHeaderName{
    constructor(key){
        this.key = key;
    }
    toLowerCase(){
        return this.key;
    }
}

module.exports = {
    HttpRequest,
    HttpHeadersOriginalCase,
    HttpHeaderName
}