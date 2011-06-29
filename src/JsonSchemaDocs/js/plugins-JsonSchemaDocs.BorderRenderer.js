dojo.declare("JsonSchemaDocs.BorderRenderer", null, {
    initialize: function (jsd) {
        dojox.html.set("header-text", jsd.config.header, {
            executeScripts: true,
            scriptHasHooks: false,
            renderStyles: true
        });

        dojox.html.set("footer-text", jsd.config.footer, {
            executeScripts: true,
            scriptHasHooks: false,
            renderStyles: true
        });
    }
});
