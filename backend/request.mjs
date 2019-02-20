import configure from 'request-promise-core/configure/request2';
import request from 'request';
import 'tough-cookie';

configure({
    request: request,
    PromiseImpl: Promise,
    expose: [
        'then',
        'catch',
        'promise'
    ]
});

export default request;
