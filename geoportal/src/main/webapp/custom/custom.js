(function() {
  // Custom initialization
})();

var populateCardDetails = function(descriptionElement) {
  var record_url = descriptionElement.parent().parent().children('.g-item-title').children('a').prop('href').split('/html')[0];
  var record_id = record_url.split('/')[record_url.split('/').length-1];
  var wrapper = descriptionElement.parent();
  var detailsWrapper = "\
    <div class='card-details-wrapper id='details-wrapper-" + record_id + "'>\
      <div class='card-details-left-wrapper' id='left-details-wrapper-" + record_id + "'>\
        <img src='/static/wagtailadmin/images/spinner.gif' class='bbox-spinner' id='bbox-left-image-" + record_id + "'/>\
      </div>\
      <div class='card-details-right-wrapper' id='right-details-wrapper-" + record_id + ">\
      </div>\
      <div class='card-details-footer id='details-footer-" + record_id + "'>\
      </div>\
    </div>\
  ";
  wrapper.append(detailsWrapper);

  $.ajax({
    url: record_url,
    success: function(data) {
      var extent = data._source.envelope_geo;
      if (data._source.hasOwnProperty('apiso_CRS')) {
        var in_wkid = parseInt(data._source.apiso_CRS.id_s.split(':').pop());
      } else {
        in_wkid = 4326;
      }
      var date_published = data._source.src_lastupdate_dt;  // TODO: Format Date
      var creator = data._source.contact_organizations_s[0];  // TODO: aggregate list (is it always a list?)
      var publisher = data._source.contact_organizations_s[0]; // TODO: how is this different from creator? It's often the same, but not for this record:
      // Title: TIME-SERIES DATA FOR SELF-EMPLOYED ECONOMIC ACTIVITY DEPENDENT ON THE OCEAN AND GREAT LAKES ECONOMY FOR COUNTIES, STATES, AND THE NATION BETWEEN 2005 AND 2014
      // -- default 3rd item here: https://portal.westcoastoceans.org/catalog/
      // -- live home: https://data.noaa.gov/dataset/dataset/time-series-data-for-self-employed-economic-activity-dependent-on-the-ocean-and-great-lake-20141
      var contact_person = data._source.contact_people_s[0]; // TODO: email isn't captured in contact info
      var constraints = data._source.apiso_OtherConstraints_s[0]; // TODO: Aggregate these if more than 1?
      // var constraints = data._source.apiso_ConditionApplyingToAccessAndUse_txt[0]; // TODO: is this better or different at all from OtherConstraints?
      var harvest_date = data._source.sys_modified_dt; // TODO: Format Date
      // var harvest_date = data._source.sys_xmlmeta_obj.date; // TODO: Format Date
      var harvest_source = data._source.src_source_name_s;
      var harvest_source_link = data._source.src_source_uri_s;
      if (harvest_source_link.indexOf(data._source.src_source_type_s + ":") == 0) {
        harvest_source_link = harvest_source_link.split(data._source.src_source_type_s + ":")[1];
      }

      wrapper.find('.card-details-right-wrapper').append("<dl id='card-details-" + record_id + "' class='card-details-list'></dl>");
      var left_details = $("#card-details-" + record_id);


      if (date_published.length > 0) {

        numeric_date = format_date(date_published, 'num');

        left_details.append('<dt>Date Published</dt>');
        left_details.append('<dd>' + numeric_date + '</dd>');
      }

      if (creator.length > 0) {
        left_details.append('<dt>Creator</dt>');
        left_details.append('<dd>' + creator + '</dd>');
      }

      if (publisher.length > 0) {
        left_details.append('<dt>Publisher</dt>');
        left_details.append('<dd>' + publisher + '</dd>');
      }

      if (contact_person.length > 0) {
        left_details.append('<dt>Contact</dt>');
        left_details.append('<dd>' + contact_person + '</dd>');
      }

      if (constraints.length > 0) {
        left_details.append('<dt>Constraints</dt>');
        left_details.append('<dd>' + constraints + '</dd>');
      }

      if (harvest_date.length > 0 && harvest_source.length > 0 && harvest_source_link.length > 0) {

        print_date = format_date(harvest_date, 'print');

        wrapper.append("<p class='card-footer'>Harvested " + print_date + " from <a href='" + harvest_source_link + "' target='_blank'>" + harvest_source + "</a></p>");
      }

      var xmin = extent[0].coordinates[0][0];
      var ymin = extent[0].coordinates[1][1];
      var xmax = extent[0].coordinates[1][0];
      var ymax = extent[0].coordinates[0][1];
      populateBboxImage(xmin, ymin, xmax, ymax, 200, 400, in_wkid, $('#bbox-left-image-' + record_id))

    },
    fail: function(error) {
      console.log(error);
    }
  })

}


format_date = function(datestring, format) {
  if (datestring.indexOf('-') < 0 && datestring.indexOf('T') < 0 && datestring.indexOf(':') < 0 && datestring.indexOf('Z') < 0) {
    // at present we only handle "YYYY-MM-DDTHH:mm:ssZ" strings
    return datestring;
  }
  var date_num = datestring.split('T')[0];
  if (format == "num") {
    return date_num;
  }
  else {
    var date_split = date_num.split('-');
    var year = date_split[0];
    var month = date_split[1];
    var day = date_split[2];
    switch(month) {
      case '01':
        month = "Jan";
        break;
      case '02':
        month = "Feb";
        break;
      case '03':
        month = "Mar";
        break;
      case '04':
        month = "Apr";
        break;
      case '05':
        month = "May";
        break;
      case '06':
        month = "Jun";
        break;
      case '07':
        month = "Jul";
        break;
      case '08':
        month = "Aug";
        break;
      case '09':
        month = "Sep";
        break;
      case '10':
        month = "Oct";
        break;
      case '11':
        month = "Nov";
        break;
      case '12':
        month = "Dec";
        break;
      default:
        break;
    };
    return month + " " + day + ", " + year;
  }
}

populateBboxImage = function(xmin, ymin, xmax, ymax, width, height, in_wkid, img_element){
  var in_wkid = 4326; // These should always be 4326, the wkid from the metadata only describes the layer's data.
  var out_wkid = 3857;
  var buffer = 0.2;
  var xbuf = (xmax-xmin)*buffer;
  var ybuf = (ymax-ymin)*buffer;
  var bbox_opacity = 0.35;
  var bbox_fill_color = [255, 165, 0, 160];
  var bbox_stroke_color = [255, 127, 0, 255];
  var bbox_stroke_width = 3;
  var basemap_url = "https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer";
  var webMapAsJSON = {
    mapOptions: {
      extent: {
        xmin: xmin-xbuf,
        ymin: ymin-ybuf,
        xmax: xmax+xbuf,
        ymax: ymax+ybuf,
        spatialReference:{
          wkid: in_wkid
        }
      },
      spatialReference: {
        wkid: out_wkid
      }
    },
    operationalLayers: [
      {
        opacity: bbox_opacity,
        featureCollection: {
          layers: [
            {
              layerDefinition:{
                name: "BBOXpolygon",
                geometryType: "esriGeometryEnvelope",
                drawingInfo: {
                  renderer: {
                    type: "simple",
                    symbol: {
                      type: "esriSFS",
                      style: "esriSFSSolid",
                      color: bbox_fill_color,
                      outline: {
                        type: "esriSLS",
                        style: "esriSLSSolid",
                        color: bbox_stroke_color,
                        width: bbox_stroke_width
                      }
                    }
                  }
                }
              },
              featureSet: {
                features: [
                  {
                    geometry: {
                      xmin: xmin,
                      ymin: ymin,
                      xmax: xmax,
                      ymax: ymax,
                      spatialReference: {
                        wkid: in_wkid
                      }
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    ],
    baseMap: {
      title: "Topographic Basemap",
      baseMapLayers: [
        {
          url: basemap_url
        }
      ]
    },
    exportOptions: {
      outputSize: [width, height]
    }
 }

  $.ajax({
    url: 'https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task/execute',
    type: "POST",
    dataType: 'json',
    data: {
      f: 'json',
      Format: "PNG32",
      Layout_Template: "MAP_ONLY",
      Web_Map_as_JSON: JSON.stringify(webMapAsJSON)
    },
    success: function(response) {
      if (typeof response == 'string') {
        response = JSON.parse(response);
      }
      if (response.hasOwnProperty('results') && response.results.length > 0) {
        img_element.removeClass('bbox-spinner');
        img_element.addClass('bbox-image');
        var img_url = response.results[0].value.url;
        img_element.attr('src', img_url);
      } else {
        err_msg = "<p>Error retrieving bbox image";
        if (response.hasOwnProperty('error') && response.error.hasOwnProperty('message')) {
          err_msg += ": " + response.error.message;
        }
        err_msg += "</p>";
        img_element.replaceWith(err_msg);
      }
    },
    error: function(error) {
      img_element.replaceWith("<p>Error retrieving bbox image</p>");
    }
  });
}

var toggleDescriptionExplode = function(descriptionElement) {
  if (!descriptionElement.parent().hasClass('wcoa-card-wrapper')) {
    descriptionElement.wrap('<div class="wcoa-card-wrapper"></div>');
    populateCardDetails(descriptionElement);
  }

  if (descriptionElement.parent().hasClass('explode')) {
    descriptionElement.parent().removeClass('explode');
  } else {
    $('.g-item-description').parent().removeClass('explode');
    setTimeout(function(){
      // prevent class from getting added before wrapper is rendered
      descriptionElement.parent().addClass('explode');
    }, 50);
  }
}

var titleClickEvent = function(){
  if ($(this).parents('.g-item-title').siblings('.g-item-description').length > 0) {
    var descriptionElement = $(this).parents('.g-item-title').siblings('.g-item-description');
  } else {
    var descriptionElement = $(this).parents('.g-item-title').siblings('.wcoa-card-wrapper').children('.g-item-description');
  }
  toggleDescriptionExplode(descriptionElement);
  // Prevent default link to open metadata in new tab
  return false;
}

var updateTitleClickEvents = function() {
  $('.g-item-title a').off("click");
  $('.g-item-title a').on("click", titleClickEvent);
}

var descriptionClickEvent = function() {
  toggleDescriptionExplode($(this));
}

var updateDescriptionClickEvents = function() {
  $('.g-item-description').off("click");
  $('.g-item-description').on("click", descriptionClickEvent);
}

var oneSecondRepeater = function() {
  updateDescriptionClickEvents();
  updateTitleClickEvents();

  setTimeout(oneSecondRepeater, 1000);
}

onCatalogLoad = function() {
  oneSecondRepeater();
}

$(document).ready(function() {
  setTimeout(function(){
    onCatalogLoad();
  },1200);
});
