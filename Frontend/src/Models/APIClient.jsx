function url(path) {
    const result = this.baseUrl + path;
    console.log(result);
    return result;
}

const Path = {
    allResources: "/",
    oneResource: function (id) { return "/" + id },
    setStatus: function (id, action) { return "/" + id + "/" + action }
}

export default class APIClient {

    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    allResources() {
        const resolvedUrl = url.bind(this)(Path.allResources);
        return fetch(resolvedUrl)
                .then(res => res.json())
                .then(res => res.response);
    }

    oneResource(id) {
        const resolvedUrl = url.bind(this)(Path.oneResource(id));
        return fetch(resolvedUrl)
                .then(res => res.json())
                .then(res => res.response);
    }

    setStatus(id, action, value) {
        const resolvedUrl = url.bind(this)(Path.setStatus(id, action));
        return fetch(resolvedUrl, {
            method: 'POST',
            body: JSON.stringify({
                value: value
            })
        });
    }

}