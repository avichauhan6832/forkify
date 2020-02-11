import  List from './models/List';
import Search from './models/Search';
import Recipe from './models/Recipe';
import Likes from './models/Likes';
import {elements, renderLoader, removeLoader} from './views/base';
import * as searchView from './views/searchView';
import * as listView from './views/listView';
import * as recipeView from './views/recipeView';
import * as likesView from './views/likeView';

const state = {};

const controlSearch = async () => {
    const query = searchView.getInput();
    console.log(query);

    if(query) {
        state.search = new Search(query);

        searchView.clearResult();
        searchView.clearInput();
        renderLoader(elements.searchRes);

        // await state.search.getResults();    

        // console.log(state.search.result);

        // removeLoader();
        // searchView.renderRecipes(state.search.result);

        try {
            await state.search.getResults();    

            console.log(state.search.result);
    
            removeLoader();
            searchView.renderRecipes(state.search.result);
        } catch(error) {
            alert("something went wrong");
            console.log(error);
            removeLoader();
        }
        
    }

};

const controlRecipe = async () => {
    const id = window.location.hash.replace('#','');
    console.log(id);
    
    if(id) {

        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        if(state.search) searchView.highlightSelected(id);

        state.recipe = new Recipe(id);

        // await state.recipe.getResults();
        // state.recipe.parseIngredients();
        // state.recipe.calcTime();
        // state.recipe.calcServing();

        // console.log(state.recipe);
        try {
            await state.recipe.getResults();
            state.recipe.parseIngredients();
            state.recipe.calcTime();
            state.recipe.calcServing();
            
            removeLoader();
            recipeView.renderRecipe(state.recipe); 
            console.log(state.recipe);
        } catch(error) {
            alert('something went wrong');
            console.log(error);
        }
        

    }
}


elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const  btn = e.target.closest('.btn-inline');
    if(btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResult();
        searchView.renderRecipes(state.search.result, goToPage);
    }
})

window.addEventListener('hashchange', controlRecipe);

['hashchange', 'load'].forEach(el => window.addEventListener(el, controlRecipe));

const controlList = () => {
    // Create a new list IF there in none yet
    if (!state.list) state.list = new List();

    // Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

// Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);

        // Delete from UI
        listView.deleteItem(id);

    // Handle the count update
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});

const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    // User has NOT yet liked current recipe
    if (!state.likes.isLiked(currentID)) {
        // Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        // Toggle the like button
        likesView.toggleLikeBtn(true);

        // Add like to UI list
        likesView.renderLike(newLike);

    // User HAS liked current recipe
    } else {
        // Remove like from the state
        state.likes.deleteLike(currentID);

        // Toggle the like button
        likesView.toggleLikeBtn(false);

        // Remove like from UI list
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// Restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();
    
    // Restore likes
    state.likes.readStorage();

    // Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // Render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});


// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // Decrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // Add ingredients to shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // Like controller
        controlLike();
    }
});
