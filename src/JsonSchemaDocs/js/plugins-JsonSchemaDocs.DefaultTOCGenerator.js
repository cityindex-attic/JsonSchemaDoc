

dojo.declare("JsonSchemaDocs.DefaultTOCGenerator", null, {
    constructor: function () {
    },
    buildObjectArray: function (obj, tag) {
        var array = [];
        for (name in obj) {
            if (obj.hasOwnProperty(name)) {
                if (tag) {
                    obj[name].__name = name; // tag it with property name
                }
                array.push(obj[name]);
            }
        }
        return array;
    },
    initialize: function (jsd) {
        var node = this.buildTocBrach(this.buildObjectArray(jsd.config.smd.services, "__name"), "service", "__name", "Services");
        jsd.config.index.push(node);
        node = this.buildTocBrach(this.buildObjectArray(jsd.config.schema.properties, "__name"), "type", "__name", "Types");
        jsd.config.index.push(node);
    },



    getKeysSorted: function (meta, property) {
        var objArr = {};
        var keyArr = [''];
        for (itemName in meta) {
            if (meta.hasOwnProperty(itemName)) {
                var item = meta[itemName];
                if (item[property] && !objArr[item[property]]) {
                    objArr[item[property]] = item[property];
                    keyArr.push(item[property]);
                }
            }
        }
        keyArr.sort();
        return keyArr;
    },

    buildTocBrach: function (items, metaType, itemKeyName, nodeName) {
        var self = this;
        var holder = {};

        function sortByStringProperty(a, b, property) {
            var nameA = String(a[property]).toLowerCase();
            var nameB = String(b[property]).toLowerCase();
            if (nameA < nameB) { return -1 }
            if (nameA > nameB) { return 1 }
            return 0;
        }

        function appendItems() {

            items.sort(function (a, b) {
                return sortByStringProperty(a, b, itemKeyName);
            });

            dojo.forEach(items, function (item) {

                holder[item.group || ""].children.push({
                    label: item[itemKeyName],
                    id: metaType + "." + item[itemKeyName],
                    contentType: metaType
                });
                delete item[itemKeyName];
            });
        }

        var node = { label: nodeName, id: metaType, children: [] };

        var groups = this.getKeysSorted(items, 'group');

        dojo.forEach(groups, function (group) {
            holder[group] = [];
            var branch;
            if (group) {
                branch = { label: group, id: metaType + "-" + group, children: [] };
                node.children.push(branch);
            } else {
                branch = node;
            }
            holder[group] = branch;
        });

        appendItems();

        return node;

    }
});
