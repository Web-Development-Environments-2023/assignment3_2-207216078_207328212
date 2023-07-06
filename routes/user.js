var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  console.log("ths req.session.user_id is:")
  console.log(req.session)
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT user_id FROM users").then((users) => {
      if (users.find((x) => x.user_id === req.session.user_id)) {
        req.user_id = req.session.user_id;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
});


/**
 * This path saves one recipe to the favorites list of the logged-in user
 * params: recipe_id in the body of the request
 */
router.post('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;
    let favorites = await recipe_utils.checkIsFavorite(recipe_id, user_id);
    if(favorites){
      res.status(200).send("The Recipe is already in the user's favorite");
    }
    else{
      await user_utils.markAsFavorite(user_id,recipe_id);
      res.status(200).send("The Recipe successfully saved as favorite");
    }
    } catch(error){
    next(error);
  }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    let favorite_recipes = {};
    const recipes_id = await user_utils.getFavoriteRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array, user_id);
    // let recipes = [
    //   {
    //         id: "716429",
    //         title: "pizassssssssssssssssssssssssza",
    //         readyInMinutes: "45",
    //         image: null,
    //         popularity: "50",
    //         vegan: true,
    //         vegetarian: false,
    //         glutenFree: true,
    //         seen: false,
    //         favorite: false
    //   },
    //   {
    //     id: "716429",
    //     title: "pizza124",
    //     readyInMinutes: "60",
    //     image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
    //     popularity: "50",
    //     vegan: true,
    //     vegetarian: true,
    //     glutenFree: false,
    //     seen: false,
    //     favorite: false
    //   },
    //   {
    //     id: "636768",
    //         title: "pizza12",
    //         readyInMinutes: "45",
    //         image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
    //         popularity: "50",
    //         vegan: true,
    //         vegetarian: true,
    //         glutenFree: true,
    //         seen: false,
    //         favorite: false
    //   },
    //   {
    //     id: "716429",
    //     title: "pizza124",
    //     readyInMinutes: "60",
    //     image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
    //     popularity: "50",
    //     vegan: true,
    //     vegetarian: true,
    //     glutenFree: false,
    //     seen: false,
    //     favorite: false
    //   },
    //   {
    //     id: "636768",
    //         title: "pizza12",
    //         readyInMinutes: "45",
    //         image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
    //         popularity: "50",
    //         vegan: true,
    //         vegetarian: true,
    //         glutenFree: true,
    //         seen: false,
    //         favorite: false
    //   }
    // ]
    res.status(200).send(results);
    // res.status(200).send(recipes);

  } catch(error){
    next(error); 
  }
});


/**
 * This path returns 3 last seen recipes by logged in user
 */
router.get("/seen", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipes = await user_utils.getLastThreeSeenRecipes(req.session.user_id);
    let recipes_id_array = [];
    recipes.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    if (recipes_id_array.length == 0){
      res.status(200).send({ message: "No recently viewed recipes found", success: true });
      return;
    }
    // let recipes = [
    //   {
    //         id: "716429",
    //         title: "pizassssssssssssssssssssssssza",
    //         readyInMinutes: "45",
    //         // image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
    //         image: null,
    //         popularity: "50",
    //         vegan: true,
    //         vegetarian: true,
    //         glutenFree: true,
    //         seen: false,
    //         favorite: false
    //   },
    //   {
    //     id: "716429",
    //     title: "pizza124",
    //     readyInMinutes: "60",
    //     image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
    //     popularity: "50",
    //     vegan: true,
    //     vegetarian: true,
    //     glutenFree: true,
    //     seen: false,
    //     favorite: false
    //   },
    //   {
    //     id: "636768",
    //         title: "pizza12",
    //         readyInMinutes: "45",
    //         image: "https://spoonacular.com/recipeImages/641799-556x370.jpg",
    //         popularity: "50",
    //         vegan: true,
    //         vegetarian: true,
    //         glutenFree: true,
    //         seen: false,
    //         favorite: false
    //   }
    // ]
    const results = await recipe_utils.getRecipesPreview(recipes_id_array, user_id);
    res.status(200).send(results);
      // res.status(200).send(recipes);

  } catch (error) {
    next(error);
  }
});


/**
 * This path saves one recipe to the seen list of the logged-in user
 * params: recipe_id in the body of the request
 */
router.post('/seen', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipe_id;
    await user_utils.markAsSeen(user_id,recipe_id);
    res.status(200).send("The Recipe successfully saved as seen");
    } catch(error){
    next(error);
  }
})

/**
 * This path add new recipe to current logged
 */
router.post('/createRecipe', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    let {title, image , popularity, readyInMinutes, vegan, vegetarian, glutenFree, servings, instructions, extendedIngredients} = req.body;
    if(title == null || readyInMinutes == null || vegan == null || image == null || popularity == null || vegetarian == null || glutenFree == null || servings == null || instructions == null || extendedIngredients == null){
      res.status(400).send({message: "One or more details are missing", success: false });
    }
    else{
      let num_of_rows = await DButils.execQuery(
        "select count(*) as count from userrecipes"
      );
      let new_recipe_id = num_of_rows[0].count + 1;
      // instructions = JSON.stringify(instructions);
      await user_utils.addUserRecipe(user_id, new_recipe_id, title, image, popularity, readyInMinutes, vegan, vegetarian, glutenFree, servings, instructions, '');
      extendedIngredients.map(async (ing) => {
        await DButils.execQuery(`insert into ingredients values ('${new_recipe_id}', '${ing.name}', '${ing.amount}', '${ing.units}')`);
    });
      res.status(200).send("The Recipe successfully saved");
    }
    } catch(error){
    next(error);
  }
})



/**
 * This path returns the user's recipes that were saved by the logged-in user
 */
router.get('/myRecipesPreview', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getMyRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getMyRecipesPreview(recipes_id_array, user_id);
    console.log(results)
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});



/**
 * This path returns the user's family recipes that were saved by the logged-in user
 */
router.get('/familyRecipes', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    let my_recipes = {};
    const recipes_id = await user_utils.getMyFamilyRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getFamilyRecipesPreview(recipes_id_array, user_id);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});





module.exports = router;
