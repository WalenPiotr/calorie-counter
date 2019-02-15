var express = require("express");
var app = express();
app.use(express.static("dist"));

app.get("*", function(request, response) {
    response.sendfile("dist/index.html");
});

var port = process.env.PORT || 8081;
app.listen(port, function() {
    console.log("Listening on " + port);
});
