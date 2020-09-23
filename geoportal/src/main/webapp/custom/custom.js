(function() {
  // Custom initialization
})();

var populateCardDetails = function(descriptionElement) {
  var wrapper = descriptionElement.parent();
  var detailsWrapper = "\
    <div class='card-details-wrapper'>\
      <div class='card-details-left-wrapper'>\
      </div>\
      <div class='card-details-right-wrapper'>\
      </div>\
      <div class='card-details-footer>'\
      </div>\
    </div>\
  ";
  wrapper.append(detailsWrapper);
  var record_url = descriptionElement.parent().parent().children('.g-item-title').children('a').prop('href').split('/html')[0];
  var record_id = record_url.split('/')[record_url.split('/').length-1];
  $.ajax({
    url: record_url,
    success: function(data) {
      var extent = data._source.envelope_geo;
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

      wrapper.find('.card-details-right-wrapper').append("<dl id='card-details-" + record_id + "'></dl>");
      var left_details = $("#card-details-" + record_id);

      if (date_published.length > 0) {
        left_details.append('<dt>Date Publsihed</dt>');
        left_details.append('<dd>' + date_published + '</dd>');
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
        wrapper.append("<p class='card-footer'>Harvested " + harvest_date + " from <a href='" + harvest_source_link + "' target='_blank'>" + harvest_source + "</a></p>");
      }

    },
    fail: function(error) {
      console.log(error);
    }
  })

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
