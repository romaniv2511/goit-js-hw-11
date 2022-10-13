import './css/styles.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

import { ImagesApiService } from "./js/api-service";
import { createMarkup } from "./js/createMarkup";
import { refs } from "./js/refs";


let lightbox = {};

const imagesAPI = new ImagesApiService();



// Form submit

const onFormSubmit = async (e) => {
    e.preventDefault();
    imagesAPI.resetPage();
    refs.gallery.innerHTML = '';
    refs.btnMore.classList.add('is-hidden');
    const { elements: { searchQuery } } = e.currentTarget;

    if (!searchQuery.value) {
        Notify.info("You have not entered a query")
        return;
    }
    imagesAPI.query = searchQuery.value.trim().replace(/ /ig, '+');

    try {
        const { hits, totalHits } = await imagesAPI.getImages();
        if (!totalHits) {
            Notify.failure("Sorry, there are no images matching your search query. Please try again.")
            return;
        }
        const markup = createMarkup(hits);
        renderMarkup(markup);

        Notify.success(`Hooray! We found ${totalHits} images.`);

        const target = document.querySelector('.photo-card:last-child')
        io.observe(target);


        lightbox = new SimpleLightbox('.gallery a')

        imagesAPI.calculateTotalPages(totalHits);
        // if (imagesAPI.isShowLoadMore) {
        //     refs.btnMore.classList.remove('is-hidden');
        // }
        
    } catch (error) {
        onError(error)
    }
}
refs.form.addEventListener('submit', onFormSubmit)



// Button Load More

// const onLoadMoreClick = async () => {
//     const {hits} = await imagesAPI.getImages();
//     const markup = createMarkup(hits);
//     renderMarkup(markup);
//     lightbox.refresh();

//     getSmoothScrollAfterLoadMore();

//     if (!imagesAPI.isShowLoadMore) {
//         refs.btnMore.classList.add('is-hidden');
//         Notify.info("We're sorry, but you've reached the end of search results.")
//     }

// }
// refs.btnMore.addEventListener('click', onLoadMoreClick);



// Infinite scrolling

const options = {
    root: null,
    rootMargin: '100px',
    threshold: 1.0
}
const callback = async function(entries, observer) {
    entries.forEach(async entry => {
        if (entry.isIntersecting) {
            io.unobserve(entry.target);

            try {
                const {hits} = await imagesAPI.getImages();
                const markup = createMarkup(hits);
                renderMarkup(markup);
                
                lightbox.refresh();

                if (!imagesAPI.isShowLoadMore) {
                    Notify.info("We're sorry, but you've reached the end of search results.")
                    return;
                }
                const target = document.querySelector('.photo-card:last-child')
                io.observe(target);
            } catch (error) {
                onError(error)
            }

            
            
        }
    });
};
const io = new IntersectionObserver(callback, options);



function renderMarkup(markup) {
    refs.gallery.insertAdjacentHTML('beforeend', markup)
}

function onError (error) {
    console.log(error);
    Notify.failure(`${error.message}`);
}
function getSmoothScrollAfterLoadMore () {
    const { height: cardHeight } = document
        .querySelector(".gallery")
        .firstElementChild.getBoundingClientRect();

    window.scrollBy({
        top: cardHeight * 2,
        behavior: "smooth",
    });    
}

