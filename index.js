const fs = require("fs");
const socket = require('socket.io-client')('http://gameinc.io');

const words = fs.readFileSync("words.txt", "utf8").split(" ");
let known_letters = [];

const username = "hangman"

const new_word = () => words[Math.floor(Math.random() * words.length)];

function pretty_word() {
  const output = [];
  for (letter of word){
    if (known_letters.includes(letter)){
      output.push(letter);
    } else {
      output.push(" _ ");
    }
  }
  return output.join("");
}

let word = new_word();

socket.on('connect', () => {
  console.log(word)
  console.log("connected");
  socket.emit("start company", username);

  socket.on("message", data => {
    console.log(data.msg)
    if (data.msg.length == 1) {
      const letter = data.msg
      if(word.includes(letter) && pretty_word() != word){
        known_letters.push(letter);
      }
      if (pretty_word() == word){
        socket.emit("new message", "You Win: " + pretty_word());
      } else {
        socket.emit("new message", pretty_word());
      }
    } else if (data.msg == "new game"){
      known_letters = [];
      word = new_word();
      socket.emit("new message", "Game Started: " + pretty_word());
    } else if (data.special && data.msg == "You have been muted from chat.") {
      socket.disconnect();
      socket.connect()
    }
  })
});
