var fs = require("fs");
var ws = require("ws");
var http = require("http");

var config = {
  "port": 8000,
  "running_text": "Server is running on port 8000"
}


function get_file(link) {
  try {
    const data = fs.readFileSync(link, "utf8");
    return data
  }
  catch (err) {
    console.error(err);
    return
  }
}

var song_list = JSON.parse(get_file("songs/songs.json"));
//console.dir(song_list);

var sockets = {}

const wss = new ws.Server({ port: config.port });

wss.on("connection", socket => {
    console.log("new client connected");
    socket.on("message", data => {
        if (data == "obs_part") {
          console.log("the obs part has connected");
          sockets.obs_part = socket;
        }
        else if (data == "controller") {
          console.log("the controller has connected");
          sockets.controller = socket;
          socket.send(JSON.stringify(song_list));
        }
        else if (data == "pause") {
          sockets.obs_part.send("pause");
          //console.dir(sockets.obs_part)
        }
        else if (data == "play") {
          sockets.obs_part.send("play");
        }
        else if (data== "load") {
          sockets.obs_part.send("load");
        }
        //at this point, assume it is an object
        else {
          let data_ob = JSON.parse(data);
          //console.log("a");
          //console.dir(data_ob);
          if (data_ob[0] === "change_song") {
            //console.log("b");
            let song_data = {}
            song_list.songs.forEach(function(x) {
              if (x.name == data_ob[1]) {
                song_data = x;
              }
            });
            //console.log("change song to ", song_data);
            sockets.obs_part.send(JSON.stringify(["change_song", song_data]));
          }
        }
    });
    socket.on("close", () => {
        console.log("the client has connected");
    });
    socket.onerror = function () {
        console.log("Some Error occurred")
    }
});

/*http.createServer(function (req, res) {
  fs.readFile(__dirname + req.url, function (err,data) {
    console.log(req.url);
    if (err) {
      res.writeHead(404);
      res.end(JSON.stringify(err));
      return;
    }
    res.writeHead(200);
    res.end(data);
    console.log("done sending");
    console.flush();
  });
}).listen(8080);*/

console.log(config.running_text);


//WHYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
