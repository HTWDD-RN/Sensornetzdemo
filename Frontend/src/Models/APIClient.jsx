function url(path) {
    return this.baseUrl + path;
}

const Path = {
    allResources: "/",
    oneResource: function (id) { return "/" + id },
    setStatus: function (id, action) { return "/" + id + "/" + action },
    uploadImage: function () { return "/imageUpload" }
}

export default class APIClient {

    constructor(baseUrl, onItems) {
        this.baseUrl = 'http://' + baseUrl;
        this.socketUrl = 'ws://' + baseUrl;
        this.onItems = onItems;

        const ws = new WebSocket(this.socketUrl);
        ws.onmessage = e => {
            const items = JSON.parse(e.data) || [];
            this.onItems(items);
        }
        ws.onerror = e => {
            // an error occurred
            console.log('Websocket error: ', e.message);
        }
        ws.onclose = e => {
            // connection closed
            console.log('Websocket close event: ', e.code, e.reason);
        };
    }

    allResources() {
        const resolvedUrl = url.bind(this)(Path.allResources);
        return fetch(resolvedUrl)
            .then(res => res.json())
            .then(res => {
                this.onItems(res.response);
            });
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
            method: 'PUT',
            body: JSON.stringify({
                value: value
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json())
    }

    getImageUploadPath() {
        return this.baseUrl + Path.getImageUploadPath();
    }

}