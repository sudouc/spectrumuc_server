var Twit = require('twit')
var fs = require("fs");
var Color = require("color")
var express = require('express');
var app = express();

console.log("\n *START* \n");

/*  ==========================================
 *   Temporary data holder
 *  ========================================== */

var data = [
    {
        id: '1A1',
        color: Color("blue")
    },
    {
        id: '1B1',
        color: Color("red")
    }
]

/*  ==========================================
 *   Twitter parser
 *  ========================================== */
var config = JSON.parse(fs.readFileSync("oauth.json"));
var Twit = new Twit(config)


//
//  Filter the twitter public stream by the hashtag '#spectrumuc'.
//
var stream = Twit.stream('statuses/filter', { track: '#spectrumuc' })
// Register a callback for each streamed tweet
stream.on('tweet', newTweet);

function newTweet(tweet) {

    var res = tweet.text.split(" ");
    var submission = {
        id: undefined,
        color: undefined
    };

    // check color is a valid CSS color
    try {
        submission.color = Color(res[2]);
    } catch (exception) {
        // error parsing color so we're done with this
        console.log("error parsing color, not a color");
        return;
    }

    // Get entry for that id
    var entry = data.find(function(element, index, array) {
        if(res[1].toUpperCase() === element.id){
            return true
        }
        return false;
    });

    if (entry) {
        // if there is an entry for that entry, modify it
        entry.color = submission.color;
        console.log("Updated: " + JSON.stringify(entry));
    } else {
        // id doesn't exist so we're done here
        console.log("error validating id, not a registered id");
        return;
    }

}


/*  ==========================================
 *   GET api/:id/color requests
 *  ========================================== */
app.get('/api/:id/color', function (req, res) {
    // Todo build in a time limit so we don't get DDOSed as easily

    // Get entry with that id
    var entry = data.find(function(element, index, array) {
        if(req.params.id.toUpperCase() === element.id){
            return true
        }
        return false;
    });
    if (entry){
        // Return the id and color
        res.end(JSON.stringify(entry));
    } else {
        // Error the response
        res.status(404);
        res.end("four OH four");
    }
});

/*  ==========================================
 *   GET /:id/color requests
 *   This just gives back a colored webpage
 *  ========================================== */
app.get('/:id/color', function (req, res) {
    // Todo build in a time limit so we don't get DDOSed as easily

    // Get entry with that id
    var entry = data.find(function(element, index, array) {
        if(req.params.id.toUpperCase() === element.id){
            return true
        }
        return false;
    });
    if (entry){
        var html = `
        <html>
        <head>
            <style>
            html {
                background-color:` + entry.color.hexString() + `;
                color: lightsteelblue;
                font-family: "Helvertica Neue", sans-serif;
            }
            </style>
            <title>SpectrumUC:</title>
        </head>
        <body><h1>SpectrumUC: ` + entry.id + `</h1></body>
        </html>`

        // Return the id and color
        res.end(html);
    } else {
        // Error the response
        res.status(404);
        res.end("four OH four");
    }
})

/*  ==========================================
 *   I'm a teapot
 *  ========================================== */
app.get('/brew', function (req, res) {
    res.status('418');
    res.end("I'm a teapot");
});

/*  ==========================================
 *   Return 404 for everything else
 *  ========================================== */
app.get('/*', function (req, res) {
    res.status('404');
    res.end("four OH four");
});

var server = app.listen(8081, function () {

   var host = server.address().address
   var port = server.address().port

   console.log("APP Listening on http://%s:%s", host, port)

});