
dojo.declare("JsonSchemaDocs.DefaultContentRenderer", null, {
    config: {},
    constructor: function () {
    },
    initialize: function (jsd) {
        this.config = jsd.config;
        jsd.contentRenderer = this;
        this.config.samples = this.config.samples || {};
        this.config.samples.type = this.config.samples.type || {};
        this.config.samples.service = this.config.samples.service || {};
    },
    prepareJsonForOutput: function (json) {
        // IE normalizes inserted html, thus killing our pre whitespace.
        // lets help it out a bit
        json = json.replace(/\n/g, "<br/>").replace(/\s/g, "&nbsp;");
        // this is a quick hack. really need to know the current newline char(s) as they differ wildly accross browsers/platforms

        return json;
    },
    createNavLink: function (key, text) {
        return dojo.create("A", { href: "#", onclick: "dojo.hash('" + key + "');return false;", "class": "json-link", innerHTML: text }).outerHTML;
    },
    createTypeInfoTable: function (property) {


        var typeRow = "";


        var constraintRows = "";

        if (property.$ref) {
            var key = "#type." + property.$ref.substring(property.$ref.lastIndexOf('.') + 1);

            // 
            var linkText = key.substring(key.lastIndexOf('.') + 1);
            if (property.type && property.type !== 'null' && property.type !== 'object') {

                linkText = linkText.concat(" (" + property.type + ")");

            }
            typeRow = this.createNavLink(key, linkText);

        } else if (property.references) {
            var key = "#type." + property.references.substring(property.references.lastIndexOf('.') + 1);

            var linkText = key.substring(key.lastIndexOf('.') + 1);
            if (property.type && property.type !== 'null' && property.type !== 'object') {
                linkText = linkText.concat(" (" + property.type + ")");

            }
            typeRow = this.createNavLink(key, linkText);

        } else if (property.type) {
            switch (property.type) {
                case "array":
                    var items = property.items;

                    //FIXME: using meta .references in DTO - why not in SMD parameters? am I just not processing them?

                    if (items.references) {
                        var refName = items.references.substring(items.references.lastIndexOf('.') + 1);
                        var key = "#type." + refName;
                        typeRow = this.createNavLink(key, refName) + "[]";
                    } // create type link
                    if (items['$ref']) {
                        var refName = items['$ref'].substring(items['$ref'].lastIndexOf('.') + 1);
                        var key = "#type." + refName;
                        typeRow = this.createNavLink(key, refName) + "[]";
                    } // create type link
                    else if (items.type) { typeRow = items.type + "[]"; }
                    else {
                        //debugger;
                        throw { message: "property type" };
                    }
                    break;
                default:
                    typeRow = property.type;
                    break;
            }
        } else {
            throw { message: "unexpected type description" };
        }

        var table = "<table class='property-descriptor'>";
        for (var key in property) {
            var value = property[key];
            switch (key) {
                // simple                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
                case "optional":
                case "minimum":
                case "maximum":
                case "minimumCanEqual":
                case "maximumCanEqual":
                case "minItems":
                case "maxItems":
                case "uniqueItems":
                case "pattern":
                case "maxLength":
                case "minLength":
                case "contentEncoding":
                case "divisibleBy":
                case "disallow":
                case "default":
                case "format":
                    constraintRows = constraintRows.concat("<tr><td>" + key + "</td><td>" + value + "</td></tr>");
                    break;
                // N/A for a type and constraint description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
                case "extends":
                case "options":
                case "requires":
                case "items": // already handled
                case "type": // already handled
                case "title":
                case "description":
                case "additionalProperties":
                case "properties":
                default:
                    break;

            }
        };

        table = table.concat(constraintRows).concat("</table>");

        var typeInfoHtml;
        if (constraintRows.length > 0) {
            typeInfoHtml = typeRow.concat("<br/>").concat(table);
        } else {
            typeInfoHtml = typeRow;
        }

        return typeInfoHtml;
    },


    renderContent: function (item) {


        if (item.url && item.url[0]) {
            var contenUrl = this.config.staticContentBase + "/" + item.url[0];
            dijit.byId("content-pane").attr("href", contenUrl)
        }
        else if (item.content) {
            dijit.byId("content-pane").attr("content", item.content[0])
        }
        else if (item.contentType) {
            this.renderDynamicContent(item, dijit.byId("content-pane"));
        }

    },
    renderDynamicContent: function (item, target) {
        switch (item.contentType[0]) {
            case "service":
                this.getServiceContent(item, target);
                break;
            case "type":
                this.getTypeContent(item, target);
                break;
            default:
                break;
        }
    },
    generateServiceContent: function (serviceName) {
        var pageTemplate = "\
    <h3>                                                                                     \n\
        Service: <span id='service-name'>~service-name~</span>                               \n\
    </h3>                                                                                    \n\
    <div id='service-description'>~service-description~                                      \n\
    </div>                                                                                   \n\
    <div id='prop-table-header'>                                                             \n\
        Service Info</div>                                                                   \n\
    <div id='service-properties' class='property-table'>~service-properties~                 \n\
    </div>                                                                                   \n\
    <div id='prop-table-header'>                                                             \n\
        Parameters</div>                                                                     \n\
    <div id='service-parameters' class='property-table'>~service-parameters~                 \n\
    </div>                                                                                   \n\
    <h3>                                                                                     \n\
        SMD                                                                                  \n\
    </h3>                                                                                    \n\
    <hr />                                                                                   \n\
    <pre id='service-definition' class='prettyprint lang-js;'>~service-definition~</pre>     \n\
";
        var service = this.config.smd.services[serviceName];

        pageTemplate = pageTemplate.replace("~service-name~", serviceName);
        pageTemplate = pageTemplate.replace("~service-description~", service.description);
        pageTemplate = pageTemplate + this.getSampleContent(serviceName, "service");



        var serviceInfoTable = "<table><thead>";

        function createServicePropertyRow(name, value) {
            if (value) {
                var serviceInfoRowTemplate = "<tr><td style='white-space: nowrap'>~name~</td><td>~value~</td></tr>";
                serviceInfoTable = serviceInfoTable.concat(serviceInfoRowTemplate
                    .replace("~name~", name)
                    .replace("~value~", value));
            }

        }

        var self = this;
        createServicePropertyRow("target", service.target);
        createServicePropertyRow("channel", service.channel);
        createServicePropertyRow("uriTemplate", service.uriTemplate);

        createServicePropertyRow("transport", service.transport);
        createServicePropertyRow("envelope", service.envelope);
        createServicePropertyRow("contentType", service.contentType || this.config.smd.contentType);


        var type = service.returns.$ref.substring(service.returns.$ref.lastIndexOf('.') + 1);
        createServicePropertyRow("returns", this.createNavLink("#type." + type, type));
        serviceInfoTable = serviceInfoTable.concat("</thead></table>");


        pageTemplate = pageTemplate.replace("~service-properties~", serviceInfoTable);


        var serviceParametersTable = "<table><thead><th>Type</th><th>Name</th><th>Description</th></thead>"


        function createServiceParameterRow(parameter) {
            var serviceParametersRowTemplate = "<tr><td style='white-space: nowrap'>~type~</td><td>~name~</td><td>~description~</td></tr>";
            var typeInfo = self.createTypeInfoTable(parameter);
            serviceParametersTable = serviceParametersTable.concat(serviceParametersRowTemplate
            .replace("~type~", typeInfo)
            .replace("~name~", parameter.name)
            .replace("~description~", parameter.description));

        };

        dojo.forEach(service.parameters, function (parameter) {
            createServiceParameterRow(parameter);
        });


        serviceParametersTable = serviceParametersTable.concat("</table>");
        pageTemplate = pageTemplate.replace("~service-parameters~", serviceParametersTable);

        var smd = this.getLinkedSchemaJson(service)
        pageTemplate = pageTemplate.replace("~service-definition~", smd);
        
        


        return pageTemplate;

    },
    getLinkedSchemaJson: function (schema) {

        var json = this.getSchemaJson(schema);
        var lastPos = 0;
        var text = json.replace(/#\.\w+/g, function (match, position, string) {
            var key = "#type" + match.substring(match.lastIndexOf('.'));
            var link = dojo.create("A", { href: "#", onclick: "dojo.hash('" + key + "');return false;", "class": "json-link", innerHTML: match });
            var linkHtml = link.outerHTML;
            return linkHtml;

        });
        return text;
    },
    getSchemaJson: function (schema) {
        // clean up the schema and eliminate our meta properties
        var json = JSON.stringify(schema, function replacer(key, value) {
            if (typeof key === 'string') {
                switch (key) {
                    case "demoValue":
                        break;
                    default:
                        if (key.substring(0, 1) !== "_")
                            return value;
                        break;
                }
            }
            else { return value; }

        }, "    ");
        return json;
    },
    getPreparedJSON: function (object) {
        var json = JSON.stringify(object, null, "    ");
        return this.prepareJsonForOutput(json);
    },
    prepareJsonForOutput: function (json) {
        // IE normalizes inserted html, thus killing our pre whitespace.
        // lets help it out a bit
        json = json.replace(/\n/g, "<br/>").replace(/\s/g, "&nbsp;");
        // this is a quick hack. really need to know the current newline char(s) as they differ wildly accross browsers/platforms

        return json;
    },
    generateTypeContent: function (typeName) {
        // TODO: move template into external file and use dojo.cache to load it 
        // so that user can customize

        var pageTemplate = '\n\
     <h3>                                                               \n\
        Type: <span id="type-name"></span>                              \n\
    ~type-name~</h3>                                                    \n\
    <div id="type-description">                                         \n\
    ~type-description~</div>                                            \n\
    <div id="prop-table-header">                                        \n\
        ~prop-table-header~</div>                                                \n\
    <div id="type-properties" class="property-table">                   \n\
    ~type-properties~</div>                                             \n\
    <h3>                                                                \n\
        JSON Schema                                                     \n\
    </h3>                                                               \n\
    <hr />                                                              \n\
    <pre id="code-sample-schema" class="prettyprint lang-js">~code-sample-schema~</pre>     \n\
    <p>                                                                 \n\
        &nbsp;</p>                                                      \n\
    <h3>                                                                \n\
        Exemplar                                                        \n\
    </h3>                                                               \n\
    <hr />                                                              \n\
    <pre id="code-sample-output" class="prettyprint lang-js">~code-sample-output~</pre>';



        var resolvedType = this.config.schema.properties[typeName];



        var baseTypeName = null;

        if (resolvedType["extends"]) {
            baseTypeName = resolvedType["extends"].substring(2);
        }

        pageTemplate = pageTemplate.replace("~code-sample-schema~", this.getLinkedSchemaJson(resolvedType));

        if (this.config.schemaExemplars && this.config.schemaExemplars[typeName]) {
            pageTemplate = pageTemplate.replace("~code-sample-output~", this.getPreparedJSON(this.config.schemaExemplars[typeName]));
        }



        pageTemplate = pageTemplate.replace("~type-name~", typeName + (baseTypeName != null ? " : " + baseTypeName : ""));



        if (resolvedType.description) {
            pageTemplate = pageTemplate.replace("~type-description~", resolvedType.description);
        }



        if (resolvedType["enum"] && resolvedType.options) {

            pageTemplate = pageTemplate.replace("~prop-table-header~", "Fields");

            var table = "<table><thead><th>Label</th><th>Value</th><th>Description</th></thead><tbody>";
            var rowTemplate = "<tr><td>~label~</td><td>~value~</td><td>~description~</td></tr>";

            for (var i = 0; i < resolvedType["enum"].length; i++) {

                var label = "";
                var description = "";
                if (resolvedType["options"]) {

                    for (var j = 0; j < resolvedType.options.length; j++) {
                        if (resolvedType.options[j].value == resolvedType["enum"][i]) {
                            label = resolvedType.options[j].label;
                            description = resolvedType.options[j].description;
                        }
                    }
                }

                table = table.concat(rowTemplate.replace("~value~", resolvedType["enum"][i]).replace("~description~", description).replace("~label~", label));
            }

            table = table.concat("</tbody></table>");
            pageTemplate = pageTemplate.replace("~type-properties~", table);



        }
        else {
            pageTemplate = pageTemplate.replace("~prop-table-header~", "Properties");

            var table = "<table><thead><th>Name</th><th>Type</th><th>Description</th></thead><tbody>";
            var rowTemplate = "<tr><td>~name~</td><td>~type~</td><td>~description~</td></tr>";
            for (var name in resolvedType.properties) {
                var thisRow = rowTemplate;
                var property = resolvedType.properties[name];
                var typeInfo = this.createTypeInfoTable(property);
                thisRow = thisRow.replace("~description~", (property.description || "MISSING DESCRIPTION"));
                thisRow = thisRow.replace("~name~", name || "MISSING NAME");
                thisRow = thisRow.replace("~type~", typeInfo || "MISSING TYPEINFORMATION");
                table = table.concat(thisRow);
            };

            table = table.concat("</tbody></table>");
            pageTemplate = pageTemplate.replace("~type-properties~", table);


        }

        pageTemplate = pageTemplate + this.getSampleContent(typeName, "type");

        return pageTemplate

    },
    getSampleContent: function (typeName, sampleType) {
        var samples = this.config.samples[sampleType][typeName];
        var sampleHtml = "";
        if (samples) {
            sampleHtml = sampleHtml + "<h3>Samples<h3><hr/>";

            for (sampleName in samples) {
                if (samples.hasOwnProperty(sampleName)) {
                    var title = "<h4>" + sampleName + "</h4>";
                    var sampleUri = samples[sampleName];
                    sampleHtml = sampleHtml + title;
                    var iframe = "<iframe src='" + (this.config.staticContentBase ? (this.config.staticContentBase + "/" + sampleUri) : (sampleUri)) + "' class='sample-frame'/></iframe>";
                    sampleHtml = sampleHtml + iframe;
                }
            }

        }

        return sampleHtml;
    },
    getServiceContent: function (item, target) {
        var memberName = item.id[0].substring(8);
        item.generatedContent = item.generatedContent || this.generateServiceContent(memberName);
        target.attr("content", item.generatedContent);
    },
    getTypeContent: function (item, target) {
        var memberName = item.id[0].substring(5);
        item.generatedContent = item.generatedContent || this.generateTypeContent(memberName);
        target.attr("content", item.generatedContent);
    }
});

