
dojo.declare("JsonSchemaDocs.SchemaExemplarGenerator", null, {
    initialize: function (jsd) {
        var exemplars = {};
        jsd.config.schemaExemplars = exemplars;
        var schema = jsd.config.schema;
        for (typeName in schema.properties) {
            if (schema.properties.hasOwnProperty(typeName)) {
                var type = schema.properties[typeName];
                exemplars[typeName] = this.createExemplar(type);

            }
        }

    },

    isDefined: function (item) {
        if (typeof (item) !== 'undefined') return true;
        return false;
    },

    isNotDefined: function (item) {
        if (typeof (item) === 'undefined') return true;
        return false;
    },
    generate_defaultDemoValue: function (property) {
        if (property.$ref) {
            // complex property type exemplar
            // TODO: here lay some possible recursion issues
            // debugger;
        } else {
            switch (property["type"]) {
                case "string":
                    return "a string value";
                case "boolean":
                    return true;
                case "integer":
                case "number":
                    return 1;
                case "array":
                    return [];
                case "null":
                    return "null";
                default:
                    //debugger;
                    throw { message: "unable to generate default demo value for unknown type: " + property["type"] };
                    break;
            }
        }

    },
    createArrayPropertyExemplar: function (property) {
        var exemplar = [];
        if (this.isDefined(property['items']) && this.isDefined(property.items['exemplar'])) {
            exemplar.push(prop2.items.exemplar);
        } else {
            exemplar.push(this.generate_defaultDemoValue(property));
        }
        return exemplar;
    },
    createExemplar: function (schema_type) {
        var exemplar = {};
        // is this an enum?
        if (schema_type["enum"]) {
            if (this.isNotDefined(schema_type['exemplar']) && this.isDefined(schema_type['demoValue'])) {
                exemplar = schema_type['demoValue'];
            }
        }
        else {

            // TODO: does this need to be recursive? I don't think so but lets see how/if david's array of complext type issues are resolved
            // take a second pass over the properties to build exemplar
            // this needs to be recursive but I think two levels will suffice for now


            for (var pname2 in schema_type.properties) {
                var prop2 = schema_type.properties[pname2];

                if (this.isDefined(prop2['exemplar'])) {
                    exemplar[pname2] = prop2.exemplar;
                } else if (this.isDefined(prop2['demoValue'])) {
                    exemplar[pname2] = dojox.html.entities.encode(String(prop2.demoValue));
                } else if (this.isDefined(prop2['type']) && prop2.type == "array") {
                    exemplar[pname2] = this.createArrayPropertyExemplar(prop2);
                } else {
                    exemplar[pname2] = this.generate_defaultDemoValue(prop2);
                }
            }
        }

        return exemplar;
    }
});
