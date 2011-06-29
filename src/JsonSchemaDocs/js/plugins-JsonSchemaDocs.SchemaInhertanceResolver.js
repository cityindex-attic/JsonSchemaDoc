

dojo.declare("JsonSchemaDocs.SchemaInhertanceResolver", null, {
    type: "SchemaInhertanceResolver",
    name: "DefaultSchemaInhertanceResolver",
    jsonSchemaDocs: {},
    initialize: function (jsd) {
        // want a reference to explorer to use some library functions
        this.jsonSchemaDocs = jsd;
        this.resolveSchema(jsd.config.schema);
    },
    resolveSchemaType: function (schema, type) {
        // recursive
        if (type["extends"]) {
            var base = type["extends"].$ref;
            base = base.substring(2); // NOTE: references are only honored locally
            // get a copy
            var baseType = schema.properties[base];
            this.resolveSchemaType(schema, baseType);
            type.properties = dojo.mixin(dojo.clone(baseType.properties), type.properties);
        }

        type.properties = this.jsonSchemaDocs.sortObject(type.properties);
    },


    resolveSchema: function (schema) {
        // iterate properties and apply inheritance
        for (propName in schema.properties) {
            if (schema.properties.hasOwnProperty(propName)) {
                var type = schema.properties[propName];
                this.resolveSchemaType(schema, type);
            }
        }
    }


});