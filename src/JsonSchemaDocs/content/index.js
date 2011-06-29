/*
configuration notes:


* id properties must be unique thoughout the index, including any dynamically generated content i.e. smd and schema, otherwise the tree's underlying store chokes.




*/

var jsdConfig = {

    staticContentBase: "content",
    header: "<span style=''>HEADER</span>",
    footer: "<span style=''>FOOTER</span>",
    defaultNode: 'Getting_Started.Overview',

    index: [{
        label: 'Getting Started',
        id: 'Getting_Started',
        children: [{
            label: 'Overview',
            id: 'Getting_Started.Overview',
            url: 'static/!test.htm'
        },
        {
            label: 'Embedded HTML content',
            id: 'Getting_Started.embedded',
            content: '<h1>EMBEDDED</h1>'
        }]
    },
    {
        label: 'Examples',
        id: 'Examples',
        children: [{
            label: 'Example 1',
            id: 'Examples.Example1',
            url: 'static/!test.htm'
        }]
    }],

    samples: {
        type: {
            ApiActiveStopLimitOrderDTO: {
                "Sample 1": "samples/types/ApiActiveStopLimitOrderDTO.htm"
            }
        },
        service: {
            CreateSession:
            {
                "Sample 1": "samples/services/CreateSession.htm",
                "Sample 2": "samples/services/CreateSession.htm"
            }
        }
    }
};



