(function() {
  // Custom initialization
})();

var descriptionClickEvent = function() {
  if ($(this).hasClass('explode')) {
    $(this).removeClass('explode');
  } else {
    $(this).addClass('explode');
  }
}

var updateDescriptionClickEvents = function() {
  $('.g-item-description').off("click");
  $('.g-item-description').on("click", descriptionClickEvent);
}

var oneSecondRepeater = function() {
  updateDescriptionClickEvents();

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
