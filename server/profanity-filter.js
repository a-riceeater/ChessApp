function filterProfanity(sentence, callback) {
    const words = sentence.split(" ");
    var sentence = '';
    for (let i = 0; i < words.length; i++) {
        var word = words[i]; 
        switch (word.toLowerCase()) {
            case "fuck":
                word = "f***"
                break;
            case "shit":
                word = "sh**"
                break;
            case "kys":
                word = "kys"
                break;
            case "fucking":
                word = "f*****";
                break;
            case "shitty":
                word = "s****";
                break;
        }        
        sentence += " " + word;
        callback(sentence);
    }
}

export default { filterProfanity };
// module.exports = { filterProfanity };