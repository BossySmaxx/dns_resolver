const dgram = require("dgram");
const dnsPacket = require("dns-packet");

const server = dgram.createSocket("udp4");

const records = {
    'movies.local': '192.168.1.64', 
    'pi.local': '192.168.1.80', 
    'movies.com': '192.168.1.64', 
    'pi.my': '192.168.1.80', 
}

server.on("message", (msg, rinfo) => {
    let request = dnsPacket.decode(msg);
    if (request.type == 'query' && request.questions.length > 0) {
        let reqeustedDomainName = request.questions[0].name;
        console.log(`resolving ${reqeustedDomainName}`);
        if (records[reqeustedDomainName]) {
            let dnsResdponse = {
                id: request.id, 
                type: 'response', 
                flags: dnsPacket.RECURSION_DESIRED, 
                questions: request.questions, 
                answers: [
                    {
                        type: 'A', 
                        name: reqeustedDomainName, 
                        class: 'IN', 
                        ttl: 300, 
                        data: records[reqeustedDomainName]
                    }
                ]
            };

            server.send(dnsPacket.encode(dnsResdponse), rinfo.port, rinfo.address, (err, len) => {
                if (err) {
                    console.log("error occurred: ", err);
                }
                console.log("length: ". len);
            })
        }
    }
})

server.bind(53, () => {
    console.log("running on PORT:53");
})

/**
 *  const response = {
    id: query.id,
    type: 'response',
    flags: dnsPacket.RECURSION_DESIRED,
    questions: query.questions,
    answers: [
        {
            name: domain,
            type: 'A', // IPv4 Address
            class: 'IN',
            ttl: 300, // Time-to-live
            data: records[domain],
        },
    ],
};
 */

