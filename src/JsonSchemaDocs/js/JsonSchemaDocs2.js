/// <reference path="http://ajax.googleapis.com/ajax/libs/dojo/1.6/dojo/dojo.xd.js" />
/// <reference path="content/index.js" />

dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dijit.Tree");
dojo.require("dijit.layout.ContentPane");
dojo.require("dojox.layout.ContentPane");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dojox.html._base");
dojo.require("dojox.html.entities");
dojo.require("dojo.hash");


dojo.declare("JsonSchemaDocs", null, {});


dojo.declare("JsonSchemaDocs.Explorer", null, {

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

    sortObject: function (obj) {
        var self = this;
        var propNames = this.buildObjectArray(obj, "__name");
        function sortByStringProperty(a, b, property) {
            var nameA = String(a[property]).toLowerCase();
            var nameB = String(b[property]).toLowerCase();
            if (nameA < nameB) { return -1 }
            if (nameA > nameB) { return 1 }
            return 0;
        }

        propNames.sort(function (a, b) { return sortByStringProperty(a, b, "__name"); });
        var props = {};
        dojo.forEach(propNames, function (prop) {
            var propName = prop.__name;
            delete prop.__name;
            props[propName] = prop;

        });
        return props;
    },
    config: {},
    constructor: function (config) {
        var self = this;
        this.config = config;



        // TODO: once some more plugins are built and sequential dependencies are
        // better understood a more formal plugin registration is in order
        // e.g. enabling replacement of a plugin while maintaining it's ordinal initialization
        // 
        this.plugins.push(new JsonSchemaDocs.SchemaInhertanceResolver());
        this.plugins.push(new JsonSchemaDocs.SchemaExemplarGenerator());

        this.plugins.push(new JsonSchemaDocs.BorderRenderer());

        this.plugins.push(new JsonSchemaDocs.DefaultTOCGenerator());
        this.plugins.push(new JsonSchemaDocs.DefaultContentRenderer());
    },

    initialize: function () {
        var self = this;

        // TODO: allow adding plugins via config
        dojo.forEach(this.plugins, function (plugin) {
            plugin.initialize(self);
        });

        this.prepareTableOfContents();

        dojo.parser.parse();

        dojo.subscribe("/dojo/hashchange", {}, function (key) {
            self.navigate(key);
        });

        this.navigate(dojo.hash() || this.config.defaultNode);
    },
    navigate: function (key) {

        var self = this;
        this.store.fetchItemByIdentity({
            identity: key,
            onItem: function (item) {
                if (item) {
                    self.contentRenderer.renderContent(item);
                } else {
                    debugger;
                }

            }
        });
    },
    prepareTableOfContents: function () {

        this.store = new dojo.data.ItemFileReadStore({
            data: {
                identifier: 'id',
                label: 'label',
                items: this.config.index
            }
        });

        var treeModel = new dijit.tree.ForestStoreModel({
            store: this.store
        });

        var treeContainer = document.getElementById("table-of-contents");

        var treeControl = new dijit.Tree({
            model: treeModel,
            showRoot: false,
            onClick: function (item) { dojo.hash(item.id[0]); },
            _createTreeNode: function (args) {
                var tnode = new dijit._TreeNode(args);
                tnode.labelNode.innerHTML = args.label;

                return tnode;
            }
        },
                "table-of-contents");
    },
    store: {},
    plugins: [],
    pluginsIndex: {},
    contentRenderer: { renderContent: function (item) { alert("contentRenderer not implemented"); } },
    registerPlugin: function (plugin) { }
});















dojo.addOnLoad(function () {
    var explorer = new JsonSchemaDocs.Explorer(jsdConfig);
    explorer.initialize();
});








 