import axios from 'axios';

export class ImagesApiService {
    constructor() {
        this.searchQuery = '';
        this.page = 1;
        this.totalPages = 0
        this.perPage = 40;
    }
    async getImages() {
        const BASE_URL = 'https://pixabay.com/api';
        const searchParams = new URLSearchParams({
            key: "30455130-0aca0478341a7e36a6d0ca3c2",
            image_type: "photo",
            orientation: "horizontal",
            safesearch: true,
            q: this.searchQuery,
            page: this.page,
            per_page: this.perPage
            
        })
        const url = `${BASE_URL}/?${searchParams}`;
        const {data} = await axios.get(url);
        this.incrementPage();
        return data;
    } 

    incrementPage() {
        this.page += 1;
    }
    resetPage() {
        this.page = 1;
    }
    get query() {
        return this.searchQuery;
    }
    set query(newQuery) {
        return this.searchQuery = newQuery;
    }
    calculateTotalPages(total) {
        this.totalPages = Math.ceil(total/this.perPage);
    }
    get isShowLoadMore() {
        return this.page <= this.totalPages;
    }
}