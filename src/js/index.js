import  List from './models/List';
import Search from './models/Search';
import Recipe from './models/Recipe';
import {elements, renderLoader, removeLoader} from './views/base';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';

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

elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // Decrease button is clicked
        if (state.recipe.serving > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } 
});
