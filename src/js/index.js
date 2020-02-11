import Search from './models/Search';
import {elements, renderLoader, removeLoader} from './views/base';
import * as searchView from './views/searchView';

const state = {};

const controlSearch = async () => {
    const query = searchView.getInput();
    console.log(query);

    if(query) {
        state.search = new Search(query);

        searchView.clearResult();
        searchView.clearInput();
        renderLoader(elements.searchRes);

        await state.search.getResults();    

        console.log(state.search.result);

        removeLoader();
        searchView.renderRecipes(state.search.result)
        
    }

};

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
