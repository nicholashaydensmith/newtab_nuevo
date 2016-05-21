var loadedFavorites = [];
var background = chrome.extension.getBackgroundPage();
var NTInstance = background.NTInstance;
console.log(NTInstance);

$(document).ready(function() {
  chrome.runtime.sendMessage({task: "checkFirstRun"}, function(res) {
    if(res.firstRun)
      triggerModal($(".onboardingModal"));
  });
  loadSavedFavorites();
  loadPopularFavorites();
  chrome.storage.local.get(null, function(items){
    console.log(items);
  });
  $(".favorite").children().hide();
  // Refresh time every second
  var currentTime = new Date().toLocaleTimeString(navigator.language, { hour : '2-digit', minute: '2-digit'} );
  $('#time').html(currentTime);
  var currentDate = new Date().toDateString();
  $('#date').html(currentDate);
  setInterval(function(){
    currentTime = new Date().toLocaleTimeString(navigator.language, { hour : '2-digit', minute: '2-digit'} );
    $('#time').html(currentTime);
  }, 1000);

  /*
    Handlers for the top right main user actions menu
  */
  $(document).on("click", ".userAction", function(e) {
     e.preventDefault();
     var clickElement = $(this).attr('class');
     switch(clickElement) {
        case "addFavorite userAction":
          var modalToOpen = $(".addModal");
          triggerModal(modalToOpen);
          break

        case 'editMode userAction':
          e.preventDefault();
          triggerEditMode();
          break

        case 'openSettings userAction':
          e.preventDefault();
          var modalToOpen = $(".settingsModal");
          triggerModal(modalToOpen);
          break

        case 'openOnboarding userAction':
          e.preventDefault();
          var modalToOpen = $(".onboardingModal");
          triggerModal(modalToOpen);
          break

        case 'openCalendar userAction':
          e.preventDefault();
          var modalToOpen = $(".calendarModal");
          triggerModal(modalToOpen);
          break
     }
  });

  /*
    Handler for the suggested favorites in the Add New Favorite menu
  */
  $(document).on("click", ".popFav", function(e){
    e.preventDefault();
    var selection = $(this)[0];
    var urltoAdd = selection.dataset.url;
    var imgtoAdd = selection.dataset.imgurl;
    var newEntry = {
      "url" : urltoAdd,
      "imgUrl" : imgtoAdd
    };
    saveFavorite(newEntry);
  });

  $(document).on("click", ".closeBtn", function(e) {
    e.preventDefault();
    var modalToClose = $(this).parent();
    closeModal(modalToClose);

    if ($(this).parents('.onboardingModal').length) {
      var $arrowContainer = '\
        <div class="arrowContainer">\
          <p>^</p>\
          <p>You can also add favorites by clicking the + icon</p>\
        </div>\
        ';
      $(".addFavorite").append($arrowContainer);
    }
  });

  $(document).on("click", '.arrowContainer', function(e) {
    $(this).remove();
  })

  /*
    Handler for the add button on the Add a New Favorite menu
  */
  $(document).on("click", ".addBtn", function(e){
    e.preventDefault();
    var urlVal = $("#inputUrl").val();
    var imageVal = $("#inputImage").val();
    var newFavorites = [];
    var newEntry = {
      "url" : urlVal,
      "imgUrl" : imageVal
    };
    saveFavorite(newEntry);

    // var modalToClose = $(".addModal");
    // closeModal(modalToClose);

    if ($(".modal").length !== null) {
      closeModal($(".modal"));
    }
  });

  /*
    Handlers for edit mode options on each of the favorites
  */
  $(document).on("click", ".optDel", function(e) {
    e.preventDefault();
    var bookmark = $(this).parent();
    bookmark.remove();
    chrome.storage.local.get("popularFavorites", function(res){
      var loadedFavorites = [];
      loadedFavorites = res.popularFavorites.popular_favorites;
      console.log(loadedFavorites);
      var match = _.find(loadedFavorites, function(val) {
        console.log(this);
        console.log(val.url, this[0].href);
        return val.url === this[0].href;
      }.bind(this));

      console.log(match);
    }.bind(bookmark));
  });
  $(document).on("click", ".optEdit", function(e) {
    e.preventDefault();
    // Open Edit Modal
  });
  $(document).on("click", ".favorite", function(e) {
    if($(this).hasClass("editing"))
      e.preventDefault();
  });
});


// Load saved favorites onload
function loadSavedFavorites() {
  var savedItems = [];
  chrome.storage.local.get("savedFavorites", function(res) {
    if(typeof res.savedFavorites !== "undefined"){
    savedItems = res.savedFavorites;
    savedItems.forEach(function(item, index) {
      addFavorite(item.url, item.imgUrl);
    });
    }
  });
}

function loadPopularFavorites() {
  var popFavs = getPopularFavorites();
  popFavs.then(function(res) {
    var response = JSON.parse(res);
    createPopularFavs(response);
  });
}

function createPopularFavs(favorites) {
  // console.log(favorites);
  var list = favorites.popular_favorites;
  for(var i = 0; i < list.length; i++){
    var favHTML = "<a href='#' class='popFav' data-url=" + list[i].url + " data-imgurl=" + list[i].bgImg +">" + list[i].title + "</a>";
    $(".popularFavs").append(favHTML);
  }
  loadedFavorites = list;
}

// Prompt user for image to use for bookmark
// and also the url.  Append to favorites
function triggerModal(modal) {
  $('.lightbox').fadeIn();
  modal.fadeIn();
}

function closeModal(modal) {
  $('.lightbox').fadeOut();
  modal.fadeOut();
}
// Add a new favorite to the favorites grid
function addFavorite(url, imageUrl) {
  var newFavorite = document.createElement("A");
  newFavorite.href = url;
  newFavorite.style.backgroundImage = "url(" + imageUrl + ")";
  newFavorite.style.backgroundSize = "cover";
  newFavorite.style.backgroundPosition = "center center";
  newFavorite.style.backgroundRepeat = "no-repeat";
  newFavorite.classList.add("favorite");
  var optDel = document.createElement("I");
  optDel.classList.add("fa", "fa-trash-o", "fa-lg", "fa-fw", "optDel");
  var optEdit = document.createElement("I");
  optEdit.classList.add("fa", "fa-pencil", "fa-lg", "fa-fw", "optEdit");
  newFavorite.appendChild(optDel);
  newFavorite.appendChild(optEdit);
  $("#favorites").append(newFavorite);
  $(".favorite").children().hide();
}

// Save favorite to local storage
function saveFavorite(entry) {
  chrome.storage.local.get("savedFavorites", function (res) {
    var currentSaved = [];
    if(typeof res.savedFavorites !== "undefined"){
      currentSaved = res.savedFavorites;
    }
    currentSaved.push(entry);
    NTInstance.setSetting("savedFavorites" , currentSaved);
    // chrome.storage.local.set({"savedFavorites" : currentSaved });
    addFavorite(entry.url, entry.imgUrl);
    $("#inputUrl").val("");
    $("#inputImage").val("");
  });
}

// function saveChangesToFavorites() {
//   chrome.storage.local.get("savedFavorites", function (res) {
//     var currentSaved = [];
//     if(typeof res.savedFavorites !== "undefined"){
//       currentSaved = res.savedFavorites;
//     }
//     chrome.storage.local.set({"savedFavorites" : currentSaved });
//     addFavorite(entry.url, entry.imgUrl);
//     $("#inputUrl").val("");
//     $("#inputImage").val("");
//   });
// }


function getPopularFavorites() {
  return $.ajax({
    url: "./popularFavs.json",
    method: "GET"
  });
}
function getPromise(url) {
  return $.ajax({
    url: url,
    method: "GET"
  });
}
function triggerEditMode() {
  var favorites = $(".favorite");
  favorites.toggleClass("editing");
  favorites.children().toggle();
}
