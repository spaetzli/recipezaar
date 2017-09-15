"use strict"

/*********************************************************
** Steven's App ID: d0290c17
** Steven's API Key: 14386697a455672f127e3873830e5133

** Jenny's App ID: 995ac0d6
** Jenny's API Key: bc77047020a87138cedf73cdd89063ad
/*********************************************************
*/

// GLOBALS
// Using Jenny's right now
var YUMMLY_APP_ID = "995ac0d6";
var YUMMLY_API_KEY = "bc77047020a87138cedf73cdd89063ad";
var YUMMLY_JSONP_URL = "http://api.yummly.com/v1/api/recipes?_app_id=995ac0d6&_app_key=bc77047020a87138cedf73cdd89063ad";
var numMaxResults = 40;		// the maximum # of results per "page"/load
var startPosition = 0;		// where in the list of the results the loading starts
var term;					// moving this here for global accessibility
var loadMore;				// used for endless scrolling

// READY/INIT FUNCTION
$( document ).ready(function()
{
	//Hides our little animated gif
	$("#ajax-loader").hide();
	
	// Hook up event for button that is grouped with searchterm text field
	$('#getbutton').on('click', function(event) {
		startPosition = 0;
		term = $('#searchterm').val();
		if (term.length >= 1){
			getRecipes(encodeURIComponent(term)); // replace space with %20
			document.querySelector("#content").innerHTML = ""; // clearing the first time the button is clicked
		}
	});
	
	// are we at th bottom of the page? then scroll.
	$(window).scroll(function(){
		if ($(window).scrollTop() == $(document).height()-$(window).height()) 
			if(loadMore) loadMore();
	});
	
}); // end READY

// STUFF
function getRecipes(term) 
{
	var url = YUMMLY_JSONP_URL;
	url += "&q=" + term + "&requirePictures=true&maxResult=" + numMaxResults + "&start=" + startPosition;
	
	$.ajax({
            url: url,
            dataType: 'jsonp',
            success: onJSONLoaded
    });
}

// Making another function for GET
function getGETData(url)
{
	$.ajax({
            url: url,
            dataType: 'jsonp',
            success: function(data) {
				displayLightbox(data);
			}
    });
}

// Loads the list of searched recipes
// Requires a JSONP object
function onJSONLoaded(obj) {
	// DEBUG AND TRACE
	//console.log("data=" + JSON.stringify(obj));	
	//console.log(obj);		
	
	// Grabbing/clearing the contentDiv
	var contentDiv = document.getElementById("content");
	
	for(var i = 0; i < obj.matches.length; i++)
	{	
		var recipe = obj.matches[i];
		
		// Attributes of each result
		var recipeName = recipe.recipeName;
		var recipeImage = recipe.imageUrlsBySize["90"];
		var recipeRating = recipe.rating;
		var recipeID = recipe.id; // Used to get the full info for that recipe - must be added to the end of the JSONP url
		
		// New <section> for each recipe of class="recipes"
		var newContent = document.createElement("section");
		newContent.setAttribute("class", "recipes");
		
		// Recipe information
		var info = "<img src='"+ recipeImage + "' height=110 id='" + recipeID + "' alt='' title='" + recipeName + "'>";
		info += "<span class='img-bottom'>" + recipeName + "</span>";
		
		// Easy fix for rating stars
		var ratingStars = "";
		for(var j = 0; j < 5; j++)
		{
			if(j < recipeRating)
				ratingStars += "<span class='fill-star'></span>";
			else
				ratingStars += "<span class='empty-star'></span>";
		}
		info += "<br><br>" + ratingStars;

		newContent.innerHTML = info; 
		
		contentDiv.appendChild(newContent);
		//$('#content').hide();
		$('#content').fadeIn();
		
		// This this function makes it so recipeID is locked to whatever value it was 
		// when the event listener within was created
		var scopeRecipeID = function(recipeID)
		{
			// Click event for image click to display Lightbox
			document.getElementById(recipeID).addEventListener("click", function(e)
			{
				getGETData("http://api.yummly.com/v1/api/recipe/" +  recipeID + "?_app_id=" + YUMMLY_APP_ID + "&_app_key=" + YUMMLY_API_KEY);
				$(".overlay").css("display", "block"); // modal view is now visible
				$("body").css("overflow", "hidden"); // locks background from scrolling when modal view is active
				console.log("Lightbox Appeared");
			});
		}(recipeID); // calling function in the same line it was declared
	}
	
	// Removes the previously existing button / does nothing if no button exists
	// This prevents stacking of multiple buttons
	//$('#moreResults').remove();
	
	loadMore = function()
	{
		// Offsetting where each new load starts from (sorry terrible explanation)
		startPosition += numMaxResults;
		
		getRecipes(encodeURIComponent(term));
	}
	/*
	// Adding a next button
	var nextButton = document.createElement("button");
	nextButton.setAttribute("id", "moreResults");
	nextButton.setAttribute("type", "button");
	nextButton.setAttribute("aria-labelledby", "nextbutton");
	nextButton.innerHTML = "See More Results";
	
	contentDiv.appendChild(nextButton);
	
	// What to do when the 'next' button is clicked
	$('#moreResults').on('click', function(event) {
		
		// Offsetting where each new load starts from (sorry terrible explanation)
		startPosition += numMaxResults;
		
		getRecipes(encodeURIComponent(term));
	});
	*/
}

// Makes a lightbox to display the recipe data
// Requires a JSONP object
function displayLightbox(data)
{
	console.log(data);
	
	var lightbox = document.createElement("div");
	lightbox.className = "lightbox";
	lightbox.setAttribute("role", "complementary");
	lightbox.setAttribute("aria-labelledby", "recipebox");
	var largePic = data.images[0]["hostedLargeUrl"];	// Picture associated with the recipe
	var sourceLink = data.source["sourceRecipeUrl"];	// Url name to the source
	var sourceSite = data.source["sourceDisplayName"];	// Link to the source site
	var rating = data.rating;							// Rating of the recipe
	var ingredients = data.ingredientLines;				// List of ingredients
	var totalTime = data.totalTime;
	var servingSize = data.yield;
	
	// Info that goes inside the lightbox
	// Create a div element and put all of the data in that div
	var dataDiv = document.createElement("div");
	dataDiv.setAttribute("role", "region");
	dataDiv.innerHTML = "<p aria-live='polite' class='recipeTitle'>" + data.name + "</p>";
	
	var ratingStars = "";
	for(var i = 0; i < 5; i++)
	{
		if(i < rating)
			ratingStars += "<span class='fill-star'></span>";
		else
			ratingStars += "<span class='empty-star'></span>";
	}
	dataDiv.innerHTML += "<p>" + ratingStars + "</p>";
	
	dataDiv.innerHTML += "<p><span class='recipe-link'> <a href='" + sourceLink + "'>" + sourceSite + "</a></span></p>";
	// Displays time to make the recipe
	if(totalTime != null)
		dataDiv.innerHTML += "<p><span class='recipe-time'> " + totalTime + "</span></p>";
	// Displays the serving size
	if(servingSize != null)
		dataDiv.innerHTML += "<p><span class='recipe-size'> " + servingSize + "</span></p>";
	dataDiv.innerHTML += "<img src='" + largePic + "' alt=''>";
	// Create a ul element for the ingredients to go into
	var ingredientList = document.createElement("ul");
	for(var j = 0; j < ingredients.length; j++) {
		// Add line breaks after each element in the list unless it's the last element in the list
		if(j == ingredients.length - 1)
			ingredientList.innerHTML += "<li>" + ingredients[j] + "</li>";
		else
			ingredientList.innerHTML += "<li>" + ingredients[j] + "</li><br>";
	}
	// Add ingredientList to dataDiv
	dataDiv.appendChild(ingredientList);
	// Add dataDiv to lightbox
	lightbox.appendChild(dataDiv);
	
	document.getElementById("content").appendChild(lightbox);
	
	// Click outside the box to close/enable scroll again
	$("body").on("click", function(event) {
	
		/* .off() removes onclick callback from the body.
		* this prevents the callback from getting triggered when the user
		* clicks on another img after closing the first lightbox, causing the 
		* bg to set to "display: none" right after it's set to visible
		*/
		$("body").off();
		$(".lightbox").css("display", "none");
		$(".overlay").css("display","none");
		$("body").css("overflow", "auto");
		document.getElementById("content").removeChild(lightbox);
	});
}