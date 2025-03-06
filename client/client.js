const handleResponse = async (res, parseRes, displayShort) => {
    const pageContent = document.querySelector('#content');
    const message = document.querySelector("#message");

    let contentType = res.headers.get('Content-type');
    const contentLength = res.headers.get("Content-Length");

    switch (res.status) {
        case 200:
            message.innerHTML = `<b>Success</b>`
            break;
        case 404:
            message.innerHTML = `<b>Not found</b>`
            break;
        case 201:
            message.innerHTML = `<b>Created</b>`
            break;
        case 204:
            message.innerHTML = `<b>Updated (No content)</b>`
            break;
        case 400:
            message.innerHTML = `<b>Bad Request</b>`;
            break;
    }

    // determine if response should be parsed
    const resText = await res.text();
    let resJson;
    if (resText) {
        resJson = JSON.parse(resText);
    } else {
        resJson = {};
    }
    console.log(resJson);
    pageContent.innerHTML = '';
    let string = '';
    if (parseRes) {
        // print shortened version of the json text
        // let jsonString = JSON.stringify(resJson);
        // pageContent.innerHTML += `<p>${jsonString.substring(0, 1000) + '...'}</p>`F
        try
       { resJson.forEach(i => {
            let card = `
            <div class="card cell infoCard" data-id="${i.id}">
            <section class="card-content">
            <div class="level">
                <div class="level-left">
                    <div class="level-item">
                        <a href="https://github.com/${i.full_name}" class="is-5 title has-text-link">${i.full_name.length > 20 ? i.full_name.substring(0, 20) + '...' : i.full_name}</a>
                    </div>
                </div>
                <div class="level-right">
                    <div class="level-item">
                    <p>${i.description.length > 40 ? i.description.substring(0, 40) + '...' : i.description}</p>
                    </div>
                </div>
            </div>
            </section>
            </div>
            `;
            if (!displayShort) {
                card = `
        <div class="card clickable cell is-multiline infoCard" data-id="${i.id}">
        <section class="card-content">
            <div class="level">
                <div class="level-left">
                    <div class="level-item">
                        <a href="https://github.com/${i.full_name}" class="is-5 title has-text-link">${i.full_name}</a>
                    </div>
                </div>
                <div class="level-right">
                    <div class="level-item">
                        <span class="tag is-info m-2">${i.language}</span>
                        <span class="tag is-dark m-2">${i.type}</span>
                    </div>
                </div>
            </div>
            <p class="is-6 subtitle has-text-grey">${i.username}</p>
            <div class="block">
                <span class="icon-text">
                    <span class="icon has-text-warning"><i class="fas fa-star"></i></span>
                    <span>${i.stars}</span>
                </span>
                <span class="icon-text">
                    <span class="icon has-text-primary"><i class="fa-solid fa-code-fork"></i></span>
                    <span>${i.forks}</span>
                </span>
            </div>
            <div class="block">
                ${i.description.length > 100 ? i.description.substring(0, 100) + '...' : i.description}
            </div>
        </section>
    </div>
`;
            }
            string += card;

            // add click logic
        })}
        catch(e){
            if (resJson.message) {
                message.innerHTML += `<p class="has-text-danger">${resJson.message}</p>`
            }
        }
        if (string === '' && res.status === 200) {
            message.innerHTML += `<p class="has-text-centered"><h1 class="is-size-3 has-text-danger mt-5">No Results</h1></p>`;
        }
        pageContent.innerHTML += string;
        document.querySelectorAll(".infoCard").forEach(card => {
            if (!displayShort && resJson) {
                card.onclick = () => {
                    const id = card.getAttribute("data-id");
                    const repo = resJson.find(i => i.id == id);
                    openModal(repo);

                }
            }
        })
    }
    else {
        message.innerHTML += `<p class="has-text-centered is-centered">Search Complete. (HEAD request does not return body)</p>`
    }
}

const openModal = (repo) => {
    let modal = document.querySelector("#cardModal");
    // show modal card
    modal.classList.add("is-active");
    // add title and user
    modal.querySelector('.modal-card-head').innerHTML =
        `<div class="level">
                <div class="level-left">
                    <div class="level-item">
                        <a href="https://github.com/${repo.full_name}" class="is-5 title has-text-link">${repo.full_name}</a>
                    </div>
                </div>
                <div class="level-right">
                    <div class="level-item">
                        <span class="tag is-info m-2">${repo.language}</span>
                        <span class="tag is-dark m-2">${repo.type}</span>
                        <button class="delete close-modal" aria-label="close"></button>
                    </div>
                </div>
            </div>
            <p class="has-text-grey">
            ${repo.username}
            </p>`
    modal.querySelector('.modal-card-head').innerHTML += `
            <div class="mt-3">
                <span class="icon-text">
                <span class="icon has-text-warning"><i class="fas fa-star"></i></span>
                <span>
                ${repo.stars}
                </span>
                </span>
                <span class="icon-text">
                <span class="icon has-text-primary"><i class="fa-solid fa-code-fork"></i></span>
                <span>
                ${repo.forks}
                </span>
            </div>
            `
    //add tags
    let tags = modal.querySelector("#modaltags");
    // add description
    modal.querySelector('.modal-card-body').innerHTML = `<div class="content">
                    <p class="title is-size-5">Description</p>
                    <p class="content has-text-gray">
                    ${repo.description}
                    </p>
                    </div>`
    let string = ''
    repo.topics.forEach(t => {
        string += `<span class="tag is-link m-2">${t}</span>`
    })
    string += `<span id="addTag" class="tag m-2 is-hoverable"><i class="fa-solid fa-plus mr-2"></i><p>Add</p></span>`
    tags.innerHTML = string;
    // add close fuction to button
    modal.querySelector(".close-modal").onclick = closeModal;
    // add function to add tag
    modal.querySelector("#addTag").onclick = (e) => {addTag(e,repo)};
}

const closeModal = () => {
    document.querySelector("#cardModal").classList.remove("is-active");
}

const addTag = (e,repo) => {
    let tags = document.querySelector("#modaltags");
    document.querySelector("#addTag").remove();
    let inputTag = `<form id="inputTag" class="tag m-2 is-hoverable" action="/addTopic" method="post"><i class="fa-solid fa-plus mr-2 addButton"></i></span>`;
    tags.innerHTML += inputTag;
    inputTag = document.querySelector("#inputTag");
    document.querySelector(".addButton").onclick = (e) => {
        inputTag.dispatchEvent(new Event("submit"));
        closeModal();
    };
    // create input field
    let input = document.createElement("input");
    input.className = "input is-small param";
    input.placeholder = "Enter tag...";
    input.name = "topic";
    input.style.width = "100px";
    input.style.border = "none";
    input.style.outline = "none";
    inputTag.appendChild(input);
    input.focus();
    let idField = document.createElement("input");
    idField.className = "param is-hidden";
    idField.type = "number";
    idField.name = "id";
    idField.value = repo.id;
    inputTag.appendChild(idField);
    setForm(inputTag);
}

const handleGet = async (userForm, params) => {
    let urlParams = new URLSearchParams({});
    Object.entries(params).forEach(([key, value]) => {
        urlParams.append(key, value);
    })
    const url = new URL(userForm.action);
    url.search = urlParams.toString();
    const method = userForm.querySelector('.methodSelect').value;
    const options = {
        method,
        headers: { 'Accept': 'application/json' }
    }
    try {
        let response = await fetch(url, options);
        handleResponse(response, method === 'get', url.pathname === '/getAllReposShort');
    }
    catch {
        console.log('oopsie there is an error...');
    }
}

const handlePost = async (userForm, params) => {
    let url = userForm.action;
    const options = {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json', // default to json
        },
        body: JSON.stringify(params),
    }

    if(userForm.contentType === 'form-urlencoded'){
        options.headers["Content-Type"] = 'application/x-www-form-urlencoded'
    }

    try {
        let response = await fetch(url, options);
        handleResponse(response, true);
    }
    catch (error) {
        console.log(error);
    }
}

const sendFetch = (userForm, params) => {
    if (userForm.method === 'post') {
        handlePost(userForm, params);
    }
    else {
        handleGet(userForm, params);
    }

}

const setForm = (form) => {
    form.onsubmit = (e) => {
        e.preventDefault();
        const fields = form.querySelectorAll(".param");
        // create a empty object to hold params
        const params = {};
        // loop through all the param fields, forming the params object
        fields.forEach(i => {
            //params.append(i.name, i.value);
            params[i.name] = i.value;
        });
        sendFetch(form, params);
        return false;
    }
}

// setup
const getAllReposForm = document.querySelector("#getAllRepos");
const getAllReposShort = document.querySelector("#getAllReposShort");

// setForm(document.querySelector("#getAllRepos"));
// setForm(document.querySelector("#getAllReposShort"));
// setForm(document.querySelector("#getRepo"));

const forms = document.querySelectorAll('form');
forms.forEach(f => {
    setForm(f);
})
