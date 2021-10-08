export const bim = element => {
    var Module = { canvas: element };
    Module.locateFile = function (path, scriptDir) {
        return window.top.location.origin + "/file/" + path;
    };
    function download(path) {
        return new Promise(function (resolve, reject) {
            var newUrl = "";
            if (Module.locateFile) {
                newUrl = Module.locateFile(path, "");
                console.log("newUrl", newUrl);
            }
            var xhr = new XMLHttpRequest();
            xhr.open("GET", newUrl, true);
            xhr.responseType = "arraybuffer";
            xhr.onload = function () { resolve(xhr.response); };
            xhr.onerror = function (e) { reject(e); };
            xhr.send(null);
        });
    }
    function addScriptToDom(scriptCode) {
        return new Promise(function (resolve, reject) {
            var script = document.createElement("script");
            var blob = new Blob([scriptCode], { type: "application/javascript" });
            var objectUrl = URL.createObjectURL(blob);
            script.src = objectUrl;
            script.onload = function () {
                console.log("added js script to dom");
                script.onload = script.onerror = null; // Remove these onload and onerror handlers, because these capture the inputs to the Promise and the input function, which would leak a lot of memory!        
                Module["mainScriptUrlOrBlob"] = blob;
                URL.revokeObjectURL(objectUrl); // Free up the blob. Note that for debugging purposes, this can be useful to comment out to be able to read the sources in debugger.       
                resolve();
            };
            script.onerror = function (e) {
                script.onload = script.onerror = null; // Remove these onload and onerror handlers, because these capture the inputs to the Promise and the input function, which would leak a lot of memory!       
                URL.revokeObjectURL(objectUrl); console.error("script failed to add to dom: " + e);
                reject(e.message || "(out of memory?)");
            };
            document.body.appendChild(script);
        });
    }

    Module.getPreloadedPackage = function (remotePackageName, remotePackageSize) {
        console.log("Runtime asking for remote package " + remotePackageName + ", expected size " + remotePackageSize + "bytes.");
        return Module["downloadedData"];
    };
    download("realbim.data").then(function (data) {
        console.log("downloaded data file");
        Module.manuallyDownloadedData = 1;
        Module["downloadedData"] = data;
        download("realbim.js").then(function (data) {
            console.log("downloaded js file");
            addScriptToDom(data);
        });
    });
};