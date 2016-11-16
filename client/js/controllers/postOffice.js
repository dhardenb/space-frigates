// postOffice.js

PostOffice = function PostOffice()
{
    this.topics = {};
    this.subUid = -1;
}

PostOffice.prototype.subscribe = function(topic, func)
{
    if (!this.topics[topic])
    {
        this.topics[topic] = [];
    }

    var token = ( ++this.subUid ).toString();

    this.topics[topic].push(
    {
        token: token,
        func: func
    });

    return token;
}

PostOffice.prototype.publish = function(topic, args)
{
    if ( !this.topics[topic] )
    {
        return false;
    }

    var subscribers = this.topics[topic];
    var len = subscribers ? subscribers.length : 0;

    while (len--)
    {
        subscribers[len].func(args);
    }

    return this;
}
