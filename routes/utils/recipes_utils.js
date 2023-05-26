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

// function for create preview of recipe
// noy 
async function getRecipesPreview(recipes_id_array, user_id) {
    let promises = recipes_id_array.map(async (recipe_id) => {
        const recipe_information = await getRecipeInformation(recipe_id);
        const isFavorite = await checkIsFavorite(recipe_id, user_id);
        return {
            id: recipe_information.data.id,
            title: recipe_information.data.title,
            image: recipe_information.data.image,
            readyInMinutes: recipe_information.data.readyInMinutes,
            popularity: recipe_information.data.aggregateLikes,
            vegan: recipe_information.data.vegan,
            vegetarian: recipe_information.data.vegetarian,
            glutenFree: recipe_information.data.glutenFree,
            // seen
            favorite: isFavorite
        };
    });
    let ans = await Promise.all(promises);
    return ans;
}


/**
 * helper function to determine whether a recipe marked as favorite by user
 * params: recipe_id, user_id
 * return: boolean
 * noy
 */
async function checkIsFavorite(recipe_id, user_id) {
    let favorites = await DButils.execQuery(`select * from favoriterecipes where user_id = '${user_id}' and recipe_id = '${recipe_id}'`);
    return favorites.length > 0;
}


/**
 * return 3 random recips
 * noy
*/
async function getRandomThreeRecipes(user_id) {
    let random_pool = await getRandomRecipes();
    let filtered_random_pool = random_pool.data.recipes.filter((random) => (random.instructions != "") && (random.image && random.title));
    if (filtered_random_pool < 3) {
        return getRandomThreeRecipes(user_id);
    }
  //  const recipes_ids_lst = filtered_random_pool.data.slice(0,3).map(recipe => recipe.id);
    return getRecipesPreview([filtered_random_pool[0].id,filtered_random_pool[1].id,filtered_random_pool[2].id],user_id)
 //   return getRecipesPreview(recipes_ids_lst, user_id)
}

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
 * noy
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



exports.getRecipeDetails = getRecipeDetails;
exports.getRecipesPreview = getRecipesPreview;
exports.getRandomThreeRecipes = getRandomThreeRecipes;
exports.searchRecipes = searchRecipes;



