const templateContent = document.getElementById('postTemplate').content;
const postsElement = document.querySelector('.posts');

const buildQuery = params => params ?
    Object.keys(params)
        .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
        .join('&') : '';

const httpGet = (url, params) => new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `${url}?${buildQuery(params)}`, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
        this.status === 200 ? resolve(this.response) : reject(new Error(`Error: ${this.status}`));
    };
    xhr.onerror = function() {
        reject(new Error("Network Error"));
    };
    xhr.send();
});

const loadPostImage = post => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = resolve.bind(null, post);
    img.onerror = reject.bind(null, new Error("Load image failure"));
    img.src = post.images.standard_resolution.url;
});

function createPostFromTemplate(post) {
    const user = post.user;
    const ne = templateContent.querySelector('.post').cloneNode(true);
    ne.querySelector('.user__ava').setAttribute('src', user.profile_picture);
    ne.querySelector('.user__name').innerText = user.username;
    ne.querySelector('.post__photo').setAttribute('src', post.images.standard_resolution.url);
    ne.querySelector('.post__likes_number').innerText = post.likes.count;
    if (post.location)
        ne.querySelector('.post__location').innerText = post.location.name;
    if (post.caption)
        ne.querySelector('.post__desc').innerText = post.caption.text;
    return ne;
}


// TODO: We need server to avoid 'no-access-control-allow-origin' header
// const url = 'https://api.instagram.com/v1/users/691623/media/recent';
// const params = {
//     access_token: '691623.1419b97.479e4603aff24de596b1bf18891729f3',
//     count: 20,
// };
// httpGet(url, params);
httpGet('instagram.json')
    .then(res => res.data)
    .then(posts => Promise.all(posts.map(loadPostImage)))
    .then(posts => posts.map(createPostFromTemplate))
    .then(elems => elems.map(
        elem => postsElement.insertBefore(elem, postsElement.firstElementChild)
    ))
    .catch(err => console.error(err));