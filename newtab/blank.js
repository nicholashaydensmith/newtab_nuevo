$(document).ready(function() {
  setInterval(function(e){
    currentTime = new Date().toLocaleTimeString(navigator.language, { hour : '2-digit', minute: '2-digit'} );
    $('#time').html(currentTime);
  }, 1000);
  var currentTime = new Date().toLocaleTimeString(navigator.language, { hour : '2-digit', minute: '2-digit'} );
  $('#time').html(currentTime);
  var currentDate = new Date().toDateString();
  $('#date').html(currentDate);
  $(".addFavorite").on("click", function(e){
    e.preventDefault();
    addFavorite();
  });

});


// Prompt user for Name
function firstRun() {

}

// Prompt user for image to use for bookmark
// and also the url.  Append to favorites
function addFavorite() {
  $('.lightbox').fadeIn();
  $('.addModal').fadeIn();

  // var newFavorite = "<a href='#'></a>";
  // $("#favorites").append(newFavorite);
}
