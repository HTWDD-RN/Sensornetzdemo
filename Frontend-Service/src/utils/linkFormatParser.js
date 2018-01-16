'use strict';

//TODO: parse according to https://www2.htw-dresden.de/~jvogt/forschungsseminar/Abschlussbericht_bohnet_baumgaertel.pdf page 22

const parseResource = function (item) {
    const data = {};
    const fields = item.split(";");
    for (var i = 0; i < fields.length; i++) {
        const keyValue = parseResourceField(fields[i]);
        data[keyValue[0]] = keyValue[1];
    }
    return data;
};

const parseResourceField = function (elem) {
    if (elem.startsWith("<")) {
        return ["url", parseUrl(elem)];
    } else {
        const keyValue = elem.split("=");
        if (keyValue.length == 1) {
            return [keyValue[0], true];
        } else if (keyValue.length > 1) {
            var val = keyValue[1];
            if (val.startsWith("\"")) {
                val = val.substring(1);
            }
            if (val[val.length - 1] == "\"") {
                val = val.substring(0, val.length - 1);
            }
            return [keyValue[0], val];
        }
    }
};

const parseUrl = function (urlField) {
  console.log(urlField);
    var url = urlField;
    if (url.startsWith("<")) {
        url = url.substring("1");
    }
    if (url[url.length - 1] == ">") {
        url = url.substring(0, url.length - 1);
    }
    console.log(url);
    return url;
}

exports.parse = function (data) {
  console.log(data);
    const response = [];
    const resources = data.split(",<");
    console.log(resources);
    for (var i = 0; i < resources.length; i++) {
        var item = resources[i];
        if (!item.startsWith("<")) {
            item = "<" + item;
        }
        response.push(parseResource(item));
    }
    return response;
}
