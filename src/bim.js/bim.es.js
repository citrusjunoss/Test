class Bim {
    #canvas = null;
    #downloadedData = null
    #mainScriptUrlOrBlob = null
    constructor(element) {
        this.canvas = element
    }

    async init() {
        try {
            const data = await this.download("realbim.data")
            this.manuallyDownloadedData = 1;
            this.downloadedData = data;
            const realData = await this.download('realbim.js')
            console.log("download js file")
            this.addScriptToDom(realData)
        } catch (error) {
           console.log(error)
        }
    }

    locateFile(path) {
        return window.top.location.origin + "/file/" + path;
    }

    getPreloadedPackage() {
        return this.downloadedData
    }

    #download(path){
        return new Promise((resolve, reject) => {
            var newUrl = "";
            if (this.locateFile) {
                newUrl = this.locateFile(path, "");
                console.log("newUrl", newUrl);
            }
            var xhr = new XMLHttpRequest();
            xhr.open("GET", newUrl, true);
            xhr.responseType = "arraybuffer";
            xhr.onload = function () {
                 resolve(xhr.response); 
            };
            xhr.onerror = function (e) { reject(e); };
            xhr.send(null);
        });
    }

    #addScriptToDom (scriptCode) {
        return new Promise((resolve, reject) => {
            var script = document.createElement("script");
            var blob = new Blob([scriptCode], { type: "application/javascript" });
            var objectUrl = URL.createObjectURL(blob);
            script.src = objectUrl;
            script.onload = function () {
                console.log("added js script to dom");
                script.onload = script.onerror = null; // Remove these onload and onerror handlers, because these capture the inputs to the Promise and the input function, which would leak a lot of memory!        
                this.mainScriptUrlOrBlob = blob;
                URL.revokeObjectURL(objectUrl); // Free up the blob. Note that for debugging purposes, this can be useful to comment out to be able to read the sources in debugger.       
                resolve();
            };
            script.onerror = function (e) {
                script.onload = script.onerror = null; // Remove these onload and onerror handlers, because these capture the inputs to the Promise and the input function, which would leak a lot of memory!       
                URL.revokeObjectURL(objectUrl); 
                console.error("script failed to add to dom: " + e);
                reject(e.message || "(out of memory?)");
            };
            document.body.appendChild(script);
        });
    }


}