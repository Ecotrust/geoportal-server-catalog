define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "dojo/topic",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/Tabs",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "../../gmd/dataQuality/ConformanceReport",
        "./ConformanceReport",
        "esri/dijit/metadata/types/iso/gmd/dataQuality/Lineage",
        "./Scope",
        "dojo/text!./templates/Quality.html"],
function(declare, lang, has, topic, Descriptor, Tabs, AbstractObject, ObjectReference, ConformanceReport, SrvConformanceReport, Lineage, Scope, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template,

    
    postCreate: function() {
      this.inherited(arguments)
      console.log('SRV conformance report')
      
      this.own(topic.subscribe("inspire/service-type-changed", lang.hitch(this, function(serviceType) {
        var isOther = serviceType==="other"
        this._forNetwork._isOptionallyOff = isOther
        this._forInvokable._isOptionallyOff = !isOther
        this._forNetwork.domNode.style.display = isOther? "none": "block"
        this._forInvokable.domNode.style.display = !isOther? "none": "block"
      })))
    }

  });

  return oThisClass;
});