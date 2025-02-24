const handleResponse = async (res, parseRes) => {
    const pageContent = document.querySelector('#content');

    let contentType = res.headers.get('Content-type');
    const contentLength = res.headers.get("Content-Length");

    switch (res.status) {
        case 200:
            pageContent.innerHTML = `<b>Success</b>`
            break;
        case 404:
            pageContent.innerHTML = `<b>Not found</b>`
            break;
        case 201:
            pageContent.innerHTML = `<b>Created</b>`
            break;
        case 204:
            pageContent.innerHTML = `<b>Updated (No content)</b>`
            break;
        case 400:
            pageContent.innerHTML = `<b>Bad Request</b>`;
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
    pageContent.innerHTML += `<br/><b>Status Code: ${res.status}</b><br/>`;
    pageContent.innerHTML += `<b>Content-Length: ${contentLength}</b>`;
    if (parseRes) {
        // print shortened version of the json text
        let jsonString = JSON.stringify(resJson);
        pageContent.innerHTML += `<p>${jsonString.substring(0, 1000) + '...'}</p>`
    }
}

const handleGet = async (userForm, params) => {
    let urlParams = new URLSearchParams({});
    Object.entries(params).forEach(([key, value]) => {
        urlParams.append(key,value);
    })
    const url = new URL(userForm.action);
    url.search = urlParams.toString();
    const method = userForm.querySelector('.methodSelect').value;
    console.log(`method: ${method}`);
    const options = {
        method,
        headers: { 'Accept': 'application/json' }
    }
    try {
        let response = await fetch(url, options);
        handleResponse(response, method === 'get');
    }
    catch {
        console.log('oopsie there is an error...');
    }
}

const handlePost = async(userForm,params) => {
    let url = userForm.action;
    console.log('sending fetch')
    const options = {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(params),
    }

    try {
        let response = await fetch(url, options);
        handleResponse(response, true);
    }
    catch (error) {
        console.log(error);
    }
}

const sendFetch = (userForm,params) => {
    if(userForm.method === 'post'){
        handlePost(userForm,params);
    }
    else{
        handleGet(userForm,params);
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
