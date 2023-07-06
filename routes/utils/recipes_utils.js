const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
const DButils = require("./DButils");



/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
}



async function getRecipeDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        
    }
}


/**
 * function to present recipe's etxtended inforamtion
 * praram: recipe_id : recipes id to present
 *         user_id : cureernt user
 * return: preview of recipe
 */
async function presentRecipe(recipe_id,user_id) {
    const recipe_information = await getRecipeInformation(recipe_id);
    const isFavorite = await checkIsFavorite(recipe_id, user_id);
    const isSeen = await checkIsSeen(recipe_id, user_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree, servings, instructions, extendedIngredients } = recipe_information.data;

    return {
        id: recipe_information.data.id,
        title: recipe_information.data.title,
        image: recipe_information.data.image,
        readyInMinutes: recipe_information.data.readyInMinutes,
        popularity: recipe_information.data.aggregateLikes,
        vegan: recipe_information.data.vegan,
        vegetarian: recipe_information.data.vegetarian,
        glutenFree: recipe_information.data.glutenFree,
        seen: isSeen,
        favorite: isFavorite,
        servings: recipe_information.data.servings,
        instructions: recipe_information.data.instructions,
        extendedIngredients: recipe_information.data.extendedIngredients
    };
}

/**
 * function for create preview of recipe
* params: recipes_id_array - array of recipes id's to preview
          user_id - loggen in user's id
* return: preview of all recipes
 */
async function getRecipesPreview(recipes_id_array, user_id) {
    let promises = recipes_id_array.map(async (recipe_id) => {
        const recipe_information = await getRecipeInformation(recipe_id);
        const isFavorite = await checkIsFavorite(recipe_id, user_id);
        const isSeen = await checkIsSeen(recipe_id, user_id);
        return {
            id: recipe_information.data.id,
            title: recipe_information.data.title,
            image: recipe_information.data.image,
            readyInMinutes: recipe_information.data.readyInMinutes,
            popularity: recipe_information.data.aggregateLikes,
            vegan: recipe_information.data.vegan,
            vegetarian: recipe_information.data.vegetarian,
            glutenFree: recipe_information.data.glutenFree,
            seen: isSeen,
            favorite: isFavorite,
            instructions: recipe_information.data.instructions
        };
    });
    let ans = await Promise.all(promises);
    return ans;
}


/**
 * function for create preview of my recipe
* params: recipes_id_array - array of recipes id's to preview
          user_id - loggen in user's id
* return: preview of all recipes
 */
async function getMyRecipesPreview(recipes_id_array, user_id) {
    let promises = recipes_id_array.map(async (recipe_id) => {
        const recipe_information = await DButils.execQuery(`select * from userrecipes where user_id = '${user_id}' and recipe_id = '${recipe_id}'`);
        const isFavorite = true;
        const isSeen = true;
        const extract_details = recipe_information.map(recipe => ({
            title: recipe.title,
            id: recipe.recipe_id,
            readyInMinutes: recipe.readyInMinutes,
            image: recipe.image,
            popularity: recipe.popularity,
            vegan: recipe.vegan === 'true',
            vegetarian: recipe.vegetarian === 'true',
            glutenFree: recipe.glutenFree === 'true',
            seen: isSeen,
            favorite: isFavorite
          }));
          return extract_details;
    });
    let ans = await Promise.all(promises);
    return ans;
}


/**
 * function for create preview of my family recipe
* params: recipes_id_array - array of recipes id's to preview
          user_id - loggen in user's id
* return: preview of all recipes
 */
async function getFamilyRecipesPreview(recipes_id_array, user_id) {
    let promises = recipes_id_array.map(async (recipe_id) => {
        const recipe_information = await DButils.execQuery(`select * from userrecipes where user_id = '${user_id}' and recipe_id = '${recipe_id}'`);
        let ingredients = await DButils.execQuery(`select ingredient_name, amount, units from ingredients where recipe_id = '${recipe_id}'`);
        const extract_details = recipe_information.map(recipe => ({
            title: recipe.title,
            id: recipe.recipe_id,
            readyInMinutes: recipe.readyInMinutes,
            image: recipe.image,
            popularity : recipe.popularity,
            vegan: recipe.vegan === 'true',
            vegetarian: recipe.vegetarian === 'true',
            glutenFree: recipe.glutenFree === 'true',
            servings: recipe.servings,
            instructions: recipe.instructions,
            extendedIngredients: ingredients
          }));
          return extract_details;
    });
    let ans = await Promise.all(promises);
    return ans;
}


/**
 * helper function to determine whether a recipe marked as favorite by a user
 * params: recipe_id - recipe to determine isFavorite
 *         user_id - recipe is favorite by this user
 * return: boolean
 */
async function checkIsFavorite(recipe_id, user_id) {
    let favorites = await DButils.execQuery(`select recipe_id from favoriterecipes where user_id = '${user_id}' and recipe_id = '${recipe_id}'`);
    if(favorites.length > 0){
        return true;
    }
    else{
        return false;
    }
}


/**
 * helper function to determine whether a recipe marked as seen by a user
 * params: recipe_id - recipe to determine isSeen
 *         user_id - recipe seen by this user
 * return: boolean
 */
async function checkIsSeen(recipe_id, user_id) {
    let seen = await DButils.execQuery(`select * from seenrecipes where user_id = '${user_id}' and recipe_id = '${recipe_id}'`);
    return seen.length > 0;
}


/**
 * return 3 random recips
 * parames: user_id - loggen in user's id
*/
async function getRandomThreeRecipes(user_id) {
    let random_pool = await getRandomRecipes();
    let filtered_random_pool = random_pool.data.recipes.filter((random) => (random.instructions != "") && (random.image && random.title));
    if (filtered_random_pool < 3) {
        return getRandomThreeRecipes(user_id);
    }
    return getRecipesPreview([filtered_random_pool[0].id,filtered_random_pool[1].id,filtered_random_pool[2].id],user_id)
}

/**
 * helper function to return 3 ramdon recipes
 * this function creates the HTTP requset to spoonacular to retrieve random recipes
*/
async function getRandomRecipes() {
    const response = await axios.get(`${api_domain}/random`, {
        params: {
            number: 10,
            apiKey: process.env.spooncular_apiKey
        }
    });
    return response;
}

/**
 * search for a recipe
 * params: user_id - recipe is favorite by this user
 *         query - name of the dish / recipe
 *         search_params - params to filter search results such as diet, suisine
*/
async function searchRecipes(user_id, query, search_params) {
 const {cuisine, diet, intolerance, number} = search_params;
 const response = await axios.get(`${api_domain}/complexSearch`, {
    params: {
        number: number,
        apiKey: process.env.spooncular_apiKey,
        query: query,
        cuisine: cuisine,
        diet: diet,
        intolerance: intolerance
    }
});  
const recipes_ids_lst = response.data.results.map((recipe_info) => {
    let id;
    if (recipe_info.id) {
        id = recipe_info.id;
    }
    return id;
}) 
return getRecipesPreview(recipes_ids_lst, user_id);
}

async function getMyReviewRecipe(user_id, recipe_id){
    let my_recipe = await DButils.execQuery(`select * from userrecipes where user_id = '${user_id}' AND recipe_id = '${recipe_id}'`);
    if (my_recipe.length == 0)
        return {};
    let ingredients = await DButils.execQuery(`select ingredient_name, amount, units from ingredients where recipe_id = '${recipe_id}'`);
    return {
        title: my_recipe.title,
        id: my_recipe.recipe_id,
        readyInMinutes: my_recipe.readyInMinutes,
        image: my_recipe.image,
        popularity : my_recipe.popularity,
        vegan: my_recipe.vegan === 'true',
        vegetarian: my_recipe.vegetarian === 'true',
        glutenFree: my_recipe.glutenFree === 'true',
        servings: my_recipe.servings,
        instructions: my_recipe.instructions,
        extendedIngredients: ingredients
    }
}



exports.getFamilyRecipesPreview = getFamilyRecipesPreview;
exports.getMyRecipesPreview = getMyRecipesPreview
exports.presentRecipe = presentRecipe;
exports.checkIsSeen = checkIsSeen;
exports.checkIsFavorite = checkIsFavorite;
exports.getRecipeDetails = getRecipeDetails;
exports.getRecipesPreview = getRecipesPreview;
exports.getRandomThreeRecipes = getRandomThreeRecipes;
exports.searchRecipes = searchRecipes;
exports.getMyReviewRecipe = getMyReviewRecipe;



