(function() {
  // Custom initialization
})();

var toggleDescriptionExplode = function(descriptionElement) {
  if (descriptionElement.hasClass('explode')) {
    descriptionElement.removeClass('explode');
  } else {
    $('.g-item-description').removeClass('explode');
    descriptionElement.addClass('explode');
  }
}

var titleClickEvent = function(){
  var descriptionElement = $(this).parents('.g-item-title').siblings('.g-item-description');
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
